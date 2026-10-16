import { User, Home, Bath, Calendar, MapPin } from 'lucide-react';
import { Tables } from '@/lib/supabase/types/database.types';

interface ListingDetailsProps {
  listing: Tables<'listings'>;
  isCard?: boolean; // カード内での表示かどうかを示すオプションプロパティ
}

/**
 * リスティング詳細コンポーネント
 *
 * 物件の各種詳細情報（部屋数、バスルーム数、定員など）を表示するコンポーネントです。
 * カード内での表示とページ内での表示の両方に対応しています。
 */
const ListingDetails = ({ listing, isCard = false }: ListingDetailsProps) => {
  // カード内表示とページ内表示で共通のクラス
  const detailItemClass = isCard ? 'flex items-center' : 'flex items-center';

  return (
    <div
      className={isCard ? 'space-y-3 mb-4' : 'grid grid-cols-2 gap-y-4 mb-6'}
    >
      {/* 場所情報 */}
      <div className={detailItemClass}>
        <MapPin
          className={
            isCard
              ? 'h-4 w-4 mr-2 text-slate-600'
              : 'h-5 w-5 text-emerald-500 mr-2'
          }
          aria-hidden='true'
        />
        <span>
          {isCard ? listing.location_value : `場所：${listing.location_value}`}
        </span>
      </div>

      {/* 部屋数情報 */}
      <div className={detailItemClass}>
        <Home
          className={
            isCard
              ? 'h-4 w-4 mr-2 text-slate-600'
              : 'h-5 w-5 text-emerald-500 mr-2'
          }
          aria-hidden='true'
        />
        <span>
          {isCard
            ? `部屋 ${listing.room_count}室`
            : `部屋数：${listing.room_count}室`}
        </span>
      </div>

      {/* 定員情報 */}
      <div className={detailItemClass}>
        <User
          className={
            isCard
              ? 'h-4 w-4 mr-2 text-slate-600'
              : 'h-5 w-5 text-emerald-500 mr-2'
          }
          aria-hidden='true'
        />
        <span>
          {isCard
            ? `定員：最大${listing.guest_count}人まで`
            : `定員：最大${listing.guest_count}名`}
        </span>
      </div>

      {/* バスルーム情報 */}
      <div className={detailItemClass}>
        <Bath
          className={
            isCard
              ? 'h-4 w-4 mr-2 text-slate-600'
              : 'h-5 w-5 text-emerald-500 mr-2'
          }
          aria-hidden='true'
        />
        <span>
          {isCard
            ? `バスルーム ${listing.bathroom_count}室`
            : `バスルーム：${listing.bathroom_count}室`}
        </span>
      </div>

      {/* 料金情報（カード内表示では非表示） */}
      {!isCard && (
        <div className={detailItemClass}>
          <Calendar
            className='h-5 w-5 text-emerald-500 mr-2'
            aria-hidden='true'
          />
          <span>料金：¥{listing.price.toLocaleString()}/泊</span>
        </div>
      )}
    </div>
  );
};

export default ListingDetails;
