'use server';

import { auth } from '@clerk/nextjs/server';
import { revalidatePath } from 'next/cache';
import {
  createListing,
  deleteListing,
  getListingById,
  updateListing,
} from '@/lib/supabase/database/listings';
import {
  addMultipleListingImages,
  deleteListingImageRecord,
  updateImageOrders,
} from '@/lib/supabase/database/images';
import {
  deleteListingImage,
  uploadMultipleListingImages,
} from '@/lib/supabase/storage';
import { createServerClient } from '@/lib/supabase/server';
import {
  CreateListingSchema,
  UpdateListingSchema,
  ListingImageSchema,
} from '../_schemas/listing';
import {
  TablesInsert,
  TablesUpdate,
  Tables,
} from '@/lib/supabase/types/database.types';

/**
 * サーバー関数の戻り値の型定義
 * 成功時はデータを含み、失敗時はエラーメッセージとフィールドエラーを含む
 */
export type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string; fieldErrors?: Record<string, string[]> };
type ListingImage = Tables<'listing_images'>;

export async function deleteListingAction(
  listingId: string
): Promise<ActionResult<{ listingId: string; warning?: string }>> {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: 'ログインが必要です。' };
    }

    const supabase = await createServerClient();
    const { data: listing, error: listingError } = await supabase
      .from('listings')
      .select('id, listing_images(url), reservations(id)')
      .eq('id', listingId)
      .eq('user_id', userId)
      .maybeSingle();

    if (listingError) {
      console.error('Error checking listing before deletion:', listingError);
      return {
        success: false,
        error: '物件情報の確認中にエラーが発生しました。',
      };
    }

    if (!listing) {
      return {
        success: false,
        error: '物件が見つからないか、削除する権限がありません。',
      };
    }

    if (listing.reservations.length > 0) {
      return {
        success: false,
        error: '予約がある物件は削除できません。',
      };
    }

    for (const image of listing.listing_images) {
      try {
        await deleteListingImage(image.url);
      } catch (error) {
        console.error('Error deleting listing image from storage:', error);
        return {
          success: false,
          error:
            error instanceof Error
              ? `画像を削除できませんでした。Supabase Storageの削除ポリシーを確認してください。詳細: ${error.message}`
              : '画像を削除できませんでした。Supabase Storageの削除ポリシーを確認してください。',
        };
      }
    }

    await deleteListing(listingId, userId);

    revalidatePath('/host/dashboard');
    revalidatePath('/listings');
    revalidatePath(`/listings/${listingId}`);

    return { success: true, data: { listingId } };
  } catch (error) {
    console.error('Unexpected error in deleteListingAction:', error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : '物件の削除中にエラーが発生しました。',
    };
  }
}

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_IMAGES = 3;

/**
 * 新規リスティングの作成
 *
 * フォームデータを受け取り、バリデーション、画像アップロード、
 * データベースへの保存を行う一連の処理を実行します。
 *
 * @param formData - フォームで入力されたデータ
 * @returns 処理結果と作成されたリスティングID
 */
export async function createListingAction(
  formData: FormData
): Promise<ActionResult<{ listingId: string }>> {
  try {
    // 1.認証確認
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: 'ユーザーIDが見つかりません。' };
    }

    // 2.画像処理（サーバーサイドのバリデーション）
    const imageFiles = formData.getAll('images') as File[];

    const imageValidation = ListingImageSchema.safeParse(imageFiles);
    if (!imageValidation.success) {
      return {
        success: false,
        error: '画像の検証に失敗しました。',
        fieldErrors: { images: imageValidation.error.flatten().formErrors },
      };
    }
    const validatedImages = imageValidation.data;

    // 3.テキストデータ検証（サーバーサイドのバリデーション）
    const rawData = Object.fromEntries(formData.entries());
    delete rawData.images;

    const validation = CreateListingSchema.pick({
      title: true,
      description: true,
      category: true,
      location_value: true,
      price: true,
      room_count: true,
      bathroom_count: true,
      guest_count: true,
    }).safeParse(rawData);

    if (!validation.success) {
      return {
        success: false,
        error: '入力内容の検証に失敗しました。',
        fieldErrors: validation.error.flatten().fieldErrors,
      };
    }
    const validatedData = validation.data;

    // 4. ストレージに画像をアップロード
    let uploadedImageUrls: string[] = [];
    try {
      uploadedImageUrls = await uploadMultipleListingImages(
        validatedImages,
        userId
      );
    } catch (uploadError) {
      console.error('Image upload failed:', uploadError);
      return {
        success: false,
        error:
          uploadError instanceof Error
            ? uploadError.message
            : '画像のアップロード中にエラーが発生しました。',
      };
    }

    // 5. データベース保存用のリスティングデータを準備
    const listingData: TablesInsert<'listings'> = {
      ...validatedData,
      user_id: userId,
      // 数値フィールドの型変換
      price: Number(validatedData.price),
      room_count: Number(validatedData.room_count),
      bathroom_count: Number(validatedData.bathroom_count),
      guest_count: Number(validatedData.guest_count),
    };

    // 6. データベースに保存（リスティングレコードと紐付く画像レコード）
    let newListing;
    try {
      // 画像の表示順序を設定
      const imagesWithOrder = uploadedImageUrls.map((url, index) => ({
        url,
        order: index,
      }));
      newListing = await createListing(listingData, imagesWithOrder);
    } catch (dbError) {
      console.error('Database insertion failed:', dbError);
      // DBの挿入に失敗した場合のエラーハンドリング
      return {
        success: false,
        error:
          dbError instanceof Error
            ? dbError.message
            : 'データベースへの保存中にエラーが発生しました。',
      };
    }

    return { success: true, data: { listingId: newListing.id } };
  } catch (error) {
    console.error('Unexpected error in createListingAction:', error);
    return {
      success: false,
      error: '予期せぬエラーが発生しました。もう一度お試しください。',
    };
  }
}

/**
 * 既存のリスティングの編集
 *
 * 既存のリスティング情報を更新し、画像の追加・削除・並び替えを行います。
 *
 * @param listingId - 更新対象のリスティングID
 * @param formData - フォームから送信されたデータ
 * @returns 処理結果と更新されたリスティングID
 */
export async function updateListingAction(
  listingId: string,
  formData: FormData
): Promise<ActionResult<{ listingId: string }>> {
  try {
    // 1.認証と編集対象の確認
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: 'ユーザーIDが見つかりません。' };
    }

    const existingListingData = await getListingById(listingId);
    if (!existingListingData || !existingListingData.listing) {
      return { success: false, error: '物件が見つかりませんでした。' };
    }

    const existingImages = existingListingData.images;

    // 2. フォームデータの取得
    const rawData = Object.fromEntries(formData.entries());
    const newImageFiles = formData.getAll('newImages') as File[];
    const imagesToDelete = formData.getAll('deletedImageIds') as string[];

    // 3.データ検証（サーバーサイドのバリデーション）
    const validation = UpdateListingSchema.safeParse(rawData);
    if (!validation.success) {
      return {
        success: false,
        error: '入力内容の検証に失敗しました。',
        fieldErrors: validation.error.flatten().fieldErrors,
      };
    }
    const validatedData = validation.data;

    // 画像の検証（枚数、サイズ、タイプ）
    const currentImageCount = existingImages.length - imagesToDelete.length;
    const potentialNewImageCount = currentImageCount + newImageFiles.length;

    if (potentialNewImageCount > MAX_IMAGES) {
      return { success: false, error: `写真は最大${MAX_IMAGES}枚までです。` };
    }

    for (const file of newImageFiles) {
      if (file.size > MAX_FILE_SIZE) {
        return { success: false, error: `ファイルサイズは最大5MBまでです。` };
      }
      if (!file.type.startsWith('image/')) {
        return {
          success: false,
          error: '画像ファイルのみアップロードできます。',
        };
      }
    }

    // 4. 新しい画像のアップロード
    let uploadedImageUrls: string[] = [];
    if (newImageFiles.length > 0) {
      try {
        uploadedImageUrls = await uploadMultipleListingImages(
          newImageFiles,
          userId
        );
      } catch (uploadError) {
        console.error('New image upload failed:', uploadError);
        return {
          success: false,
          error:
            uploadError instanceof Error
              ? uploadError.message
              : '新しい画像のアップロード中にエラーが発生しました。',
        };
      }
    }

    // 5. 削除対象の画像を処理
    if (imagesToDelete.length > 0) {
      try {
        for (const imageId of imagesToDelete) {
          await deleteListingImageRecord(imageId);
        }
      } catch (deleteError) {
        console.error('Image deletion failed:', deleteError);
        return {
          success: false,
          error:
            deleteError instanceof Error
              ? deleteError.message
              : '画像の削除中にエラーが発生しました。',
        };
      }
    }

    // 6. データベース更新用のリスティングデータを準備
    const updateData: TablesUpdate<'listings'> = {
      ...validatedData,
      // 数値フィールドの型変換
      price: Number(validatedData.price),
      room_count: Number(validatedData.room_count),
      bathroom_count: Number(validatedData.bathroom_count),
      guest_count: Number(validatedData.guest_count),
    };

    // 7. リスティングレコードを更新
    let updatedListing;
    try {
      updatedListing = await updateListing(listingId, updateData);
    } catch (dbError) {
      console.error('Database update failed:', dbError);
      return {
        success: false,
        error:
          dbError instanceof Error
            ? dbError.message
            : 'データベースの更新中にエラーが発生しました。',
      };
    }

    // 8. 新規画像レコードをデータベースに追加
    let newlyInsertedImageRecords: ListingImage[] = [];
    if (uploadedImageUrls.length > 0) {
      try {
        newlyInsertedImageRecords = await addMultipleListingImages(
          listingId,
          uploadedImageUrls
        );
      } catch (insertError) {
        console.error('New image database insertion failed:', insertError);
        return {
          success: false,
          error:
            insertError instanceof Error
              ? insertError.message
              : '新しい画像のデータベース保存中にエラーが発生しました。',
        };
      }
    }

    // 9. すべての画像の順序を更新
    // 削除されなかった既存画像と、新しく挿入された画像を結合
    const remainingImages = existingImages.filter(
      (img) => !imagesToDelete.includes(img.id)
    );
    const allImagesToOrder = [...remainingImages, ...newlyInsertedImageRecords];

    // 結合された配列での現在のインデックスに基づいて順序の更新を作成
    const orderUpdates = allImagesToOrder.map((img, index) => ({
      id: img.id,
      order: index,
    }));

    if (orderUpdates.length > 0) {
      try {
        await updateImageOrders(orderUpdates);
      } catch (orderError) {
        console.error('Image order update failed:', orderError);
      }
    }

    console.log('Updated listing:', updatedListing);

    // 10. キャッシュを更新して最新のデータを表示
    revalidatePath(`/host/listings/${listingId}/edit`);
    revalidatePath('/host/dashboard');

    return { success: true, data: { listingId: updatedListing.id } };
  } catch (error) {
    console.error('Unexpected error in updateListingAction:', error);
    return {
      success: false,
      error: '予期せぬエラーが発生しました。もう一度お試しください。',
    };
  }
}
