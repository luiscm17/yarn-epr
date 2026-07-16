import { useState, useCallback, useRef } from 'react'
import type { BaleRow } from '../types/reception-types'
import { emptyBale } from '../components/reception-columns'

const INITIAL_ROWS = 5
const MIN_TRAILING_EMPTY = 2

function isRowEmpty(row: BaleRow): boolean {
  return !row.baleCode && row.grossWeight === 0
}

export function useBaleGrid() {
  const [rows, setRows] = useState<BaleRow[]>(() =>
    Array.from({ length: INITIAL_ROWS }, () => emptyBale('', '')),
  )

  const formRef = useRef({ materialCode: '', lotCode: '' })

  const updateFormValues = useCallback((materialCode: string, lotCode: string) => {
    formRef.current = { materialCode, lotCode }
  }, [])

  const handleRowsChange = useCallback((newRows: BaleRow[]) => {
    const { materialCode, lotCode } = formRef.current

    // Count consecutive trailing empty rows
    let trailingEmpty = 0
    for (let i = newRows.length - 1; i >= 0; i--) {
      if (isRowEmpty(newRows[i])) {
        trailingEmpty++
      } else {
        break
      }
    }

    // Ensure at least MIN_TRAILING_EMPTY empty rows at the bottom
    let updated = newRows
    if (trailingEmpty < MIN_TRAILING_EMPTY) {
      const toAdd = MIN_TRAILING_EMPTY - trailingEmpty
      for (let i = 0; i < toAdd; i++) {
        updated = [...updated, emptyBale(materialCode, lotCode)]
      }
    }

    setRows(updated)
  }, [])

  const resetGrid = useCallback(() => {
    setRows(Array.from({ length: INITIAL_ROWS }, () => emptyBale('', '')))
  }, [])

  return { rows, handleRowsChange, updateFormValues, resetGrid }
}
