import { createContext, useContext } from 'react'

export type Shift = 'A' | 'B' | 'C'

export interface BusinessState {
  shift: Shift
  businessDate: Date
}

export interface BusinessActions {
  setShift: (shift: Shift) => void
  setBusinessDate: (date: Date) => void
}

export interface BusinessContextValue {
  state: BusinessState
  actions: BusinessActions
}

export const BusinessContext = createContext<BusinessContextValue | null>(null)

export function useBusiness() {
  const ctx = useContext(BusinessContext)
  if (!ctx) {
    throw new Error('useBusiness must be used within BusinessProvider')
  }
  return ctx
}
