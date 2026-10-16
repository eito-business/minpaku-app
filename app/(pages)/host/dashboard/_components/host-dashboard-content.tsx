import { Calendar, ChevronRight, Plus, Home, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import Link from 'next/link';
import Image from 'next/image';
import { format } from 'date-fns';
import { parseDateRange } from '@/lib/supabase/utils/date-range-parser';
import type { HostListingWithDetails } from '@/lib/supabase/database/listings';
import { Tables } from '@/lib/supabase/types/database.types';

type ReservationWithListingTitle = Tables<'reservations'> & {
  listingTitle: string;
};

interface HostDashboardContentProps {
  upcomingReservations: ReservationWithListingTitle[];
  hostListings: HostListingWithDetails[];
}

export default function HostDashboardContent({
  upcomingReservations,
  hostListings,
}: HostDashboardContentProps) {
  return (
    <div className='flex-1 container'>
      {/* ダッシュボードコンテンツ */}
      <div>
        <h2 className='text-2xl font-bold mb-6'>ダッシュボード</h2>

        <div className='space-y-6'>
          <Card>
            <CardHeader>
              <CardTitle>今後の予約</CardTitle>
              <CardDescription>直近の予約予定を確認できます</CardDescription>
            </CardHeader>
            <CardContent>
              {upcomingReservations.length === 0 ? (
                <div className='text-center py-6'>
                  <Calendar className='h-12 w-12 text-slate-300 mx-auto mb-3' />
                  <p className='text-slate-500'>予約はまだありません</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>物件</TableHead>
                      <TableHead>チェックイン/アウト</TableHead>
                      <TableHead>ゲスト</TableHead>
                      <TableHead className='text-right'>金額</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {upcomingReservations.slice(0, 3).map((reservation) => {
                      const { startDate, endDate } = parseDateRange(
                        reservation.duration as string
                      );
                      return (
                        <TableRow key={reservation.id}>
                          <TableCell className='font-medium'>
                            {reservation.listingTitle}
                          </TableCell>
                          <TableCell>
                            {startDate
                              ? format(startDate, 'yyyy年M月d日')
                              : '不明'}{' '}
                            〜{' '}
                            {endDate ? format(endDate, 'yyyy年M月d日') : '不明'}
                          </TableCell>
                          <TableCell>
                            <div className='flex items-center gap-2'>
                              <span>{reservation.guest_count}人</span>
                            </div>
                          </TableCell>
                          <TableCell className='text-right font-medium'>
                            ¥{reservation.total_price.toLocaleString()}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
            {upcomingReservations.length > 3 && (
              <CardFooter className='flex justify-end'>
                <Button variant='ghost'>
                  すべての予約を見る
                  <ChevronRight className='ml-2 h-4 w-4' />
                </Button>
              </CardFooter>
            )}
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>あなたの物件</CardTitle>
              <CardDescription>
                登録中の物件とそのパフォーマンス
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                {hostListings.map((listing, index) => {
                  // 物件の画像を取得
                  const listingImages = listing.listing_images || [];
                  return (
                    <div
                      key={listing.id}
                      className='flex gap-4 p-4 border rounded-md'
                    >
                      <div className='relative w-45 h-30'>
                        {listingImages.length > 0 ? (
                          <Image
                            src={listingImages[0].url}
                            alt={listing.title}
                            fill
                            sizes='(max-width: 768px) 180px, 120px'
                            priority={index === 0}
                            className='object-cover rounded-md'
                          />
                        ) : (
                          <div className='w-full h-full bg-gray-200 flex items-center justify-center rounded-md'>
                            <Home className='h-6 w-6 text-gray-400' />
                          </div>
                        )}
                      </div>
                      <div className='flex-1'>
                        <div className='flex items-center justify-between'>
                          <Badge className='bg-emerald-100 text-emerald-800'>
                            公開中
                          </Badge>
                          <span className='text-sm text-slate-500'>
                            {listing.category}
                          </span>
                        </div>
                        <h3 className='font-semibold mt-1 line-clamp-1'>
                          {listing.title}
                        </h3>
                        <div className='flex items-center text-sm mt-1'>
                          <Home className='h-3.5 w-3.5 mr-1 text-slate-400' />
                          <span className='text-slate-600'>
                            {listing.room_count}部屋
                          </span>
                          <span className='mx-2 text-slate-300'>|</span>
                          <Users className='h-3.5 w-3.5 mr-1 text-slate-400' />
                          <span className='text-slate-600'>
                            最大{listing.guest_count}人
                          </span>
                        </div>
                        <div className='flex justify-between items-center mt-2'>
                          <span className='font-semibold'>
                            ¥{listing.price.toLocaleString()}/泊
                          </span>
                          <Button
                            variant='ghost'
                            size='sm'
                            className='h-8 px-2'
                            asChild
                          >
                            <Link href={`/host/listings/${listing.id}/edit`}>
                              編集
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
            <CardFooter className='flex justify-center'>
              <Button asChild>
                <Link href='/host/listings/new'>
                  <Plus className='mr-2 h-4 w-4' />
                  新しい物件を登録
                </Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
