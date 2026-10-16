import { useState, useEffect } from 'react';
import type { Tables } from '@/lib/supabase/types/database.types';

const MAX_IMAGES = 3;

type ListingImage = Tables<'listing_images'>;

interface UseImageUploadOptions {
  initialImages?: ListingImage[]; // 初期表示する既存画像
  onImagesChange?: (files: File[]) => void; // 画像変更時のコールバック
  maxImages?: number; // 最大アップロード可能枚数
}

/**
 * 画像アップロード機能を提供するカスタムフック
 * 画像の追加、削除、プレビュー管理などの機能を提供
 */
export function useImageUpload({
  initialImages = [],
  onImagesChange,
  maxImages = MAX_IMAGES,
}: UseImageUploadOptions = {}) {
  // 既存画像の状態管理（編集モード用）
  const [existingImages, setExistingImages] =
    useState<ListingImage[]>(initialImages);
  // 新規アップロード画像のプレビュー用URL
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  // 新規アップロード画像のファイル
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  // 削除対象の既存画像ID
  const [imagesToDelete, setImagesToDelete] = useState<string[]>([]);

  // 現在の画像の総数（既存 + 新規）
  const totalCurrentImageCount = existingImages.length + imageFiles.length;

  /**
   * 画像ファイル追加時のハンドラー
   * 選択された画像をバリデーションし、状態を更新
   */
  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    const newFiles = Array.from(files);
    const potentialTotal = totalCurrentImageCount + newFiles.length;

    // 最大画像数チェック
    if (potentialTotal > maxImages) {
      console.error(`Cannot upload more than ${maxImages} images.`);
      event.target.value = '';
      return;
    }

    // 新しい画像ファイルを追加
    const currentFiles = [...imageFiles, ...newFiles];
    // 古いプレビューURLを解放
    imagePreviews.forEach(URL.revokeObjectURL);
    // 新しいプレビューURLを生成
    const currentPreviews = currentFiles.map((file) =>
      URL.createObjectURL(file)
    );

    setImageFiles(currentFiles);
    setImagePreviews(currentPreviews);
    onImagesChange?.(currentFiles);
  };

  /**
   * 指定されたインデックスの画像を削除
   */
  const removeImage = (indexToRemove: number) => {
    const urlToRemove = imagePreviews[indexToRemove];
    // 削除対象以外の画像を抽出
    const updatedFiles = imageFiles.filter(
      (_, index) => index !== indexToRemove
    );
    // 古いプレビューURLを解放
    imagePreviews.forEach(URL.revokeObjectURL);
    // 新しいプレビューURLを生成
    const updatedPreviews = updatedFiles.map((file) =>
      URL.createObjectURL(file)
    );

    setImageFiles(updatedFiles);
    setImagePreviews(updatedPreviews);
    onImagesChange?.(updatedFiles);

    // 不要になったURLを解放
    URL.revokeObjectURL(urlToRemove);
  };

  /**
   * 既存画像を削除としてマーク（表示から除外）
   */
  const markExistingImageForDeletion = (imageId: string) => {
    setExistingImages(existingImages.filter((img) => img.id !== imageId));
    setImagesToDelete([...imagesToDelete, imageId]);
  };

  // コンポーネントのクリーンアップ時にURL.revokeObjectURLを呼び出す
  useEffect(() => {
    return () => {
      // 全てのプレビューURLを解放
      imagePreviews.forEach(URL.revokeObjectURL);
    };
  }, [imagePreviews]);

  return {
    existingImages,
    imagePreviews,
    imageFiles,
    imagesToDelete,
    totalCurrentImageCount,
    handleImageChange,
    removeImage,
    markExistingImageForDeletion,
  };
}
