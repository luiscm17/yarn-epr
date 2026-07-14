import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

const titles: Record<string, string> = {
  '/warehouse/reception': 'Recepción de fardos',
  '/warehouse/identity': 'Identidad de producción',
  '/warehouse/issue': 'Emisión a Operación',
  '/warehouse/finished-product': 'Recepción de PT',
  '/warehouse/classification': 'Clasificación / Disponibilidad',
  '/warehouse/exits': 'Salidas y devoluciones',
  '/warehouse/supplies': 'Insumos',
  '/warehouse/stock': 'Stock e historial',
  '/spinning/dashboard': 'Dashboard por sección',
  '/spinning/unloads': 'Descargas',
  '/spinning/progress': 'Avance',
  '/spinning/quality': 'Calidad de proceso',
  '/spinning/waste': 'Desperdicio',
  '/spinning/skeins': 'Disponibilidad de madejas',
  '/spinning/consolidated': 'Consolidado por turno',
  '/lots/queue': 'Cola de lotes',
  '/lots/detail': 'Detalle del lote',
  '/reports/daily': 'Consolidado diario',
  '/reports/production': 'Producción vs plan',
  '/reports/traceability': 'Trazabilidad de lote',
  '/admin/master-data': 'Datos maestros',
  '/profile': 'Mi perfil',
}

export function usePageTitle() {
  const { pathname } = useLocation()

  useEffect(() => {
    const label = titles[pathname]
    document.title = label ? `${label} — Yarn EPR` : 'Yarn EPR'
  }, [pathname])
}
