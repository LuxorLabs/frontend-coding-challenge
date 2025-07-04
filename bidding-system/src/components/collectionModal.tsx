"use client";
import { useState } from "react";
import { Collection } from "@/common/models/collection";
import { useUpsertCollection } from "@/common/hooks/collection/useUpsertCollection";
import {
  CollectionFormData,
  collectionSchema,
} from "@/common/schemas/collectionSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

interface CollectionModalProps {
  initialData?: Collection | null;
  onClose: () => void;
  onSuccess: (collection?: Collection | Partial<Collection>) => void;
}

export default function CollectionModal({
  initialData = null,
  onClose,
  onSuccess,
}: CollectionModalProps) {
  const [fetchError, setFetchError] = useState<string | null>(null);
  const { upsertCollection, loading } = useUpsertCollection(initialData?.id);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CollectionFormData>({
    resolver: zodResolver(collectionSchema),
    defaultValues: {
      name: initialData?.name ?? "",
      description: initialData?.description ?? "",
      stocks: initialData?.stocks ?? 0,
      price: initialData?.price ?? 0,
    },
  });

  const onSubmit = async (data: CollectionFormData) => {
    try {
      setFetchError(null);
      
      await upsertCollection(data);    
      
      // For edits, pass the updated data. For new collections, let the parent handle it
      if (initialData) {
        onSuccess(data); // Pass the form data for optimistic update
      } else {
        onSuccess(); // New collection - will trigger refetch
      }
      
      onClose();
    } catch (error) {
      setFetchError(`Error saving collection: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md space-y-4"
      >
        <h3 className="text-xl font-semibold">
          {initialData?.id ? "Edit Collection" : "New Collection"}
        </h3>

        <div>
          <label htmlFor="name" className="block mb-1 font-medium">
            Name
          </label>
          <input
            id="name"
            {...register("name")}
            className="w-full border rounded px-3 py-2 focus:outline-none focus:ring"
            disabled={loading}
          />
          {errors.name && (
            <p className="text-red-600 text-sm mt-1">{errors.name.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="description" className="block mb-1 font-medium">
            Description
          </label>
          <textarea
            id="description"
            {...register("description")}
            className="w-full border rounded px-3 py-2 focus:outline-none focus:ring"
            disabled={loading}
          />
          {errors.description && (
            <p className="text-red-600 text-sm mt-1">
              {errors.description.message}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="stocks" className="block mb-1 font-medium">
            Stocks (qty)
          </label>
          <input
            id="stocks"
            type="number"
            {...register("stocks", { valueAsNumber: true })}
            className="w-full border rounded px-3 py-2 focus:outline-none focus:ring"
            disabled={loading}
          />
          {errors.stocks && (
            <p className="text-red-600 text-sm mt-1">{errors.stocks.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="price" className="block mb-1 font-medium">
            Price
          </label>
          <input
            id="price"
            type="number"
            step="0.01"
            {...register("price", { valueAsNumber: true })}
            className="w-full border rounded px-3 py-2 focus:outline-none focus:ring"
            disabled={loading}
          />
          {errors.price && (
            <p className="text-red-600 text-sm mt-1">{errors.price.message}</p>
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
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            disabled={loading}
          >
            {loading
              ? initialData?.id
                ? "Updating..."
                : "Creating..."
              : initialData?.id
              ? "Update"
              : "Save"}
          </button>
        </div>
      </form>
    </div>
  );
}