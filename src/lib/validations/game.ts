import { z } from 'zod'

export const gameSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100),
  platform: z.enum(['PS5', 'PS4', 'Xbox Series X/S', 'Xbox One', 'PC', 'Nintendo Switch', 'Other']),
  condition: z.enum(['New', 'Like New', 'Good', 'Fair']),
  description: z.string().max(1000).optional(),
  images: z.array(z.string().url()).max(5, 'Maximum 5 images allowed'),
  genre: z.array(z.string()).max(5, 'Maximum 5 genres allowed')
})

export type GameFormData = z.infer<typeof gameSchema>