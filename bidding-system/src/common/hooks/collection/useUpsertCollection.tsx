import { CollectionFormData } from '@/common/schemas/collectionSchema';
import { useState, useCallback } from 'react';
import { apiClient } from '../../utils/apiClient';

type UseUpsertCollection = {
    upsertCollection: (e: CollectionFormData) => Promise<void>;
    loading: boolean;
};

export function useUpsertCollection(initialId?: number): UseUpsertCollection {
    const [loading, setLoading] = useState(false);

    const isEdit = Boolean(initialId);

    const upsertCollection = useCallback(
        async (col: CollectionFormData) => {
            setLoading(true);

            try {
                const url = isEdit
                    ? `/collections/${initialId}`
                    : '/collections';
                
                const res = isEdit 
                    ? await apiClient.patch(url, col)
                    : await apiClient.post(url, col);

                if (!res.ok) {
                    const errorText = await res.text();
                    throw new Error(`HTTP error! status: ${res.status}, message: ${errorText}`);
                }

                await res.json();

            } catch (error) {
                throw error;
            } finally {
                setLoading(false);
            }
        },
        [initialId, isEdit],
    );

    return { upsertCollection, loading };
}