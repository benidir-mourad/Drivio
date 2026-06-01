import { useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { authApi } from '../api/authApi'
import { useAuthStore } from '../../../store/authStore'
import { homeFor } from '../../../shared/utils/roles'
import { useToast } from '../../../shared/hooks/useToast'

interface LoginForm {
  email: string
  password: string
}

export function useLogin() {
  const navigate  = useNavigate()
  const setUser   = useAuthStore((s) => s.setUser)
  const addToast  = useToast()

  return useMutation({
    mutationFn: (data: LoginForm) => authApi.login(data),
    onSuccess: ({ data }) => {
      setUser(data.data)
      const role = useAuthStore.getState().primaryRole()
      navigate(homeFor(role), { replace: true })
    },
    onError: (error: any) => {
      const code = error.response?.data?.code
      if (code === 'INVALID_CREDENTIALS') {
        addToast('Identifiants incorrects.', 'error')
      } else if (code === 'ACCOUNT_DISABLED') {
        addToast('Ce compte est désactivé.', 'error')
      } else {
        addToast('Une erreur est survenue.', 'error')
      }
    },
  })
}
