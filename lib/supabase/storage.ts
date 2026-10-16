import { createServerClient } from './server';

/**
 * ストレージ管理モジュール
 *
 * このモジュールはSupabase Storageを利用した画像ファイルの
 * アップロードと削除機能を提供します。主にリスティング画像の
 * 管理に使用されます。
 */

const STORAGE_BUCKET = 'listing-images';

/**
 * 画像をSupabase Storageにアップロードし、公開URLを返す
 */
export const uploadListingImage = async (file: File, userId: string) => {
  const supabase = await createServerClient();

  // ファイル名の衝突を防ぐためにユニークなファイル名を生成
  const fileExt = file.name.split('.').pop();
  const fileName = `${crypto.randomUUID()}.${fileExt}`;
  const filePath = `${userId}/${fileName}`;

  // ファイルをSupabase Storageにアップロード
  const { error } = await supabase.storage
    .from(STORAGE_BUCKET)
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
    });

  if (error) {
    console.error('Error uploading image:', error);
    throw new Error(`Error uploading image: ${error.message}`);
  }

  // 公開URLを取得
  const {
    data: { publicUrl },
  } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(filePath);

  return publicUrl;
};

/**
 * 複数の画像をSupabase Storageにアップロードする
 */
export const uploadMultipleListingImages = async (
  files: File[],
  userId: string
) => {
  return Promise.all(files.map((file) => uploadListingImage(file, userId)));
};

/**
 * Supabase Storageから画像を削除する
 */
export const deleteListingImage = async (url: string) => {
  const supabase = await createServerClient();

  // 公開URLからパスを抽出
  const bucketBaseUrl = supabase.storage.from(STORAGE_BUCKET).getPublicUrl('')
    .data.publicUrl;
  const filePath = url.replace(bucketBaseUrl, '');

  const { error } = await supabase.storage
    .from(STORAGE_BUCKET)
    .remove([filePath]);

  if (error) {
    console.error('Error deleting image:', error);
    throw new Error(`Error deleting image: ${error.message}`);
  }

  return true;
};
