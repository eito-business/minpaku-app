'use client';

import { format } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { DateRange } from 'react-day-picker';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Controller } from 'react-hook-form';
import { ReservationDateRange } from '@/lib/supabase/database/reservations';
import { Show, SignInButton } from '@clerk/nextjs';
import { useBookingCalendarLogic } from '../_hooks/use-booking-calendar-logic';
import { Tables } from '@/lib/supabase/types/database.types';

interface BookingCalendarProps {
  listing: Tables<'listings'>;
  reservations: ReservationDateRange[];
}

/**
 * 予約カレンダーコンポーネント
 *
 * 物件の予約フォームを提供するクライアントコンポーネントです。
 * 日付選択、ゲスト数指定、予約確認の一連のフローを管理します。
 */
const BookingCalendar = ({ listing, reservations }: BookingCalendarProps) => {
  // カスタムフックから予約ロジックを取得
  const {
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
  } = useBookingCalendarLogic({ listing, reservations });

  return (
    <Card className='border-2 border-emerald-500/10 sticky top-24'>
      <CardContent className='p-6'>
        <h3 id='booking' className='text-xl font-bold mb-4'>
          予約する
        </h3>

        {bookingStep === 1 ? (
          // 予約ステップ1: 日程と人数選択
          <div className='space-y-6'>
            {/* カレンダーセクション */}
            <div className='border rounded-lg p-4 flex flex-col items-center'>
              <h4 className='font-medium mb-2'>滞在日程を選択</h4>
              <Calendar
                mode='range'
                selected={dateRange as DateRange | undefined}
                onSelect={handleDateSelect}
                disabled={isDateDisabled}
                classNames={{
                  day_range_start: 'bg-emerald-500 text-white rounded-full',
                  day_range_end: 'bg-emerald-500 text-white rounded-full',
                  day_range_middle: 'bg-emerald-50 text-emerald-500',
                  day_selected: 'bg-emerald-500 text-white',
                  day_today: 'border border-slate-300',
                }}
              />
              {/* 日付範囲エラーの表示 */}
              {errors.dateRange?.from && (
                <p className='text-red-500 text-sm mt-1'>
                  {errors.dateRange.from.message}
                </p>
              )}
            </div>

            {/* 選択された日程の表示 */}
            {dateRange?.from && dateRange?.to && (
              <div className='bg-slate-50 p-3 rounded-md'>
                <p className='text-sm font-medium'>選択された日程:</p>
                <p className='text-sm'>
                  {format(dateRange.from, 'yyyy年MM月dd日')} から{' '}
                  {format(dateRange.to, 'yyyy年MM月dd日')} まで（{nights}泊）
                </p>
              </div>
            )}

            {/* 宿泊人数セクション */}
            <div>
              <h4 className='font-medium mb-2'>宿泊人数</h4>
              <Controller
                control={control}
                name='guestCount'
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                    disabled={isSubmitting}
                  >
                    <SelectTrigger className='w-full'>
                      <SelectValue placeholder='宿泊人数を選択' />
                    </SelectTrigger>
                    <SelectContent>
                      {guestNumbers.map((num) => (
                        <SelectItem key={num} value={num}>
                          {num}人
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {/* 宿泊人数エラーの表示 */}
              {errors.guestCount && (
                <p className='text-red-500 text-sm mt-1'>
                  {errors.guestCount.message}
                </p>
              )}
            </div>

            {/* ログイン状態に応じたボタン表示 */}
            <Show when='signed-out'>
              <SignInButton>
                <Button
                  variant='link'
                  className='w-full bg-emerald-500 hover:bg-emerald-600 text-white'
                >
                  ログインして予約する
                </Button>
              </SignInButton>
            </Show>
            <Show when='signed-in'>
              <Button
                onClick={handleContinueBooking}
                className='w-full bg-emerald-500 hover:bg-emerald-600 text-white'
                disabled={isSubmitting || !dateRange?.from || !dateRange?.to}
              >
                予約を続ける
              </Button>
            </Show>
          </div>
        ) : (
          // 予約ステップ2: 予約内容確認
          <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
            {/* 予約内容サマリー */}
            <div className='bg-slate-50 p-3 rounded-md'>
              <p className='text-sm font-medium'>予約内容:</p>
              <p className='text-sm'>
                {dateRange?.from && format(dateRange.from, 'yyyy年MM月dd日')}{' '}
                から {dateRange?.to && format(dateRange.to, 'yyyy年MM月dd日')}{' '}
                まで（{nights}泊）
              </p>
              <p className='text-sm'>ゲスト人数: {guestCount}人</p>
              <Button
                variant='link'
                className='text-xs p-0 h-auto text-emerald-500'
                onClick={() => setBookingStep(1)} // ステップ1に戻る
                disabled={isSubmitting}
              >
                変更する
              </Button>
            </div>

            <Separator />

            {/* 料金内訳 */}
            <div className='text-sm text-slate-600 space-y-1'>
              <div className='flex justify-between'>
                <span>
                  ¥{listing.price.toLocaleString()} × {nights}泊
                </span>
                <span>¥{total.toLocaleString()}</span>
              </div>
              <Separator className='my-3' />
              <div className='flex justify-between font-semibold text-black'>
                <span>合計</span>
                <span>¥{total.toLocaleString()}</span>
              </div>
            </div>

            {/* 予約確定ボタン */}
            <Button
              type='submit'
              className='w-full bg-emerald-500 hover:bg-emerald-600 text-white'
              disabled={isSubmitting}
            >
              {isSubmitting ? '予約中...' : '予約を確定する'}
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  );
};

export default BookingCalendar;
