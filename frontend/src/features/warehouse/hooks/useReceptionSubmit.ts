import { useState, useCallback } from 'react'
import type { BaleRow, TruckReceptionFormData, CreateReceptionPayload } from '../types/reception-types'
import { createReception } from '../api/receptionApi'

interface UseReceptionSubmitReturn {
  submit: (formValues: TruckReceptionFormData, rows: BaleRow[], onSuccess?: () => void) => Promise<void>
  submitting: boolean
  error: string | null
  clearError: () => void
}

export function useReceptionSubmit(): UseReceptionSubmitReturn {
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const submit = useCallback(async (formValues: TruckReceptionFormData, rows: BaleRow[], onSuccess?: () => void) => {
    const payload: CreateReceptionPayload = {
      truck_license_plate: formValues.truckLicensePlate,
      carrier: formValues.carrier,
      material_code: formValues.materialCode,
      lot_code: formValues.lotCode,
      bales: rows.map((r) => ({
        bale_code: r.baleCode,
        material_code: r.materialCode,
        gross_weight_kg: r.grossWeight,
        tares_kg: r.tares,
        net_weight_kg: r.netWeight,
        lot_code: r.lotCode,
        observations: r.observations || undefined,
      })),
    }

    setSubmitting(true)
    setError(null)
    try {
      await createReception(payload)
      onSuccess?.()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error desconocido')
    } finally {
      setSubmitting(false)
    }
  }, [])

  const clearError = useCallback(() => setError(null), [])

  return { submit, submitting, error, clearError }
}
