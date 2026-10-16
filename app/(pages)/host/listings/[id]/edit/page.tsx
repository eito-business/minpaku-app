import { auth } from '@clerk/nextjs/server';
import { notFound } from 'next/navigation';
import { getListingById } from '@/lib/supabase/database/listings';
import { BasicListingForm } from '../../_components/basic-listing-form';
import { ActionResult, updateListingAction } from '../../_actions/listings';

type EditListingPageProps = {
  params: Promise<{
    id: string;
  }>;
};

/**
 * リスティング編集ページコンポーネント
 *
 * 指定されたIDのリスティングを取得し、編集フォームを表示します。
 */
export default async function EditListingPage({
  params,
}: EditListingPageProps) {
  // ユーザー認証情報の取得
  const { userId } = await auth();
  const { id: listingId } = await params;

  // リスティングデータの取得
  let listingData;
  try {
    listingData = await getListingById(listingId);
  } catch (error) {
    console.error('Failed to fetch listing for edit:', error);
    notFound();
  }

  // リスティングが見つからない場合は404ページを表示
  if (!listingData || !listingData.listing) {
    notFound();
  }

  // 所有権チェック - 他のユーザーのリスティングは編集不可
  if (listingData.listing.user_id !== userId) {
    console.warn(
      `Unauthorized attempt to edit listing ${listingId} by user ${userId}`
    );
    notFound();
  }

  /**
   * フォーム送信ハンドラー
   * サーバー関数にフォームデータとリスティングIDを渡す
   */
  const handleFormSubmit = async (
    formData: FormData
  ): Promise<ActionResult<{ listingId: string }>> => {
    'use server';
    return await updateListingAction(listingId, formData);
  };

  return (
    <BasicListingForm
      mode='edit'
      listing={listingData.listing}
      initialImages={listingData.images}
      onSubmit={handleFormSubmit}
    />
  );
}
