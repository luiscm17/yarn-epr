# Bale Reception UI — Estructura y requerimientos

> Análisis de la pantalla de recepción de fardos: formulario de cabecera +
> grilla editable con react-data-grid, y envío batch contra FastAPI.

---

## 1. Estructura de la pantalla

La UI se divide en **dos secciones claras** verticalmente:

```
┌─────────────────────────────────────────────┐
│  Recepción de fardos  (título de página)     │
├─────────────────────────────────────────────┤
│  DATOS DEL CAMIÓN (formulario)              │
│                                             │
│  [ Proveedor    ▼ ]  [ N° Camión    ___ ]   │
│  [ Fecha         ☐ ]  [ N° Remito    ___ ]   │
│  [ N° Pedido    ___ ]  [ Partida      ___ ]   │
│  [ Observaciones                          ]  │
│  [          _______________________________]  │
├─────────────────────────────────────────────┤
│  FARDOS (grilla editable)                    │
│                                             │
│  ┌──────┬──────┬──────┬────────┬──────────┐ │
│  │ N°   │ Peso │ Peso │ Tipo   │ Observ.  │ │
│  │ fardo│ neto │ bruto│ mat.   │          │ │
│  ├──────┼──────┼──────┼────────┼──────────┤ │
│  │ 1727 │ 220.5│ 222.4│ HB  ▼  │          │ │
│  │ 1728 │ 221.0│ 222.9│ HB  ▼  │          │ │
│  │ 1729 │ 219.8│ 221.7│ HB  ▼  │          │ │
│  │ ...  │      │      │        │          │ │
│  └──────┴──────┴──────┴────────┴──────────┘ │
│                                             │
│  [+ Agregar fila]  [Quitar seleccionadas]   │
│                                             │
│  Total fardos: 86  Peso neto: 19,310.2 kg   │
│                                             │
├─────────────────────────────────────────────┤
│  [ Guardar recepción ]                       │
└─────────────────────────────────────────────┘
```

### 1.1 Sección 1 — Formulario de cabecera (datos del camión)

Campos **compartidos por todos los fardos** de esta recepción. Se renderiza con
componentes de Mantine (TextInput, Select, DatePickerInput). No van a la grilla.

| Campo | Control | Origen del dato |
|---|---|---|
| Proveedor | Select | Catálogo de proveedores |
| N° Camión | TextInput | Ej: `01`, `02` — del remito |
| Fecha de recepción | DatePickerInput | Hoy por defecto, modificable |
| N° Remito / Documento | TextInput | Del documento físico |
| N° Pedido Cliente | TextInput | Del remito |
| N° Partida | TextInput | Del remito |
| Observaciones generales | Textarea | Opcional |

El formulario NO se envía solo. Es parte del mismo payload que los fardos.

### 1.2 Sección 2 — Grilla de fardos (react-data-grid)

Columnas exclusivamente por-fardo:

| Columna | Tipo edición | Requerido | Validación |
|---|---|---|---|
| N° de fardo | texto | sí | no vacío, no duplicado dentro de la recepción |
| Peso neto (kg) | número | sí | > 0, preserva precisión decimal |
| Peso bruto (kg) | número | no | > 0 si se ingresa |
| Tipo material | select dropdown | sí | valor del catálogo |
| Observaciones | texto | no | — |

Nada más en la grilla. Proveedor, camión, remito, etc., viven en el formulario
de arriba y se envían una sola vez con toda la recepción.

### 1.3 Fila de resumen

Al pie de la grilla, con summaryRow de react-data-grid:
- Total de fardos cargados
- Suma de peso neto
- Suma de peso bruto (si se cargó)

---

## 2. Flujo de datos: todo en frontend hasta "Guardar"

```
1. Usuario completa formulario de camión
2. Usuario llena la grilla fila por fila (como Excel)
3. Usuario puede:
   - Agregar filas (inserta fila vacía al final)
   - Navegar con Tab/Enter/Arrows
   - Pegar datos desde Excel (copy-paste nativo de RDG)
   - Quitar filas seleccionadas
4. TODO está en frontend — no hay llamadas al backend aún
5. Usuario presiona "Guardar recepción"
       │
       ▼
6. Validación completa en frontend:
   - ¿Formulario de camión completo?
   - ¿Hay al menos un fardo?
   - ¿Cada fardo tiene n° + peso neto + material?
   - ¿Números de fardo no duplicados dentro de la recepción?
       │
       ▼
7. Un solo POST a FastAPI con:
   {
     truck: { proveedor, nro_camion, fecha, remito, pedido, partida, observaciones },
     bales: [
       { nro_fardo, peso_neto, peso_bruto, tipo_material, observaciones },
       ...
     ]
   }
       │
       ▼
8. Backend procesa (valida, persiste, devuelve resultado)
9. UI muestra resultado: éxito completo o errores específicos
```

### 2.1 ¿Y si el backend falla?

El backend devuelve un resultado **por recepción completa**, no por fardo
individual. Puede ser:

- `201 Created`: todo OK, recepción guardada
- `422 / 400`: error de validación en cabecera o fardos, con detalle de qué falló
- `409`: conflicto (ej. número de fardo ya existe en DB)

La UI muestra el error y el usuario corrige lo necesario y reintenta.
No hay estado parcial — o se guardó todo, o no se guardó nada (transaccional
del lado del backend).

---

## 3. Integración react-data-grid

### 3.1 Instalación

```bash
npm view react-data-grid version
# 7.0.0-beta.61 (al momento del análisis)
```

Dependencia única, zero external deps, tree-shakeable.

### 3.2 Columnas de la grilla

```typescript
import type { Column } from 'react-data-grid'

interface BaleRow {
  id: string                // uuid local, no va al backend
  baleNumber: string
  netWeightKg: string       // string para preservar precisión sin redondeo
  grossWeightKg: string
  materialType: string
  notes: string
}

const columns: Column<BaleRow>[] = [
  { key: 'baleNumber', name: 'N° de fardo', editor: textEditor },
  { key: 'netWeightKg', name: 'Peso neto (kg)', editor: numberEditor },
  { key: 'grossWeightKg', name: 'Peso bruto (kg)', editor: numberEditor },
  { key: 'materialType', name: 'Tipo material', editor: materialSelectEditor },
  { key: 'notes', name: 'Observaciones', editor: textEditor },
]
```

### 3.3 Editores de celda

Cada columna con `renderEditCell` que usa componentes Mantine adaptados a celda:

| Editor | Componente Mantine base | Notas |
|---|---|---|
| `textEditor` | `<TextInput>` | Sin borde, sin label, padding de celda |
| `numberEditor` | `<TextInput pattern="[0-9]*\.?[0-9]*">` | String validation, no type="number" para evitar redondeo |
| `materialSelectEditor` | `<Select>` | Valores del catálogo de materiales |

### 3.4 Copy-paste nativo

react-data-grid v7 trae copy-paste de celdas incorporado (Ctrl+C / Ctrl+V).
El usuario puede copiar datos de Excel y pegarlos directamente. Esto es
funcionalidad nativa de RDG, no requiere implementación adicional.

### 3.5 Navegación por teclado

- Tab / Shift+Tab: siguiente/anterior celda
- Enter: editar celda
- Escape: cancelar edición
- Arrow keys: navegación direccional
- Ctrl+C / Ctrl+V: copy-paste

---

## 4. Arquitectura del feature

```
features/warehouse/
  pages/
    ReceptionPage.tsx             ← página completa (formulario + grilla + toolbar)
  components/
    TruckReceptionForm.tsx        ← formulario de datos del camión (Mantine)
    BaleReceptionGrid.tsx         ← wrapper react-data-grid con columnas y summary
    editors/
      TextCellEditor.tsx          ← editor de texto Mantine
      NumberCellEditor.tsx        ← editor numérico (string, sin redondeo)
      MaterialSelectEditor.tsx    ← select para tipo material
  hooks/
    useBaleReceptionGrid.ts       ← estado de la grilla (rows, crud local)
    useReceptionSubmit.ts         ← validación + envío POST batch
    useMaterialCatalog.ts         ← fetch catálogo de materiales
  types/
    reception-types.ts            ← BaleRow, TruckFormData, ReceptionPayload, etc.
  api/
    receptionApi.ts               ← POST /receptions (un solo request)
```

### 4.1 Tipo del payload al backend

```typescript
interface ReceptionPayload {
  truck: {
    supplierId?: string
    truckCode: string
    receptionDate: string       // ISO date
    documentNumber?: string
    orderNumber?: string
    partidaNumber?: string
    notes?: string
  }
  bales: {
    baleNumber: string
    netWeightKg: number
    grossWeightKg?: number
    materialType: string
    notes?: string
  }[]
}
```

---

## 5. Validación

### 5.1 Pre-envío (todo en frontend, antes del POST)

| Qué se valida | Dónde |
|---|---|
| Formulario: campos requeridos completos | Al presionar "Guardar" |
| Grilla: al menos 1 fila | Al presionar "Guardar" |
| Grilla: cada fila tiene n° de fardo + peso neto + material | Por fila, al presionar "Guardar" |
| Grilla: sin números de fardo duplicados | Contra todas las filas, al presionar "Guardar" |
| Peso neto > 0 | Por fila |
| Peso bruto > 0 (si se ingresó) | Por fila |

React-data-grid permite marcar celdas con error visualmente si se necesita
feedback inline, pero la validación fuerte se hace al enviar.

### 5.2 Post-envío (backend)

El backend valida todo transaccionalmente y devuelve:

- **201**: recepción creada exitosamente
- **422**: error de validación en datos (cabecera o fardos)
- **409**: conflicto (ej. bale_number ya existe)

No hay estados parciales — o todo se guardó, o nada.

---

## 6. Dependencias con backend

Para que la UI funcione, el backend necesita exponer:

| Endpoint | Propósito | Prioritario |
|---|---|---|
| `GET /catalog/materials` | Lista de tipos de material para el select | Alta |
| `GET /catalog/suppliers` | Lista de proveedores para el select | Alta |
| `POST /receptions` | Guardar recepción completa (cabecera + fardos) | Alta |
| N/A — el frontend no expone ni necesita autenticación propia | | |

El endpoint `POST /receptions` reemplaza el concepto de `POST /bales` individual.
El backend recibe todo el payload de una vez y maneja la transacción internamente.

---

## 7. Wrapper de tematización (RDGThemeWrapper)

Componente genérico en `common/components/` que mapea tokens Mantine a
CSS variables de react-data-grid. Reutilizable para cualquier grilla del sistema.

| Variable RDG | Token Mantine (claro) | Token Mantine (oscuro) |
|---|---|---|
| `--rdg-color` | `--mantine-color-text` | `--mantine-color-text` |
| `--rdg-background-color` | `--mantine-color-body` | `--mantine-color-body` |
| `--rdg-header-background-color` | `--mantine-color-gray-0` | `--mantine-color-dark-7` |
| `--rdg-row-hover-background-color` | `#E5FCFA` (brand-50) | `rgba(16, 89, 85, 0.4)` |
| `--rdg-selection-color` | `#14E3D9` (brand-400) | `#14E3D9` (brand-400) |
| `--rdg-border-color` | `--mantine-color-gray-3` | `--mantine-color-dark-4` |
| `--rdg-font-size` | `14px` | `14px` |
| `--rdg-cell-padding` | `8px 12px` | `8px 12px` |

---

## 8. Reutilización

- **RDGThemeWrapper** va en `common/components/` para cualquier pantalla que
  use react-data-grid (Spinning, Lotes, Reportes, etc.)
- **Editores de celda** (`TextCellEditor`, `NumberCellEditor`) van en
  `common/components/` o dentro de `features/warehouse/components/editors/`
  según si se reusarán en otros dominios
- **Columnas de fardo** son específicas de warehouse y se quedan en el feature
