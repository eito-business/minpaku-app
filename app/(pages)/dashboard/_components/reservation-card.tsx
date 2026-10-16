import { Calendar, Bed, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Link from 'next/link';
import Image from 'next/image';
import {
  cancelReservation,
  UserReservationDetails,
} from '@/lib/supabase/database/reservations';
import { format } from 'date-fns';
import { revalidatePath } from 'next/cache';
import { parseDateRange } from '@/lib/supabase/utils/date-range-parser';

type ReservationCardProps = {
  reservation: UserReservationDetails;
  type: 'upcoming' | 'past';
};

export default function ReservationCard({
  reservation,
  type,
}: ReservationCardProps) {
  const isPast = type === 'past';

  const { listings, total_price, guest_count, id: reservationId } = reservation;
  const { title, location_value, listing_images } = listings;
  const imageUrl = listing_images?.[0]?.url;

  const formattedDateRange = parseAndFormatDateRange(
    reservation.duration as string | null
  );

  const handleCancel = async () => {
    'use server';
    try {
      await cancelReservation(reservationId);
      revalidatePath('/dashboard');
    } catch (error) {
      console.error('Error cancelling reservation action:', error);
      const errorMessage =
        error instanceof Error ? error.message : 'An unknown error occurred';
      throw new Error(`Failed to cancel reservation: ${errorMessage}`);
    }
  };

  return (
    <Card className='overflow-hidden py-0'>
      <div className='flex flex-col md:flex-row'>
        <div className='relative w-full md:w-64 h-48 md:h-auto'>
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={title ?? 'リスティング画像'}
              fill
              className='object-cover'
              sizes='(max-width: 768px) 100vw, 256px'
            />
          ) : (
            <div className='w-full h-full bg-gray-200 flex items-center justify-center text-gray-500'>
              画像が読み込めません
            </div>
          )}
        </div>
        <div className='flex-1 p-6'>
          <div className='flex justify-between'>
            <div>
              <h3 className='text-xl font-bold mt-2'>
                {title ?? 'タイトル不明'}
              </h3>
            </div>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-3 gap-4 mt-4'>
            <div className='flex items-center'>
              <Calendar className='h-4 w-4 text-emerald-500 mr-2' />
              <span className='text-sm'>{formattedDateRange}</span>
            </div>
            <div className='flex items-center'>
              <Bed className='h-4 w-4 text-emerald-500 mr-2' />
              <span className='text-sm'>{guest_count ?? '?'}名</span>
            </div>
            <div className='flex items-center'>
              <MapPin className='h-4 w-4 text-emerald-500 mr-2' />
              <span className='text-sm'>{location_value ?? '場所不明'}</span>
            </div>
          </div>

          <div className='flex justify-between items-center mt-6'>
            <div className='font-bold'>
              ¥{(total_price ?? 0).toLocaleString()}
            </div>
            <div className='flex gap-2'>
              <Button asChild variant='outline'>
                <Link href={`/listings/${reservation.listing_id}`}>
                  詳細を見る
                </Link>
              </Button>
              {!isPast && (
                <Button onClick={handleCancel} variant='outline'>
                  キャンセルする
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}

// 人間が読みやすい形式への変換
function parseAndFormatDateRange(durationStr: string | null): string {
  if (!durationStr) return '日付不明';

  const { startDate, endDate } = parseDateRange(durationStr);

  if (!startDate || !endDate) {
    return '日付形式エラー';
  }

  return `${format(startDate, 'yyyy年M月d日')} 〜 ${format(
    endDate,
    'yyyy年M月d日'
  )}`;
}
