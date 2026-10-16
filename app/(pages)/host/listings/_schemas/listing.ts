import { z } from 'zod';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

/**
 * 作成と更新の両方で使用される共通フィールドの検証ルールを定義
 */
const baseListingSchema = z.object({
  title: z.string().min(1, { message: 'タイトルは必須です。' }),
  description: z.string().min(1, { message: '説明は必須です。' }),
  category: z.string().min(1, { message: '物件タイプは必須です。' }),
  location_value: z.string().min(1, { message: '場所は必須です。' }),
  price: z.coerce // 文字列入力を数値に変換
    .number({ invalid_type_error: '料金は数値で入力してください。' })
    .positive({ message: '料金は0より大きい値を入力してください。' }),
  room_count: z.coerce
    .number()
    .int({ message: '部屋数は整数で入力してください。' })
    .positive({ message: '部屋数は1以上で入力してください。' }),
  bathroom_count: z.coerce
    .number()
    .int({ message: 'バスルーム数は整数で入力してください。' })
    .positive({ message: 'バスルーム数は1以上で入力してください。' }),
  guest_count: z.coerce
    .number()
    .int({ message: '最大宿泊人数は整数で入力してください。' })
    .positive({ message: '最大宿泊人数は1以上で入力してください。' }),
});

/**
 * 画像ファイル検証スキーマ
 * アップロードされる画像の数、サイズ、タイプを検証
 */
export const ListingImageSchema = z
  .array(z.instanceof(File))
  .min(1, { message: '最低1枚の写真が必要です。' })
  .max(3, { message: '写真は最大3枚までアップロードできます。' })
  .refine(
    (files) => files.every((file) => file.size <= MAX_FILE_SIZE),
    `ファイルサイズは最大5MBまでです。`
  )
  .refine(
    (files) => files.every((file) => file.type.startsWith('image/')),
    '画像ファイルのみアップロードできます。'
  );

/**
 * 新規リスティング作成用の統合スキーマ
 */
export const CreateListingSchema = baseListingSchema.extend({
  images: ListingImageSchema,
});

/**
 * リスティング更新用のスキーマ
 */
export const UpdateListingSchema = baseListingSchema;

export type CreateListingInput = z.infer<typeof CreateListingSchema>;
export type UpdateListingInput = z.infer<typeof UpdateListingSchema>;
