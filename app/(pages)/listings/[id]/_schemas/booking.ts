import * as z from 'zod';

/**
 * 日付範囲（チェックイン・チェックアウト日）と宿泊人数を検証
 */
export const bookingSchema = z.object({
  dateRange: z
    .object({
      from: z.date().optional(),
      to: z.date().optional(),
    })
    .refine((range) => range.from !== undefined && range.to !== undefined, {
      message: '滞在日程を選択してください',
      path: ['dateRange', 'from'], // エラーを'from'フィールドに表示（シンプルにするため）
    }),
  guestCount: z.string().min(1, '宿泊人数を選択してください'),
});

export type BookingFormValues = z.infer<typeof bookingSchema>;
