'use client';
import { useState } from 'react';
import { Bid } from '@/common/models/bid';
import { BidFormData, bidSchema } from '@/common/schemas/bidSchema';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useUpsertBid } from '@/common/hooks/bid/useUpsertBid';

interface BidModalProps {
    collectionId: string;
    initialData?: Bid | null;
    onClose: () => void;
    onSuccess: (bid?: Bid, updatedBid?: Partial<Bid>) => void;
}

export default function BidModal({
  collectionId,
  initialData = null,
  onClose,
  onSuccess,
}: BidModalProps) {
  const { upsertBid, loading: upsertLoading } = useUpsertBid(initialData?.id);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const defaultValues = {
    collectionId,
    price: initialData?.price ?? 0,
  };

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<BidFormData>({
    resolver: zodResolver(bidSchema),
    defaultValues,
  });

  const onSubmit = async (data: BidFormData) => {
    try {
      setFetchError(null);
      
      const submitData: BidFormData = {
        collectionId,
        price: Number(data.price),
      };
      
      if (initialData) {
        // For edits, pass the updated bid data immediately
        const updatedBidData = {
          price: submitData.price,
          // Keep other properties the same
        };
      
        onSuccess(undefined, updatedBidData);
      } else {
        // For new bids, create optimistic bid
        const optimisticBid: Bid = {
          id: Date.now(),
          price: submitData.price,
          status: 'PENDING',
          collectionId: submitData.collectionId,
          userId: 'temp-user',
          user: {
            id: 'temp',
            name: 'You',
            email: 'temp@temp.com'
          }
        };
        
        onSuccess(optimisticBid);
      }
      
      // Then make the API call
      await upsertBid(submitData);
      
      onClose();
    } catch (error) {
      
      let errorMessage = 'Unknown error occurred';
      
      if (error instanceof Error) {
        if (error.message.includes('You already have a pending bid')) {
          errorMessage = 'You already have a pending bid on this collection. Please edit or cancel your existing bid first.';
        } else if (error.message.includes('cannot bid on own collection')) {
          errorMessage = 'You cannot bid on your own collection.';
        } else {
          errorMessage = error.message;
        }
      }
      
      setFetchError(errorMessage);
    }
  };

  const isLoading = isSubmitting || upsertLoading;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white rounded-lg shadow-lg p-6 w-full max-w-sm space-y-4"
      >
        <h3 className="text-xl font-semibold">
          {initialData ? 'Edit Bid' : 'New Bid'}
        </h3>

        <div>
          <label htmlFor="price" className="block mb-1 font-medium">
            Price
          </label>
          <input
            id="price"
            type="number"
            step="0.01"
            min="0"
            {...register('price', { valueAsNumber: true })}
            className="w-full border rounded px-3 py-2 focus:outline-none focus:ring"
            disabled={isLoading}
          />
          {errors.price && (
            <p className="text-red-600 text-sm mt-1">
              {errors.price.message}
            </p>
          )}
        </div>

        {fetchError && (
          <p className="text-red-600 text-sm">{fetchError}</p>
        )}

        <div className="flex justify-end space-x-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border rounded hover:bg-gray-100"
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
            disabled={isLoading}
          >
            {isLoading
              ? initialData
                ? 'Updating...'
                : 'Submitting...'
              : initialData
              ? 'Update'
              : 'Submit'}
          </button>
        </div>
      </form>
    </div>
  );
}