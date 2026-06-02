import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useToast } from '../../../shared/hooks/useToast'
import { vehiclesApi, type VehicleListParams } from '../api/vehiclesApi'
import type { VehiclePayload } from '../types'

export function useVehicleList(params: VehicleListParams) {
  return useQuery({
    queryKey: ['vehicles', params],
    queryFn: () => vehiclesApi.list(params).then((r) => r.data),
  })
}

export function useVehicle(id: number) {
  return useQuery({
    queryKey: ['vehicles', id],
    queryFn: () => vehiclesApi.get(id).then((r) => r.data.data),
    enabled: id > 0,
  })
}

export function useCreateVehicle() {
  const qc = useQueryClient()
  const toast = useToast()
  return useMutation({
    mutationFn: (data: VehiclePayload) =>
      vehiclesApi.create(data).then((r) => r.data.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['vehicles'] })
      toast('Véhicule créé avec succès.', 'success')
    },
    onError: () => toast('Erreur lors de la création.', 'error'),
  })
}

export function useUpdateVehicle(id: number) {
  const qc = useQueryClient()
  const toast = useToast()
  return useMutation({
    mutationFn: (data: Partial<VehiclePayload>) =>
      vehiclesApi.update(id, data).then((r) => r.data.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['vehicles'] })
      toast('Véhicule mis à jour.', 'success')
    },
    onError: () => toast('Erreur lors de la mise à jour.', 'error'),
  })
}

export function useDeleteVehicle() {
  const qc = useQueryClient()
  const toast = useToast()
  return useMutation({
    mutationFn: (id: number) => vehiclesApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['vehicles'] })
      toast('Véhicule supprimé.', 'success')
    },
    onError: () => toast('Erreur lors de la suppression.', 'error'),
  })
}
