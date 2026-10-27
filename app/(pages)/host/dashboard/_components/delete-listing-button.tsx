'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { deleteListingAction } from '@/app/(pages)/host/listings/_actions/listings';

interface DeleteListingButtonProps {
  listingId: string;
  listingTitle: string;
}

export default function DeleteListingButton({
  listingId,
  listingTitle,
}: DeleteListingButtonProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleDelete = async () => {
    const confirmed = window.confirm(
      `「${listingTitle}」を削除しますか？この操作は取り消せません。`
    );
    if (!confirmed) return;

    setIsDeleting(true);
    setMessage(null);

    try {
      const result = await deleteListingAction(listingId);
      if (!result.success) {
        setMessage(result.error);
        return;
      }

      router.refresh();
    } catch (error) {
      console.error('Failed to delete listing:', error);
      setMessage('物件の削除に失敗しました。時間をおいて再度お試しください。');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div>
      <Button
        type='button'
        variant='destructive'
        size='sm'
        className='h-8 px-2'
        onClick={handleDelete}
        disabled={isDeleting}
      >
        <Trash2 className='mr-1 h-4 w-4' />
        {isDeleting ? '削除中...' : '削除'}
      </Button>
      {message && (
        <p role='alert' className='mt-2 text-sm text-red-600'>
          {message}
        </p>
      )}
    </div>
  );
}
