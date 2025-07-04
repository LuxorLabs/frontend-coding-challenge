import { z } from 'zod';

export const collectionSchema = z.object({
  id: z.number().optional(),
  name: z.string().min(1, 'O nome é obrigatório'),
  description: z.string().min(1, 'A descrição é obrigatória'),
  stocks: z
    .number({ invalid_type_error: 'Quantidade deve ser número' })
    .int('Quantidade deve ser inteiro')
    .nonnegative('Quantidade não pode ser negativa'),
  price: z
    .number({ invalid_type_error: 'Preço deve ser número' })
    .positive('Preço deve ser maior que zero'),
});

export type CollectionFormData = z.infer<typeof collectionSchema>;