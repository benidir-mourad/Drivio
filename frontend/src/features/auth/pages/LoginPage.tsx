import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { loginSchema, type LoginFormData } from '../types'
import { useLogin } from '../hooks/useLogin'
import Button from '../../../shared/components/Button'

export default function LoginPage() {
  const { mutate: login, isPending } = useLogin()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900">Drivio</h1>
          <p className="mt-2 text-sm text-gray-600">Gestion d'auto-école</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Connexion</h2>

          <form onSubmit={handleSubmit((data) => login(data))} className="space-y-5" noValidate>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Adresse email
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                className={`w-full rounded-lg border px-3 py-2 text-sm outline-none transition focus:ring-2 focus:ring-indigo-500 ${
                  errors.email ? 'border-red-400 bg-red-50' : 'border-gray-300 bg-white'
                }`}
                {...register('email')}
              />
              {errors.email && (
                <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Mot de passe
              </label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                className={`w-full rounded-lg border px-3 py-2 text-sm outline-none transition focus:ring-2 focus:ring-indigo-500 ${
                  errors.password ? 'border-red-400 bg-red-50' : 'border-gray-300 bg-white'
                }`}
                {...register('password')}
              />
              {errors.password && (
                <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>
              )}
            </div>

            <Button type="submit" loading={isPending} className="w-full" size="lg">
              Se connecter
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
