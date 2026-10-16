import { Plus, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Link from 'next/link';
import { format } from 'date-fns';
import { currentUser } from '@clerk/nextjs/server';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import EmptyReservations from './_components/empty-reservations';
import ReservationCard from './_components/reservation-card';
import {
  getUserReservations,
  UserReservationDetails,
} from '@/lib/supabase/database/reservations';
import { parseDateRange } from '@/lib/supabase/utils/date-range-parser';

// 終了日の取得
function getEndDateFromDuration(durationStr: string | null): Date | null {
  const { endDate } = parseDateRange(durationStr);
  return endDate;
}

export default async function UserDashboardPage() {
  const user = await currentUser();

  // ユーザーがログインしていない場合はリダイレクト
  if (!user) {
    return (
      <div>
        ログインが必要なページです。ページファイルで制御し、リダイレクトを実装できます
      </div>
    );
  }

  // 予約一覧のデータを構築
  let allReservations: UserReservationDetails[] = [];
  try {
    allReservations = await getUserReservations(user.id);
  } catch (error) {
    console.error('Failed to fetch reservations:', error);
  }

  // 将来の予約と過去の予約に分類
  const now = new Date();
  const upcomingReservations = allReservations.filter((res) => {
    const endDate = getEndDateFromDuration(res.duration as string | null);
    return endDate ? endDate >= now : false;
  });
  const pastReservations = allReservations.filter((res) => {
    const endDate = getEndDateFromDuration(res.duration as string | null);
    return endDate ? endDate < now : true;
  });

  // ユーザーのプロフィール情報
  const userProfile = {
    name: user.username ?? 'ユーザー名不明',
    email: user.emailAddresses[0].emailAddress ?? 'メールアドレス不明',
    avatar: user.imageUrl ?? '/user1.jpg',
    joinDate: user.createdAt
      ? format(new Date(user.createdAt), 'yyyy年M月') + 'に参加'
      : '参加日不明',
  };

  return (
    <div className='flex flex-col min-h-screen'>
      {/* ヘッダーセクション */}
      <section className='bg-gray-50 py-12'>
        <div className='container mx-auto px-4 md:px-6'>
          <div className='flex flex-col md:flex-row items-start gap-6'>
            <Avatar className='h-24 w-24 md:h-32 md:w-32'>
              <AvatarImage src={userProfile.avatar} alt={userProfile.name} />
              <AvatarFallback>{userProfile.name.charAt(0)}</AvatarFallback>
            </Avatar>

            <div className='flex-1'>
              <div className='flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4'>
                <div>
                  <h1 className='text-3xl font-bold'>{userProfile.name}</h1>
                  <p className='text-slate-600'>{userProfile.email}</p>
                </div>

                <div className='flex flex-wrap gap-2'>
                  <Button
                    asChild
                    variant='outline'
                    className='flex items-center'
                  >
                    <Link href='/host/dashboard'>
                      <Plus className='mr-2 h-4 w-4' />
                      <span>ホストになる</span>
                    </Link>
                  </Button>
                </div>
              </div>

              <div className='flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-slate-600'>
                <div className='flex items-center'>
                  <Calendar className='mr-1 h-4 w-4' />
                  {userProfile.joinDate}に参加
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* メインコンテンツ */}
      <section className='py-12'>
        <div className='container mx-auto px-4 md:px-6'>
          <Tabs defaultValue='upcoming'>
            <TabsList className='mb-6 bg-slate-100'>
              <TabsTrigger value='upcoming' className='flex-1'>
                予約中
              </TabsTrigger>
              <TabsTrigger value='past' className='flex-1'>
                予約履歴
              </TabsTrigger>
            </TabsList>

            {/* 予約中の宿泊施設タブ */}
            <TabsContent value='upcoming'>
              <div className='space-y-6'>
                <div className='flex justify-between items-center'>
                  <h2 className='text-2xl font-bold'>予約中の宿泊施設</h2>
                </div>

                {upcomingReservations.length === 0 ? (
                  <EmptyReservations type='upcoming' />
                ) : (
                  <div className='grid grid-cols-1 gap-6'>
                    {upcomingReservations.map((reservation) => (
                      <ReservationCard
                        key={reservation.id}
                        reservation={reservation}
                        type='upcoming'
                      />
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>

            {/* 過去の宿泊履歴タブ */}
            <TabsContent value='past'>
              <div className='space-y-6'>
                <h2 className='text-2xl font-bold'>過去の宿泊履歴</h2>

                {pastReservations.length === 0 ? (
                  <EmptyReservations type='past' />
                ) : (
                  <div className='grid grid-cols-1 gap-6'>
                    {pastReservations.map((reservation) => (
                      <ReservationCard
                        key={reservation.id}
                        reservation={reservation}
                        type='past'
                      />
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>
    </div>
  );
}
