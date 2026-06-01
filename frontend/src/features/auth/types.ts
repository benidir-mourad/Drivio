import { z } from 'zod'

export const loginSchema = z.object({
  email:    z.string().min(1, "L'adresse email est obligatoire.").email("L'adresse email n'est pas valide."),
  password: z.string().min(1, 'Le mot de passe est obligatoire.'),
})

export type LoginFormData = z.infer<typeof loginSchema>
