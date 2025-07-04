import { z } from 'zod';

export const bidSchema = z.object({
  collectionId: z.string().min(1, 'Collection ID is required'),
  price: z
    .number({ invalid_type_error: 'Price must be a number' })
    .positive('Price must be greater than zero'),
});

export type BidFormData = z.infer<typeof bidSchema>;