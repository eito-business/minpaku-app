import { Plus, BarChart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import Link from 'next/link';
import { currentUser } from '@clerk/nextjs/server';
import { getHostListingsWithDetails } from '@/lib/supabase/database/listings';
import { format } from 'date-fns';
import { parseDateRange } from '@/lib/supabase/utils/date-range-parser';
import HostDashboardHeader from './_components/host-dashboard-header';
import HostDashboardContent from './_components/host-dashboard-content';
import { Tables } from '@/lib/supabase/types/database.types';

export default async function HostDashboardPage() {
  // 認証済みユーザーを取得
  const user = await currentUser();

  if (!user) {
    return <div>ログインが必要です。</div>;
  }

  // ホストプロフィール情報を構築
  const hostProfile = {
    name:
      user.firstName && user.lastName
        ? `${user.firstName} ${user.lastName}`
        : (user.username ?? 'ゲスト'),
    email: user.emailAddresses[0]?.emailAddress ?? '',
    avatar: user.imageUrl ?? '',
    joinDate: user.createdAt
      ? format(new Date(user.createdAt), 'yyyy年M月')
      : '不明',
  };

  // ホストが掲載する物件一覧と関連情報（画像、予約）を一括で取得
  const hostListings = await getHostListingsWithDetails(user.id);

  // 予約一覧のデータを構築
  type ReservationWithListingTitle = Tables<'reservations'> & {
    listingTitle: string;
  };

  let allReservations: ReservationWithListingTitle[] = [];

  // 各物件の予約データを抽出し、リスティング情報を追加
  for (const listing of hostListings) {
    const enrichedReservations = listing.reservations.map((reservation) => ({
      ...reservation,
      listingTitle: listing.title,
    }));
    allReservations = [...allReservations, ...enrichedReservations];
  }

  // 予約を日付で並べ替え
  allReservations.sort((a, b) => {
    const dateA = parseDateRange(a.duration as string)?.startDate ?? new Date();
    const dateB = parseDateRange(b.duration as string)?.startDate ?? new Date();
    return dateA.getTime() - dateB.getTime();
  });

  // 将来の予約のみをフィルタリング
  const now = new Date();
  const upcomingReservations = allReservations.filter((reservation) => {
    const { endDate } = parseDateRange(reservation.duration as string);
    return endDate ? endDate >= now : false;
  });

  // 簡易的な収益計算
  const totalBookings = upcomingReservations.length;
  const totalRevenue = upcomingReservations.reduce(
    (sum, booking) => sum + booking.total_price,
    0
  );

  return (
    <div className='flex flex-col min-h-screen'>
      <HostDashboardHeader
        profile={hostProfile}
        stats={{
          listingsCount: hostListings.length,
          totalBookings,
          totalRevenue,
        }}
      />

      {/* メインコンテンツ */}
      <section className='py-12'>
        <div className='container mx-auto px-4 md:px-6'>
          <div className='flex mb-8'>
            {/* サイドバーメニュー（デスクトップのみ表示） */}
            <div className='hidden md:block w-64 pr-8'>
              <div className='space-y-1'>
                <h3 className='text-lg font-bold mb-4'>ホストメニュー</h3>
                <button className='w-full text-left px-4 py-2 rounded-md bg-emerald-50 text-emerald-700'>
                  <div className='flex items-center'>
                    <BarChart className='h-4 w-4 mr-2' />
                    <span>ダッシュボード</span>
                  </div>
                </button>
              </div>

              <Separator className='my-6' />

              <Button
                asChild
                className='w-full bg-emerald-500 hover:bg-emerald-600 text-white'
              >
                <Link href='/host/listings/new'>
                  <Plus className='h-4 w-4 mr-2' />
                  新しい物件を登録
                </Link>
              </Button>
            </div>

            <HostDashboardContent
              upcomingReservations={upcomingReservations}
              hostListings={hostListings}
            />
          </div>
        </div>
      </section>
    </div>
  );
}
