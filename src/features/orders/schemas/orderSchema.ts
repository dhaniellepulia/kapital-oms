import { z } from 'zod'

export const orderSchema = z.object({
  itemName: z.string().min(1, 'Item name is required'),
  quantity: z.coerce
    .number({ message: 'Quantity is required' })
    .int('Must be a whole number')
    .min(1, 'At least 1'),
  capital: z.coerce.number().min(0, 'Cannot be negative'),
  sellingAmount: z.coerce.number().min(0, 'Cannot be negative'),
  deliveryFee: z.coerce.number().min(0, 'Cannot be negative'),
  paymentDate: z.string().min(1, 'Payment date is required'),
  notes: z.string().optional(),
})

export type OrderFormValues = z.infer<typeof orderSchema>
