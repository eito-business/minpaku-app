"use server";
 
/**
 * リスティング画像管理モジュール
 *
 * このモジュールは物件リスティングに関連する画像の操作機能を提供します。
 * Supabaseデータベースとストレージを利用して、画像の取得、追加、更新、削除、
 * および順序変更などの操作を行います。
 */
 
import { createServerClient } from "../server";
import { deleteListingImage as deleteImageFromStorage } from "../storage";
import { Tables, TablesInsert, TablesUpdate } from "../types/database.types";
 
type ListingImage = Tables<"listing_images">;
type NewListingImage = TablesInsert<"listing_images">;
type UpdateListingImage = TablesUpdate<"listing_images">;
 
/**
 * 特定のリスティングに関連するすべての画像を取得する
 */
export const getListingImages = async (listingId: string) => {
  const supabase = await createServerClient();
 
  const { data, error } = await supabase
    .from("listing_images")
    .select("*")
    .eq("listing_id", listingId)
    .order("order", { ascending: true }); // 画像を順序通りに表示するため昇順で取得
 
  if (error) {
    console.error("Error fetching listing images:", error);
    throw new Error(`Error fetching listing images: ${error.message}`);
  }
 
  return data as ListingImage[];
};
 
/**
 * リスティングに新しい画像を1枚追加する
 */
export const addListingImage = async (image: NewListingImage) => {
  const supabase = await createServerClient();
 
  const { data, error } = await supabase
    .from("listing_images")
    .insert(image)
    .select()
    .single();
 
  if (error) {
    console.error("Error adding listing image:", error);
    throw new Error(`Error adding listing image: ${error.message}`);
  }
 
  return data as ListingImage;
};
 
/**
 * リスティングに複数の画像を一度に追加する
 */
export const addMultipleListingImages = async (
  listingId: string,
  imageUrls: string[]
) => {
  const supabase = await createServerClient();
 
  // 画像の順序を保持するため、配列内のインデックスをorder値として使用
  const images = imageUrls.map((url, index) => ({
    listing_id: listingId,
    url,
    order: index,
  }));
 
  const { data, error } = await supabase
    .from("listing_images")
    .insert(images)
    .select();
 
  if (error) {
    console.error("Error adding multiple listing images:", error);
    throw new Error(`Error adding multiple listing images: ${error.message}`);
  }
 
  return data as ListingImage[];
};
 
/**
 * 既存の画像情報を更新する
 */
export const updateListingImage = async (
  imageId: string,
  updates: UpdateListingImage
) => {
  const supabase = await createServerClient();
 
  const { data, error } = await supabase
    .from("listing_images")
    .update(updates)
    .eq("id", imageId)
    .select()
    .single();
 
  if (error) {
    console.error("Error updating listing image:", error);
    throw new Error(`Error updating listing image: ${error.message}`);
  }
 
  return data as ListingImage;
};
 
/**
 * 画像をデータベースとストレージの両方から削除する
 */
export const deleteListingImageRecord = async (imageId: string) => {
  const supabase = await createServerClient();
 
  // 先に画像情報を取得して、ストレージから削除するためのURLを取得
  const { data: image, error: fetchError } = await supabase
    .from("listing_images")
    .select("url")
    .eq("id", imageId)
    .single();
 
  if (fetchError) {
    console.error("Error fetching image for deletion:", fetchError);
    throw new Error(`Error fetching image for deletion: ${fetchError.message}`);
  }
 
  // ストレージから画像ファイルを削除
  try {
    await deleteImageFromStorage(image.url);
  } catch (storageError) {
    console.error("Error deleting image from storage:", storageError);
  }
 
  // データベースからレコードを削除
  const { error: deleteError } = await supabase
    .from("listing_images")
    .delete()
    .eq("id", imageId);
 
  if (deleteError) {
    console.error("Error deleting image from database:", deleteError);
    throw new Error(
      `Error deleting image from database: ${deleteError.message}`
    );
  }
 
  return true;
};
 
/**
 * 複数の画像の表示順序を一括で更新する（並べ替え用）
 */
export const updateImageOrders = async (
  imageUpdates: { id: string; order: number }[]
) => {
  const supabase = await createServerClient();
 
  // 各画像を1つずつ更新して、すべての更新が確実に行われるようにする
  const results: ListingImage[] = [];
 
  for (const { id, order } of imageUpdates) {
    const { data, error } = await supabase
      .from("listing_images")
      .update({ order })
      .eq("id", id)
      .select()
      .single();
 
    if (error) {
      console.error(`Error updating image order for id ${id}:`, error);
      throw new Error(`Error updating image order: ${error.message}`);
    }
 
    results.push(data as ListingImage);
  }
 
  return results;
};