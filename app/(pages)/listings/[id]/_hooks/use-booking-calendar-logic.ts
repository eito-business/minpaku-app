import { useState } from 'react';
import { addDays, differenceInCalendarDays } from 'date-fns';
import { DateRange } from 'react-day-picker';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  createReservation,
  PostReservationParams,
  ReservationDateRange,
} from '@/lib/supabase/database/reservations';
import { Tables } from '@/lib/supabase/types/database.types';
import { bookingSchema, BookingFormValues } from '../_schemas/booking';
import { useRouter } from 'next/navigation';

interface UseBookingCalendarLogicProps {
  listing: Tables<'listings'>;
  reservations: ReservationDateRange[];
  initialGuestCount?: string;
}

/**
 * 予約カレンダーのロジックを管理するカスタムフック
 *
 * 物件予約のためのフォーム処理、日付選択、予約作成などのビジネスロジックを
 * 提供するカスタムフックです。React Hook FormとZodを使用して予約フォームを管理します。
 */
export const useBookingCalendarLogic = ({
  listing,
  reservations,
  initialGuestCount = '1',
}: UseBookingCalendarLogicProps) => {
  const [bookingStep, setBookingStep] = useState<number>(1);

  /**
   * 指定された日付が予約不可かどうかをチェックする
   *
   * 過去の日付や既に予約されている日付は選択できないようにします
   */
  const isDateDisabled = (date: Date): boolean => {
    // 過去の日付を無効化
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (date < today) {
      return true;
    }

    // 予約済み範囲内の日付を無効化
    for (const reservation of reservations) {
      const startDate = new Date(reservation.start_date);
      startDate.setHours(0, 0, 0, 0); // 開始日を正規化
      const endDate = new Date(reservation.end_date);
      endDate.setHours(0, 0, 0, 0); // 終了日を正規化

      // 日付が予約範囲内[startDate, endDate)にあるかチェック
      if (date >= startDate && date < endDate) {
        return true;
      }
    }

    return false;
  };

  // React Hook Formの設定
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    trigger,
    watch,
    setValue,
    reset,
  } = useForm<BookingFormValues>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      dateRange: { from: undefined, to: undefined },
      guestCount: initialGuestCount,
    },
  });

  const guestCount = watch('guestCount');
  const dateRange = watch('dateRange');

  /**
   * 日付範囲の選択時に、その中に既に予約された日付がないか確認します
   */
  const hasDisabledDateInRange = (startDate: Date, endDate: Date): boolean => {
    let currentDate = new Date(startDate);
    // startDateから、endDate直前までの各日をチェック
    while (currentDate < endDate) {
      if (isDateDisabled(currentDate)) {
        return true;
      }
      currentDate = addDays(currentDate, 1);
    }
    return false;
  };

  /**
   * カレンダーで日付選択時の処理
   *
   * 選択された日付範囲の妥当性を確認し、予約可能な範囲のみ設定します
   */
  const handleDateSelect = (range: DateRange | undefined) => {
    if (!range || !range.from) {
      setValue('dateRange', { from: undefined, to: undefined });
      return;
    }

    const { from, to } = range;

    if (from && to) {
      // 範囲選択の場合
      if (from.getTime() === to.getTime()) {
        // 単一日選択の場合、1泊として扱う
        const nextDay = addDays(from, 1);
        if (!hasDisabledDateInRange(from, nextDay)) {
          setValue('dateRange', { from, to: nextDay });
        } else {
          // 選択された日または翌日が予約不可の場合、toをリセット
          setValue('dateRange', { from, to: undefined });
          alert('選択された日程は予約できません。');
        }
      } else {
        // 複数日範囲の選択の場合
        if (!hasDisabledDateInRange(from, to)) {
          setValue('dateRange', { from, to });
        } else {
          // 無効な範囲選択、toをリセットしてユーザーに通知
          setValue('dateRange', { from, to: undefined });
          alert(
            '選択した範囲内には既に予約されている日付が含まれています。別の日程を選択してください。'
          );
        }
      }
    } else if (from) {
      // fromのみ選択された場合
      if (!isDateDisabled(from)) {
        setValue('dateRange', { from, to: undefined });
      } else {
        setValue('dateRange', { from: undefined, to: undefined });
        alert('選択された開始日は予約できません。');
      }
    }
  };

  /**
   * 予約手続きを続行する
   *
   * 入力フォームのバリデーションを実行し、問題なければ次のステップに進みます
   */
  const handleContinueBooking = async () => {
    const isValid = await trigger(['dateRange', 'guestCount']); // 両方のフィールドを検証
    if (isValid) {
      setBookingStep(2);
    } else {
      if (errors.dateRange?.from?.message) {
        alert(errors.dateRange.from.message);
      } else if (errors.guestCount?.message) {
        alert(errors.guestCount.message);
      }
    }
  };

  /**
   * 宿泊日数を計算する
   */
  const calculateNights = () => {
    if (dateRange?.from && dateRange?.to) {
      // 正確な泊数計算にはdifferenceInCalendarDaysを使用
      return differenceInCalendarDays(dateRange.to, dateRange.from);
    }
    return 0;
  };

  /**
   * 支払い総額を計算する
   */
  const calculatePrices = (nights: number, pricePerNight: number) => {
    return pricePerNight * nights;
  };

  const nights = calculateNights();
  const total = calculatePrices(nights, listing.price);
  const router = useRouter();

  /**
   * 予約フォーム送信処理
   *
   * フォームデータをサーバー関数に渡し、予約を確定します
   */
  const onSubmit = async (data: BookingFormValues) => {
    if (!data.dateRange.from || !data.dateRange.to) {
      alert('日付が正しく選択されていません。');
      return;
    }

    const newReservation: PostReservationParams = {
      listing_id: listing.id,
      start_date: data.dateRange.from.toISOString(),
      end_date: data.dateRange.to.toISOString(),
      guest_count: parseInt(data.guestCount, 10),
      total_price: total,
    };

    try {
      await createReservation(newReservation);
      alert('予約が完了しました！ダッシュボードページにリダイレクトします！');
      reset();
      setBookingStep(1);
      // 1.5秒後にダッシュボードページに遷移
      setTimeout(() => {
        router.push('/dashboard');
      }, 1500);
    } catch (error: unknown) {
      console.error('予約作成エラー:', error);
      if (error instanceof Error) {
        alert(`予約に失敗しました: ${error.message}`);
      } else {
        alert('予約に失敗しました。不明なエラーです。');
      }
    }
  };

  // 宿泊可能人数リストを生成
  const guestNumbers = Array.from({ length: listing.guest_count }, (_, i) =>
    (i + 1).toString()
  );

  return {
    bookingStep,
    setBookingStep,
    control,
    handleSubmit,
    errors,
    isSubmitting,
    dateRange,
    guestCount,
    handleDateSelect,
    handleContinueBooking,
    onSubmit,
    nights,
    total,
    isDateDisabled,
    guestNumbers,
  };
};
