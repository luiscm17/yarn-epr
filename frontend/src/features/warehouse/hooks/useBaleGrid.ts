import { useState, useCallback } from 'react'
import type { BaleRow } from '../types/reception-types'
import { emptyBale } from '../components/reception-columns'

export function useBaleGrid() {
  const [rows, setRows] = useState<BaleRow[]>([])

  const addRow = useCallback((materialCode: string, lotCode: string) => {
    setRows((prev) => [...prev, emptyBale(materialCode, lotCode)])
  }, [])

  const clearRows = useCallback(() => setRows([]), [])

  return { rows, setRows, addRow, clearRows }
}
