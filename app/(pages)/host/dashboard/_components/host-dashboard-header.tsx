import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Calendar } from 'lucide-react';

interface HostProfile {
  name: string;
  email: string;
  avatar: string;
  joinDate: string;
}

interface HostStats {
  listingsCount: number;
  totalBookings: number;
  totalRevenue: number;
}

interface HostDashboardHeaderProps {
  profile: HostProfile;
  stats: HostStats;
}

export default function HostDashboardHeader({
  profile,
  stats,
}: HostDashboardHeaderProps) {
  return (
    <section className='bg-gray-50 py-12 border-b'>
      <div className='container mx-auto px-4 md:px-6'>
        <div className='flex flex-col md:flex-row items-start gap-6'>
          {/* ユーザーアバター */}
          <Avatar className='h-24 w-24 md:h-32 md:w-32'>
            <AvatarImage src={profile.avatar} alt={profile.name} />
            <AvatarFallback>{profile.name.charAt(0)}</AvatarFallback>
          </Avatar>

          <div className='flex-1'>
            {/* プロフィール情報 */}
            <div className='flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4'>
              <div>
                <h1 className='text-3xl font-bold'>{profile.name}</h1>
                <p className='text-slate-600'>{profile.email}</p>
                <Badge className='bg-emerald-100 text-emerald-800 mt-2'>
                  ホスト
                </Badge>
              </div>
            </div>

            {/* 参加期間 */}
            <div className='flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-slate-600'>
              <div className='flex items-center'>
                <Calendar className='mr-1 h-4 w-4' />
                {profile.joinDate}からホスト
              </div>
            </div>

            {/* 統計情報 */}
            <div className='mt-4 grid grid-cols-2 md:grid-cols-3 gap-4'>
              <div className='bg-white p-3 rounded-md shadow-sm'>
                <h3 className='text-sm font-medium text-slate-500'>
                  登録中の物件
                </h3>
                <p className='text-2xl font-bold'>{stats.listingsCount}</p>
              </div>
              <div className='bg-white p-3 rounded-md shadow-sm'>
                <h3 className='text-sm font-medium text-slate-500'>
                  今月の予約
                </h3>
                <p className='text-2xl font-bold'>{stats.totalBookings}</p>
              </div>
              <div className='bg-white p-3 rounded-md shadow-sm'>
                <h3 className='text-sm font-medium text-slate-500'>
                  今月の収益
                </h3>
                <p className='text-2xl font-bold'>
                  ¥{stats.totalRevenue.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
