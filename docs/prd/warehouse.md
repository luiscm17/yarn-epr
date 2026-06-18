# PRD: Unidad Almacén

> **Parte de:** Dirección de Producción — Yarn EPR
> **Dependencias:** `docs/prd.md` (PRD maestro)

---

## 1. Propósito y alcance

### 1.1 Propósito

Definir los subdominios, reglas de negocio y requerimientos de la **Unidad Almacén**, responsable de gestionar las existencias de materia prima, producto terminado e insumos de producción, así como el registro de todos los movimientos de entrada y salida. Este PRD establece el ciclo de vida del lote desde la perspectiva de Almacén.

### 1.2 Alcance

Cubre los siguientes subdominios operativos:

- **Materia Prima (MP):** recepción de fardos, registro de camiones/lotes entrantes, asignación del código único `NN-GGGG-NNN`, enriquecimiento con datos del pedido (título, color, cliente, etc), y emisión a Operación.
- **Producto Terminado (PT):** recepción desde Operación, almacenamiento (bolsa / suelto), salidas por venta directa a cliente o transferencia a Comercialización, devoluciones, y control de existencias con la fórmula `(Saldo Anterior + Entradas) − Salidas = Saldos`.
- **Insumos de Producción (Supplies):** todo insumo que consume producción: colorantes, químicos, bolsas, etiquetas, fichas de devanado, talonarios, repuestos, lubricantes, conos, tubos, etc. Se organiza por categorías según el tipo de insumo.

### 1.3 Límite con otros dominios

El sistema tendrá un **historial único por lote** identificado por el código `NN-GGGG-NNN`, pero cada dominio escribe y consulta solo su propia información:

| Dominio | Escribe | No ve |
|---|---|---|
| **Almacén** | Recepción de MP, enriquecimiento, emisión, recepción de PT, salidas, devoluciones | Las 6 etapas productivas, calidad, desperdicio real |
| **Operación** | 6 etapas del lote, calidad, nomenclaturas, desperdicio real | Movimientos de almacén, clientes, saldos |

### 1.4 Fuera de alcance

- Las 6 etapas productivas del lote y su máquina de estados (compete a `docs/prd/operation.md`)
- Control de calidad de proceso y nomenclaturas especiales del PT (competencia de Operación)
- Desperdicio real y acumulado (competencia de Operación y Jefe de Producción)
- Facturación, contabilidad y libros fiscales
- Modelo de datos detallado y diseño de API (se documenta en `docs/domain/`)

### 1.5 Audiencia

Jefe de Producción, Jefe de Unidad Almacén, arquitectos, desarrolladores, QA.

---

## 2. Contexto organizacional

### 2.1 Ubicación en la estructura

La Unidad Almacén depende de la **Dirección de Producción**. Su responsable es el **Jefe de Unidad Almacén**, que reporta al Jefe de Producción.

```
Dirección de Producción
├── Jefe de Producción (incl. Secretaria)
│   ├── Unidad Almacén
│   │   └── Jefe Unidad Almacén
│   │       └── Auxiliares Operativos
│   └── Unidad Operación
│       └── Supervisores (1 por turno)
```

### 2.2 Roles

| Rol | Responsabilidades en el sistema |
|---|---|
| **Jefe de Unidad Almacén** | Supervisa recepción de MP, emisiones a Operación, verificación de PT, control de existencias. Opera el sistema. Reporta al Jefe de Producción. |
| **Auxiliar Operativo** | Ejecuta movimientos físicos: recepción, verificación, embolsado, despacho. Opera el sistema para registrar movimientos. |

### 2.3 Relación con otros roles

- **Jefe de Producción:** planifica la producción (ver `docs/prd/operation.md §5`), autoriza emisiones de MP, recibe reportes de stock y alertas del Jefe de Almacén.
- **Supervisores (Operación):** reciben las solicitudes de material desde las secciones productivas y las elevan al Jefe de Almacén. Coordinan la recepción de MP/insumos y la entrega de PT desde las secciones productivas a Almacén.
- **Comercialización:** recibe PT transferido para venta por unidad o cantidades pequenas. Es un destino de salida, no un usuario del sistema.
- **Cliente directo:** destino de salida cuando el lote completo se vende al por mayor. No es usuario del sistema.

### 2.4 Principios operativos

1. **Código único como eje transversal.** Almacén asigna el código `NN-GGGG-NNN` al recibir la MP. Ese código es el identificador único del lote durante todo el proceso.
2. **Trazabilidad obligatoria.** Todo lote de MP ingresado debe tener su correspondiente PT procesado. No se admiten lotes huérfanos.
3. **Consistencia de saldos.** El stock reflejado en el sistema debe coincidir con las existencias físicas. Cualquier discrepancia requiere ajuste documentado.
4. **Cada dominio escribe su historial.** Almacén registra sus movimientos y no interfiere con los datos de Operación. El código del lote es el único vínculo.
5. **Dos canales de salida de PT.** El PT puede salir por venta directa a cliente (lote completo) o por transferencia a Comercialización. Ambos se registran en kilogramos en el historial del lote.

---

## 3. Subdominios

La Unidad Almacén opera sobre tres subdominios. El detalle completo de cada uno (ciclo operativo, campos de entrada/salida, catálogos) está documentado en:

> Ver [`docs/prd/warehouse/subdomains.md`](subdomains.md)

| # | Subdominio | Propósito | Unidad |
|---|---|---|---|
| 3.1 | **Raw Material (MP)** | Recepción de fardos, registro de lotes/camiones entrantes, asignación del código `NN-GGGG-NNN`, enriquecimiento con datos del pedido, emisión a Operación | kg |
| 3.2 | **Finished Product (PT)** | Recepción desde Operación, almacenamiento (bolsa / suelto), salida por venta directa o transferencia a Comercialización | kg |
| 3.3 | **Supplies** | Todo insumo de producción: colorantes, químicos, empaque, repuestos, lubricantes, etc. Organizado por categorías. | según categoría (kg, piezas, L) |

---

## 4. Reglas de negocio

### 4.1 Historial de movimientos

Todo movimiento en Almacen genera un **registro inmutable** en el historial del lote o item. El historial es de solo agregar (append-only):

- No se eliminan movimientos existentes.
- No se sobreescriben movimientos existentes.
- No se editan campos de un movimiento ya registrado.
- Si se requiere corregir una situacion, se registra un nuevo movimiento que referencia al movimiento anterior.

### 4.2 Tipos de movimiento

Cada subdominio define sus propios tipos de movimiento. No son intercambiables entre subdominios.

La unidad de medida del movimiento depende del subdominio: Raw Material y Finished Product usan **kilogramos (kg)**; Supplies usa la unidad que corresponda a cada categoria (kg, L, piezas, etc.).

| Subdominio | Tipo de movimiento | Direccion | Autoriza |
|---|---|---|---|
| Raw Material | Reception | Entrada | — |
| Raw Material | Emission to Production | Salida | Jefe de Produccion |
| Finished Product | Reception from Production | Entrada | — |
| Finished Product | Direct sale | Salida | Jefe de Produccion |
| Finished Product | Comercializacion transfer | Salida | Jefe de Produccion |
| Finished Product | Return | Entrada | — |
| Supplies | Reception from supplier | Entrada | — |
| Supplies | Production consumption | Salida | Supervisor de turno |
| Supplies | Return to supplier | Salida | — |

Toda solicitud sigue el orden jerarquico. Para los movimientos que requieren autorizacion, la solicitud llega a Almacen con el visto bueno del rol correspondiente:

- **Jefe de Produccion** autoriza emisiones de MP y salidas de PT.
- **Supervisor de turno** autoriza consumos de Supplies.

Casos particulares:

- **Finished Product / Return**: puede ser total o parcial. El lote devuelto se reincorpora a existencias y puede tener una salida posterior. El movimiento referencia a la venta original.
- **Finished Product / Comercializacion transfer**: la cantidad se registra en kilogramos. El precio unitario lo define Comercializacion.
- **Finished Product / Direct sale**: la cantidad se registra en kilogramos.
- **Datos verificados**: Almacen solo registra informacion que llega verificada desde Operacion. Si un lote llega con datos incorrectos, se rechaza la recepcion. Las discrepancias entre sistema y existencias fisicas se resuelven en Operacion.

### 4.3 Cierre de existencias

El sistema debe facilitar el calculo de saldos para el cierre de existencias, que se realiza:

- **Mensualmente** (control de gestion)
- **Anualmente** (cierre fiscal)
- **Extraordinariamente** (cuando la planta detiene produccion y se puede hacer conteo fisico)

En cada cierre, el sistema calcula los saldos con la formula `(Saldo Anterior + Entradas) − Salidas = Saldos` y los presenta para su verificacion. Los movimientos del periodo cerrado pasan a solo lectura.

---

## 5. Requerimientos funcionales

### 5.1 Raw Material

| ID | Requerimiento |
|---|---|
| WH-RM-01 | El sistema debe permitir registrar la recepcion de fardos de MP con: proveedor, factura, peso bruto, titulo, color/fibra y numero de camion. |
| WH-RM-02 | El sistema debe generar automaticamente el codigo unico `NN-GGGG-NNN` al confirmar la recepcion, donde NN es el numero de camion, GGGG la gestion y NNN el correlativo del ano. |
| WH-RM-03 | El sistema debe permitir enriquecer el lote con datos del pedido: cliente, color solicitado, titulo, tipo N/CH y observaciones. Este enriquecimiento es el insumo para la planificación de producción que realiza el Jefe de Producción (ver `docs/prd/operation.md §5`). |
| WH-RM-04 | El sistema debe permitir registrar la emision de MP a Operacion indicando: fecha, supervisor receptor, cantidad emitida (kg) y destino. La emision requiere autorizacion del Jefe de Produccion. |
| WH-RM-05 | El sistema debe mantener un historial de todos los lotes de MP recibidos, con su estado (pendiente de emision, emitido parcialmente, emitido totalmente). |

### 5.2 Finished Product

| ID | Requerimiento |
|---|---|
| WH-PT-01 | El sistema debe permitir registrar la recepcion de PT desde Operacion con: codigo de lote, descripcion, cantidad (kg), valor, categoria, subcategoria, estado (bolsa/suelto) y supervisor de origen. |
| WH-PT-02 | El sistema debe rechazar la recepcion de un PT si los datos del lote no coinciden con la informacion registrada por Operacion. |
| WH-PT-03 | El sistema debe permitir registrar la salida de PT por venta directa a cliente con: cliente, cantidad (kg), fecha y numero de factura. Requiere autorizacion del Jefe de Produccion. |
| WH-PT-04 | El sistema debe permitir registrar la transferencia de PT a Comercializacion con: cantidad (kg), fecha. Requiere autorizacion del Jefe de Produccion. |
| WH-PT-05 | El sistema debe permitir registrar devoluciones de PT (totales o parciales) referenciando a la venta original. El lote devuelto se reincorpora a existencias. |
| WH-PT-06 | El sistema debe permitir registrar el cambio de estado de un lote entre bolsa y suelto, dejando registro en el historial. |
| WH-PT-07 | El sistema debe mostrar el historial completo de movimientos de cada lote de PT, desde su recepcion hasta su salida final. |

### 5.3 Supplies

| ID | Requerimiento |
|---|---|
| WH-SU-01 | El sistema debe permitir definir categorias de insumos de forma flexible (Dyehouse, Packaging, Maintenance, Lubricants, Cones & Tubes, Others), sin limite fijo. |
| WH-SU-02 | El sistema debe permitir registrar la recepcion de insumos con: categoria, proveedor, cantidad y unidad de medida (kg, L, piezas, metros, etc.). |
| WH-SU-03 | El sistema debe permitir registrar el consumo de insumos por parte de Produccion con: categoria, cantidad, area de destino y supervisor que autoriza. |
| WH-SU-04 | El sistema debe permitir registrar devoluciones de insumos a proveedor. |
| WH-SU-05 | Cada item de Supplies debe tener su propia unidad de medida, definida por categoria. |

### 5.4 Transversales

| ID | Requerimiento |
|---|---|
| WH-TR-01 | El sistema debe generar un numero de movimiento unico y correlativo por tipo de movimiento y gestion. |
| WH-TR-02 | El sistema debe registrar fecha y hora en cada movimiento. |
| WH-TR-03 | El sistema debe impedir la edicion, eliminacion o sobreescritura de movimientos ya registrados. |
| WH-TR-04 | El sistema debe permitir registrar movimientos correctivos que referencien al movimiento original. |
| WH-TR-05 | El sistema debe verificar que el usuario que autoriza un movimiento tenga el rol correspondiente (Jefe de Produccion o Supervisor de turno). |
| WH-TR-06 | El sistema debe calcular los saldos de existencias en cualquier momento usando la formula `(Saldo Anterior + Entradas) − Salidas = Saldos`. |
| WH-TR-07 | El sistema debe facilitar el cierre mensual, anual y extraordinario de existencias, poniendo los movimientos del periodo cerrado en solo lectura. |
| WH-TR-08 | El sistema debe permitir consultar el historial completo de movimientos de cualquier lote o item. |
| WH-TR-09 | El sistema debe permitir a Almacen leer los datos productivos del lote (codigo, descripcion) desde el historial de Operacion, sin poder modificarlos. |

---

## 6. Glosario

| Termino | Definicion |
|---|---|
| **Almacen** | Unidad organizacional responsable de gestionar las existencias de materia prima, producto terminado e insumos de produccion. Depende de la Direccion de Produccion. |
| **Lote** | Identificador unico de un conjunto de materia prima que sera procesado como una unidad. Se identifica con el codigo `NN-GGGG-NNN`. |
| **Codigo de lote** | Formato `NN-GGGG-NNN` asignado por Almacen al recibir MP. Acompania al lote durante todo su ciclo de vida. |
| **Movimiento** | Registro inmutable de una entrada o salida de existencias en Almacen. Cada movimiento pertenece a un tipo especifico (reception, emission, sale, etc.). |
| **Existencias** | Cantidad de un producto disponible en Almacen en un momento dado. Se calcula con la formula `(Saldo Anterior + Entradas) − Salidas`. |
| **Recepcion** | Movimiento de entrada de MP o PT a Almacen, proveniente de proveedor o de Operacion respectivamente. |
| **Emision** | Movimiento de salida de MP desde Almacen hacia Operacion para su procesamiento. |
| **Salida** | Movimiento de salida de PT hacia cliente directo (venta) o Comercializacion. |
| **Devolucion** | Movimiento de entrada de PT o Supplies que retorna a Almacen despues de haber salido. Puede ser total o parcial. |
| **Consumo** | Movimiento de salida de Supplies desde Almacen hacia Produccion para su uso en el proceso productivo. |
| **Operacion** | Unidad organizacional responsable del proceso productivo (Yarn Spinning + Lot Processing, documentado en `docs/prd/operation.md`). Recibe MP e insumos de Almacen y devuelve PT verificado. |
| **Comercializacion** | Area que recibe PT desde Almacen para su venta por unidades. No es usuario del sistema de Almacen; es un destino de salida. |
| **Supervisor de turno** | Rol en Operacion que autoriza solicitudes de material y coordina la entrega de PT a Almacen. |
| **Jefe de Produccion** | Rol que autoriza emisiones de MP y salidas de PT. Reporta a la Direccion de Produccion. |
| **Cierre de existencias** | Proceso de calculo de saldos al cierre de un periodo (mensual, anual o extraordinario). Los movimientos del periodo cerrado pasan a solo lectura. |
