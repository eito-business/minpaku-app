'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tables } from '@/lib/supabase/types/database.types';
import Image from 'next/image';

interface ListingImageGalleryProps {
  images: Tables<'listing_images'>[];
  listingTitle: string;
}

/**
 * リスティング画像ギャラリーコンポーネント
 *
 * 物件の画像をカルーセル形式で表示するクライアントコンポーネントです。
 * メイン画像表示、縮小サムネイル表示、前後の画像へのナビゲーション機能を提供します。
 */
const ListingImageGallery = ({
  images,
  listingTitle,
}: ListingImageGalleryProps) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  /**
   * 前の画像に移動する
   */
  const handlePrevImage = () => {
    setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  /**
   * 次の画像に移動する
   */
  const handleNextImage = () => {
    setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  // 現在の画像を取得（可読性向上のため）
  const currentImage = images[currentImageIndex];

  return (
    <section className='py-6 md:py-8' aria-label='写真ギャラリー'>
      <div className='container mx-auto px-4 md:px-6'>
        <div className='relative'>
          {/* メイン画像表示エリア */}
          <div className='aspect-[16/9] overflow-hidden'>
            <Image
              fill
              src={currentImage.url}
              alt={`${listingTitle} - 写真 ${currentImageIndex + 1}`}
              className='w-full h-full object-cover rounded-xl'
            />
          </div>

          {/* 前の画像に移動するボタン */}
          <Button
            variant='secondary'
            size='icon'
            onClick={handlePrevImage}
            className='absolute top-1/2 left-4 transform -translate-y-1/2 rounded-full bg-white/90'
            aria-label='前の写真を表示'
          >
            <ChevronLeft className='h-4 w-4' aria-hidden='true' />
          </Button>

          {/* 次の画像に移動するボタン */}
          <Button
            variant='secondary'
            size='icon'
            onClick={handleNextImage}
            className='absolute top-1/2 right-4 transform -translate-y-1/2 rounded-full bg-white/90'
            aria-label='次の写真を表示'
          >
            <ChevronRight className='h-4 w-4' aria-hidden='true' />
          </Button>

          {/* 画像インジケーター（ドット） */}
          <div className='absolute bottom-4 left-0 right-0 flex justify-center space-x-2'>
            {images.map((_, index) => (
              <Button
                variant={'secondary'}
                key={index}
                onClick={() => setCurrentImageIndex(index)}
                className={`h-2 rounded-full transition-all ${
                  index === currentImageIndex
                    ? 'w-6 bg-white'
                    : 'w-2 bg-white/50'
                }`}
                aria-label={`写真 ${index + 1} を表示`}
                aria-current={index === currentImageIndex ? 'true' : 'false'}
              />
            ))}
          </div>
        </div>

        {/* 縮小サムネイル一覧 */}
        <div className='flex gap-2 mt-4 overflow-x-auto pb-2'>
          {images.map((image, index) => (
            <Button
              variant={'ghost'}
              key={index}
              onClick={() => setCurrentImageIndex(index)}
              className={`relative h-20 w-32 flex-shrink-0 overflow-hidden rounded-md transition-all ${
                index === currentImageIndex
                  ? 'ring-2 ring-emerald-500'
                  : 'opacity-70'
              }`}
              aria-label={`サムネイル ${index + 1}`}
              aria-current={index === currentImageIndex ? 'true' : 'false'}
            >
              <Image
                fill
                src={image.url}
                alt={`${listingTitle} - サムネイル ${index + 1}`}
                className='w-full h-full object-cover'
              />
            </Button>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ListingImageGallery;
