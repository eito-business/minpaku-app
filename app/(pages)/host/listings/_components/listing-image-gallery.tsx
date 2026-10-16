import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Image from 'next/image';
import { ImagePlus, X } from 'lucide-react';
import type { Tables } from '@/lib/supabase/types/database.types';

type ListingImage = Tables<'listing_images'>;

interface ListingImageGalleryProps {
  existingImages?: ListingImage[]; // 既存の画像データ（編集時）
  imagePreviews: string[]; // 新しくアップロードされた画像のプレビューURL
  totalCurrentImageCount: number; // 現在の総画像数
  maxImages?: number; // 最大アップロード可能枚数
  onExistingImageDelete?: (imageId: string) => void; // 既存画像削除時のコールバック
  onNewImageDelete?: (index: number) => void; // 新規画像削除時のコールバック
  onImageAdd?: (e: React.ChangeEvent<HTMLInputElement>) => void; // 画像追加時のコールバック
}

export function ListingImageGallery({
  existingImages = [],
  imagePreviews,
  totalCurrentImageCount,
  maxImages = 3,
  onExistingImageDelete,
  onNewImageDelete,
  onImageAdd,
}: ListingImageGalleryProps) {
  return (
    <div className='space-y-4'>
      <div className='flex items-center'>
        <Label
          htmlFor='image-upload'
          className='text-gray-700 font-medium text-lg'
        >
          物件の写真 *
        </Label>
        <span className='ml-2 text-sm text-gray-500'>(最大{maxImages}枚)</span>
      </div>
      <div className='grid grid-cols-2 md:grid-cols-4 gap-4 mt-2'>
        {/* 既存の画像表示 */}
        {existingImages.map((image, index) => (
          <div
            key={image.id}
            className='relative aspect-square rounded-lg overflow-hidden group shadow-sm border border-gray-200'
          >
            <Image
              src={image.url}
              alt={`既存の物件写真 ${index + 1}`}
              fill
              className='object-cover'
              priority={index === 0}
              sizes='(max-width: 768px) 50vw, 25vw'
            />
            <Button
              type='button'
              variant='destructive'
              size='icon'
              className='absolute top-2 right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity shadow-md'
              onClick={() => onExistingImageDelete?.(image.id)}
              aria-label={`既存の写真 ${index + 1} を削除`}
            >
              <X className='h-4 w-4' />
            </Button>
          </div>
        ))}

        {/* 新しく追加した画像のプレビュー */}
        {imagePreviews.map((previewUrl, index) => (
          <div
            key={`new-${index}`}
            className='relative aspect-square rounded-lg overflow-hidden group shadow-sm border border-gray-200'
          >
            <Image
              src={previewUrl}
              alt={`新しい写真のプレビュー ${index + 1}`}
              fill
              className='object-cover'
              sizes='(max-width: 768px) 50vw, 25vw'
            />
            <Button
              type='button'
              variant='destructive'
              size='icon'
              className='absolute top-2 right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity shadow-md'
              onClick={() => onNewImageDelete?.(index)}
              aria-label={`新しい写真 ${index + 1} を削除`}
            >
              <X className='h-4 w-4' />
            </Button>
          </div>
        ))}

        {/* 画像追加ボタン（最大枚数に達していない場合のみ表示） */}
        {totalCurrentImageCount < maxImages && (
          <Label
            htmlFor='image-upload'
            className='aspect-square border-2 border-dashed border-emerald-300 rounded-lg flex flex-col items-center justify-center hover:bg-emerald-50 cursor-pointer transition-colors'
            aria-label='写真を追加'
          >
            <ImagePlus
              className='h-8 w-8 text-emerald-500'
              aria-hidden='true'
            />
            <span className='text-sm text-emerald-600 font-medium mt-2'>
              写真を追加
            </span>
            <Input
              id='image-upload'
              type='file'
              accept='image/*'
              multiple
              className='hidden'
              onChange={onImageAdd}
              aria-describedby='image-constraints'
            />
          </Label>
        )}
      </div>
      <p id='image-constraints' className='sr-only'>
        最大{maxImages}枚まで、画像ファイルのみアップロードできます。
      </p>
    </div>
  );
}
