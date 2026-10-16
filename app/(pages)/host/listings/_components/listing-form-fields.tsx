import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { MapPin, Home, Bath, Users } from 'lucide-react';
import type {
  UseFormRegister,
  FieldErrors,
  UseFormSetValue,
  UseFormWatch,
} from 'react-hook-form';
import type {
  CreateListingInput,
  UpdateListingInput,
} from '../_schemas/listing';

type ListingFormData = CreateListingInput | UpdateListingInput;

/**
 * react-hook-formの関数を受け取り、フォーム操作を行います
 */
interface ListingFormFieldsProps {
  register: UseFormRegister<ListingFormData>;
  errors: FieldErrors<ListingFormData>;
  setValue: UseFormSetValue<ListingFormData>;
  watch: UseFormWatch<ListingFormData>;
}

export function ListingFormFields({
  register,
  errors,
  setValue,
  watch,
}: ListingFormFieldsProps) {
  return (
    <>
      {/* 物件の基本情報セクション */}
      <div className='space-y-6'>
        {/* カテゴリー選択 */}
        <div className='space-y-2'>
          <Label htmlFor='category' className='text-gray-700 font-medium'>
            物件タイプ *
          </Label>
          <Select
            onValueChange={(value) =>
              setValue('category', value, { shouldValidate: true })
            }
            defaultValue={watch('category')}
          >
            <SelectTrigger
              id='category'
              className='border-gray-300 focus:ring-emerald-500'
              aria-invalid={errors.category ? 'true' : 'false'}
            >
              <SelectValue placeholder='物件タイプを選択' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='一軒家'>一軒家</SelectItem>
              <SelectItem value='マンション'>マンション</SelectItem>
              <SelectItem value='個室'>個室</SelectItem>
              <SelectItem value='ドミトリー'>ドミトリー</SelectItem>
              <SelectItem value='その他'>その他</SelectItem>
            </SelectContent>
          </Select>
          {errors.category && (
            <p className='text-red-500 text-sm mt-1' role='alert'>
              {errors.category.message}
            </p>
          )}
        </div>

        {/* タイトル入力 */}
        <div className='space-y-2'>
          <Label htmlFor='title' className='text-gray-700 font-medium'>
            タイトル *
          </Label>
          <Input
            id='title'
            {...register('title')}
            className='border-gray-300 focus:border-emerald-500 focus:ring-emerald-500'
            placeholder='魅力的なタイトルを付けましょう'
            aria-invalid={errors.title ? 'true' : 'false'}
            aria-describedby='title-error'
          />
          {errors.title && (
            <p
              id='title-error'
              className='text-red-500 text-sm mt-1'
              role='alert'
            >
              {errors.title.message}
            </p>
          )}
        </div>

        {/* 説明文入力 */}
        <div className='space-y-2'>
          <Label htmlFor='description' className='text-gray-700 font-medium'>
            物件の説明 *
          </Label>
          <Textarea
            id='description'
            {...register('description')}
            rows={5}
            className='border-gray-300 focus:border-emerald-500 focus:ring-emerald-500'
            placeholder='物件の特徴や魅力を伝えましょう'
            aria-invalid={errors.description ? 'true' : 'false'}
            aria-describedby='description-error'
          />
          {errors.description && (
            <p
              id='description-error'
              className='text-red-500 text-sm mt-1'
              role='alert'
            >
              {errors.description.message}
            </p>
          )}
        </div>

        {/* 場所情報入力 */}
        <div className='space-y-2'>
          <Label htmlFor='location_value' className='text-gray-700 font-medium'>
            場所 (市区町村) *
          </Label>
          <div className='flex items-center space-x-2 relative'>
            <div className='absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none'>
              <MapPin className='h-5 w-5 text-emerald-500' />
            </div>
            <Input
              id='location_value'
              {...register('location_value')}
              className='pl-10 border-gray-300 focus:border-emerald-500 focus:ring-emerald-500'
              placeholder='例: 東京都渋谷区'
              aria-invalid={errors.location_value ? 'true' : 'false'}
              aria-describedby='location-error'
            />
          </div>
          {errors.location_value && (
            <p
              id='location-error'
              className='text-red-500 text-sm mt-1'
              role='alert'
            >
              {errors.location_value.message}
            </p>
          )}
        </div>

        {/* 料金設定 */}
        <div className='space-y-2'>
          <Label htmlFor='price' className='text-gray-700 font-medium'>
            1泊あたりの料金（円） *
          </Label>
          <div className='flex items-center space-x-2'>
            <Input
              id='price'
              type='number'
              {...register('price', { valueAsNumber: true })}
              min='0'
              className='border-gray-300 w-1/3 focus:border-emerald-500 focus:ring-emerald-500'
              placeholder='10000'
              aria-invalid={errors.price ? 'true' : 'false'}
              aria-describedby='price-error'
            />
            <span className='text-slate-500 font-medium'>円 / 泊</span>
          </div>
          {errors.price && (
            <p
              id='price-error'
              className='text-red-500 text-sm mt-1'
              role='alert'
            >
              {errors.price.message}
            </p>
          )}
        </div>
      </div>

      {/* 物件の詳細情報セクション */}
      <div>
        <h3 className='text-lg font-medium text-gray-700 mb-4'>部屋の詳細</h3>
        <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
          {/* 部屋数選択 */}
          <div className='space-y-2'>
            <Label htmlFor='room_count' className='text-gray-700 font-medium'>
              部屋数 *
            </Label>
            <div className='flex items-center space-x-2 mt-2 relative'>
              <div className='absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none'>
                <Home className='h-5 w-5 text-emerald-500' />
              </div>
              <Select
                onValueChange={(value) =>
                  setValue('room_count', parseInt(value, 10), {
                    shouldValidate: true,
                  })
                }
                defaultValue={String(watch('room_count') ?? 1)}
              >
                <SelectTrigger
                  id='room_count'
                  className='pl-10 border-gray-300 focus:ring-emerald-500'
                  aria-invalid={errors.room_count ? 'true' : 'false'}
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                    <SelectItem key={num} value={num.toString()}>
                      {num} 部屋
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {errors.room_count && (
              <p className='text-red-500 text-sm mt-1' role='alert'>
                {errors.room_count.message}
              </p>
            )}
          </div>

          {/* バスルーム数選択 */}
          <div className='space-y-2'>
            <Label
              htmlFor='bathroom_count'
              className='text-gray-700 font-medium'
            >
              バスルーム数 *
            </Label>
            <div className='flex items-center space-x-2 mt-2 relative'>
              <div className='absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none'>
                <Bath className='h-5 w-5 text-emerald-500' />
              </div>
              <Select
                onValueChange={(value) =>
                  setValue('bathroom_count', parseInt(value, 10), {
                    shouldValidate: true,
                  })
                }
                defaultValue={String(watch('bathroom_count') ?? 1)}
              >
                <SelectTrigger
                  id='bathroom_count'
                  className='pl-10 border-gray-300 focus:ring-emerald-500'
                  aria-invalid={errors.bathroom_count ? 'true' : 'false'}
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5].map((num) => (
                    <SelectItem key={num} value={num.toString()}>
                      {num} バスルーム
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {errors.bathroom_count && (
              <p className='text-red-500 text-sm mt-1' role='alert'>
                {errors.bathroom_count.message}
              </p>
            )}
          </div>

          {/* 最大宿泊人数選択 */}
          <div className='space-y-2'>
            <Label htmlFor='guest_count' className='text-gray-700 font-medium'>
              最大宿泊人数 *
            </Label>
            <div className='flex items-center space-x-2 mt-2 relative'>
              <div className='absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none'>
                <Users className='h-5 w-5 text-emerald-500' />
              </div>
              <Select
                onValueChange={(value) =>
                  setValue('guest_count', parseInt(value, 10), {
                    shouldValidate: true,
                  })
                }
                defaultValue={String(watch('guest_count') ?? 1)}
              >
                <SelectTrigger
                  id='guest_count'
                  className='pl-10 border-gray-300 focus:ring-emerald-500'
                  aria-invalid={errors.guest_count ? 'true' : 'false'}
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 15, 20].map((num) => (
                    <SelectItem key={num} value={num.toString()}>
                      {num} 人
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {errors.guest_count && (
              <p className='text-red-500 text-sm mt-1' role='alert'>
                {errors.guest_count.message}
              </p>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
