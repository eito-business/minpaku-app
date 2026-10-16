'use server';

/**
 * 予約管理モジュール
 *
 * このモジュールはリスティングの予約に関する機能を提供します。
 * 予約の作成、取得、キャンセル、および利用可能性の確認などの操作をサポートします。
 * PostgreSQLの日付範囲型を活用して予約期間を管理しています。
 */

import { format } from 'date-fns';
import { createServerClient } from '../server';
import { Tables, TablesInsert } from '../types/database.types';
import { parseDateRange } from '../utils/date-range-parser';

type Reservation = Tables<'reservations'>;
type Listing = Tables<'listings'>;
type ListingImage = Tables<'listing_images'>;
type NewReservation = TablesInsert<'reservations'>;

export type ReservationDateRange = {
  start_date: string;
  end_date: string;
};

// ユーザー予約詳細の型定義（リスティング情報を含む）
export type UserReservationDetails = Reservation & {
  listings: Pick<
    Listing,
    'id' | 'title' | 'price' | 'location_value' | 'user_id'
  > & {
    listing_images: Pick<ListingImage, 'url'>[]; // 画像URLのみを取得
  };
};

/**
 * 特定のユーザーのすべての予約をリスティング詳細と最初の画像を含めて取得する
 */
export const getUserReservations = async (
  userId: string
): Promise<UserReservationDetails[]> => {
  const supabase = await createServerClient();

  const { data, error } = await supabase
    .from('reservations')
    .select(
      `
      *,
      listings (
        id,
        title,
        price,
        location_value,
        user_id,
        listing_images ( url )
      )
    `
    )
    .eq('user_id', userId)
    .order('created_at', { ascending: false }); // 予約作成日時で降順ソート

  if (error) {
    console.error('Error fetching user reservations:', error);
    throw new Error(`Error fetching user reservations: ${error.message}`);
  }

  // リレーションが正しく設定されていない場合や画像がない場合、
  // listingsやlisting_imagesはnullの可能性があるため、有効なデータのみをフィルタリング
  const validData = data.filter(
    (res): res is UserReservationDetails =>
      res.listings !== null && Array.isArray(res.listings.listing_images)
  );

  return validData;
};

/**
 * 特定のリスティングに対するすべての予約を取得する
 */
export const getListingReservations = async (listingId: string) => {
  const supabase = await createServerClient();

  const { data, error } = await supabase
    .from('reservations')
    .select('*')
    .eq('listing_id', listingId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching listing reservations:', error);
    throw new Error(`Error fetching listing reservations: ${error.message}`);
  }

  return data as Reservation[];
};

/**
 * 指定された日付範囲内の特定リスティングの予約を取得する
 *
 * PostgreSQLの範囲演算子を使用して、指定された日付範囲と重なる
 * 予約を検索します。結果は使いやすいように開始日と終了日の形式に変換されます。
 *
 * @param listingId リスティングID
 * @param startDate 範囲の開始日
 * @param endDate 範囲の終了日
 * @returns 指定された範囲内の予約日付を含むオブジェクトの配列
 */
export const getReservationsForListingInRange = async (
  listingId: string,
  startDate: Date,
  endDate: Date
) => {
  const supabase = await createServerClient();

  // PostgreSQL用に日付をフォーマット
  const startDateStr = startDate.toISOString();
  const endDateStr = endDate.toISOString();

  // PostgreSQLの範囲リテラル構文
  const dateRange = `[${startDateStr}, ${endDateStr})`;

  const { data, error } = await supabase
    .from('reservations')
    .select('*')
    .eq('listing_id', listingId)
    .overlaps('duration', dateRange);

  if (error) {
    console.error('Error fetching listing reservations in range:', error);
    throw new Error(
      `Error fetching listing reservations in range: ${error.message}`
    );
  }

  // durationからstart_dateとend_dateを抽出して変換
  const reservations: ReservationDateRange[] = data.map((reservation) => {
    const { startDate, endDate } = parseDateRange(
      reservation.duration as string
    );

    if (!startDate || !endDate) {
      throw new Error(`Invalid duration format: ${reservation.duration}`);
    }

    return {
      start_date: format(startDate, 'yyyy-MM-dd'),
      end_date: format(endDate, 'yyyy-MM-dd'),
    };
  });

  return reservations;
};

/**
 * リスティングが特定の日付範囲で利用可能かチェックする
 */
export const checkListingAvailability = async (
  listingId: string,
  startDate: Date,
  endDate: Date
) => {
  const supabase = await createServerClient();

  // PostgreSQL用に日付をフォーマット
  const startDateStr = startDate.toISOString();
  const endDateStr = endDate.toISOString();

  // PostgreSQLの範囲リテラル構文
  const dateRange = `[${startDateStr}, ${endDateStr})`;

  // 重複する予約をチェック
  const { data, error } = await supabase
    .from('reservations')
    .select('id')
    .eq('listing_id', listingId)
    .overlaps('duration', dateRange);

  if (error) {
    console.error('Error checking listing availability:', error);
    throw new Error(`Error checking listing availability: ${error.message}`);
  }

  // 重複する予約がなければ、リスティングは利用可能
  return data.length === 0;
};

/**
 * 予約作成用のパラメータ型定義
 *
 * PostgreSQLのduration型の代わりに、フロントエンドでの使用が
 * 容易なstart_dateとend_dateを受け取ります。
 */
export type PostReservationParams = Omit<NewReservation, 'duration'> & {
  start_date: string;
  end_date: string;
};

/**
 * 新しい予約を作成する
 *
 * まず利用可能性をチェックし、空いている場合のみ予約を作成します。
 * 日付は適切なPostgreSQL範囲形式に変換されます。
 */
export const createReservation = async (reservation: PostReservationParams) => {
  const supabase = await createServerClient();

  const { start_date, end_date, ...otherData } = reservation;

  // まず利用可能性をチェック
  const isAvailable = await checkListingAvailability(
    reservation.listing_id,
    new Date(start_date),
    new Date(end_date)
  );

  if (!isAvailable) {
    throw new Error('The listing is not available for the selected dates');
  }

  const newReservation: NewReservation = {
    ...otherData,
    duration: `[${start_date}, ${end_date})`,
  };

  // 予約を作成
  const { data, error } = await supabase
    .from('reservations')
    .insert(newReservation)
    .select()
    .single();

  if (error) {
    console.error('Error creating reservation:', error);
    throw new Error(`Error creating reservation: ${error.message}`);
  }

  return data as Reservation;
};

export const cancelReservation = async (reservationId: string) => {
  const supabase = await createServerClient();

  const { error } = await supabase
    .from('reservations')
    .delete()
    .eq('id', reservationId);

  if (error) {
    console.error('Error canceling reservation:', error);
    throw new Error(`Error canceling reservation: ${error.message}`);
  }

  return true;
};
