import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().min(1, 'El correo es requerido').email('Correo no valido'),
  password: z.string().min(1, 'La contrasena es requerida'),
})

export type LoginForm = z.infer<typeof loginSchema>
