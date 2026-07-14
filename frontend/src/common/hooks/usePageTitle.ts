import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

const routeTitles: Record<string, string> = {
  '/almacen/recepcion': 'Recepción de fardos',
  '/almacen/identidad': 'Identidad de producción',
  '/almacen/emision': 'Emisión a Operación',
  '/almacen/pt': 'Recepción de PT',
  '/almacen/clasificacion': 'Clasificación / Disponibilidad',
  '/almacen/salidas': 'Salidas y devoluciones',
  '/almacen/insumos': 'Insumos',
  '/almacen/stock': 'Stock e historial',
  '/hilatura/dashboard': 'Dashboard por sección',
  '/hilatura/descargas': 'Descargas',
  '/hilatura/avance': 'Avance',
  '/hilatura/calidad': 'Calidad de proceso',
  '/hilatura/desperdicio': 'Desperdicio',
  '/hilatura/madejas': 'Disponibilidad de madejas',
  '/hilatura/consolidado': 'Consolidado por turno',
  '/lotes/cola': 'Cola de lotes',
  '/lotes/detalle': 'Detalle del lote',
  '/reportes/diario': 'Consolidado diario',
  '/reportes/produccion': 'Producción vs plan',
  '/reportes/trazabilidad': 'Trazabilidad de lote',
  '/admin/datos-maestros': 'Datos maestros',
}

export function usePageTitle() {
  const { pathname } = useLocation()

  useEffect(() => {
    const label = routeTitles[pathname]
    document.title = label ? `${label} — Yarn EPR` : 'Yarn EPR'
  }, [pathname])
}
