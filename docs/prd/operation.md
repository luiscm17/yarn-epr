# SISTEMA DE GESTIÓN DE PRODUCCIÓN TEXTIL — Unidad Operación

> **Domain PRD — Unidad Operación**
>
> Define la estructura, los procesos, los actores y las reglas de negocio
> de la **Unidad Operación** dentro de la Dirección de Producción.
>
> Los PRD de detalle de cada proceso viven en:
>
> - [`docs/prd/operation/yarn-spinning.md`](./operation/yarn-spinning.md) — Hilatura (5 secciones productivas)
> - [`docs/prd/operation/lot-processing.md`](./operation/lot-processing.md) — Proceso por lotes (tintorería y acabados)
>
> Para el PRD maestro, el alcance general del sistema y la unidad Almacén,
> ver [`docs/prd.md`](../prd.md) y [`docs/prd/warehouse.md`](../prd/warehouse.md).

---

## 1. Propósito y Alcance

### 1.1 Propósito

Sistematizar la gestión de la **Unidad Operación**, responsable de transformar
la Materia Prima (MP) recibida de Almacén en Producto Terminado (PT) listo para
verificación física y posterior comercialización.

### 1.2 Alcance

Cubre la totalidad de la operación productiva de la planta textil:

| Proceso                | Archivo             | Descripción                                                                                                                                           |
| ---------------------- | ------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Yarn Spinning**      | `yarn-spinning.md`  | 5 secciones productivas (Preparación, Continuas, Bobinados, Retorcido, Madejeras). Flujo continuo, producción por máquina/turno/título.               |
| **Lot Processing**     | `lot-processing.md` | Proceso por lotes (Inventario → Tintorería → Secado → Devanado → Embolsado → Calidad). Trazabilidad individual por lote, ciclo de vida independiente. |
| **Calidad de Proceso** | `yarn-spinning.md`  | Control de calidad y pruebas en todas las secciones y máquinas de la planta. Además, registro de producción y avance de Preparación y Continuas.      |
| **Desperdicio**        | Ambos               | Registro de desperdicio real (Inventario) por grupo de máquinas y sección.                                                                            |

### 1.3 Límites del sistema

| Límite         | Detalle                                                                                                                      |
| -------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| **Entrada**    | MP recibida desde Almacén, con código de lote `NN-GGGG-NNN` asignado y hoja de ruta con título, color y cliente.             |
| **Salida**     | Lotes procesados, aprobados por Calidad y entregados a Almacén para verificación física de PT.                               |
| **No incluye** | Gestión de inventarios de MP/PT/insumos, valuación, costeo, cierres contables (responsabilidad de Almacén y Administración). |

---

## 2. Estructura Organizacional

### 2.1 Organigrama de Operación

```
DIRECCIÓN DE PRODUCCIÓN
│
├── JEFE DE PRODUCCIÓN
│   ├── Autoriza emisiones de MP
│   ├── Supervisa ambas unidades (Almacén + Operación)
│   ├── Verifica coherencia (MP emitida vs lotes producidos)
│   └── Consolida reporte diario a Gerencia
│
└── UNIDAD OPERACIÓN
    │
    └── SUPERVISOR (1 por turno)
        ├── Responsable del proceso productivo de la MP
        ├── Responsable de la planta y del personal operativo
        │
        ├── ► CONTROL DE CALIDAD
        │   ├── Control de calidad y pruebas en TODAS las secciones
        │   │   y máquinas de la planta (aleatorio cuando corresponde)
        │   ├── Registro de producción y avance de Preparación y Continuas
        │   │   (actualmente en formulario papel, a sistematizar)
        │   └── Evaluación y aprobación del estado final del lote
        │       antes de su entrega a Almacén
        │
        ├── ► INVENTARIO
        │   ├── Armado de lotes físicos y seguimiento hasta Embolsado
        │   ├── Registro de producción y avance de Retorcido y Madejeras
        │   ├── Recepción de MP recibida diariamente de Almacén
        │   └── Registro del desperdicio real en TODAS las secciones y máquinas
        │
        ├── ► PERSONAL DE TINTORERÍA
        │   └── Operación del proceso de tintorería en lotes
        │
        └── ► EMBOLSADO
            ├── Organiza operadores de devanado, ovillado y embolsado
            ├── Registra datos de producción durante el turno
            └── Reporta a Supervisión
```

### 2.2 Actores y Responsabilidades

| Actor | Depende de | Responsabilidades en el sistema |
|---|---|---|
| **Supervisor** | Jefe de Producción | Responsable del proceso completo de la MP, de la planta y de todo el personal operativo. Supervisa la producción en su turno. Registra y verifica datos de producción. |
| **Control de Calidad** | Supervisor | Realiza control de calidad y pruebas en TODAS las secciones y máquinas de la planta (aleatorio cuando corresponde). Registra producción y avance de Preparación y Continuas (actualmente en formulario papel, a sistematizar). Evalúa y aprueba el estado final de los lotes antes de su entrega a Almacén. Asigna nomenclaturas especiales al PT (-AT, -FT, -VARR, etc.). |
| **Inventario** | Supervisor | Arma lotes físicos y asegura que lleguen a Embolsado. Registra producción y avance de Retorcido y Madejeras. Recibe la MP enviada diariamente por Almacén. Registra el desperdicio real en TODAS las secciones y máquinas. |
| **Personal de Tintorería** | Supervisor | Opera el proceso de tintorería dentro del ciclo del lote. |
| **Embolsado** | Supervisor | Organiza operadores de devanado, ovillado y embolsado. Registra datos de producción del turno. Reporta a Supervisión. |

> **Nota:** A diferencia de lo definido en el PRD maestro, donde se indica
> que "los operarios no usan el sistema", en Operación existen roles operativos
> (Calidad, Inventario, Personal de Tintorería, Embolsado) que **sí registran datos en el sistema** según su ámbito.

---

## 3. Los Dos Procesos Productivos

La Unidad Operación se organiza en dos procesos productivos diferenciados
por su naturaleza, granularidad y flujo de trabajo.

### 3.1 Visión General

```
ALMACÉN
  │
  │  MP + código lote + hoja de ruta (título, color, cliente)
  ▼
OPERACIÓN
  │
  ├── YARN SPINNING (Hilatura)
  │   ├── Flujo continuo, secuencial
  │   ├── Granularidad: máquina × turno × título
  │   ├── Difícil identificación de la MP por lote
  │   │
  │   ├── Preparación ──► Continuas ──► Bobinados ──► Retorcido ──► Madejeras
  │   │                      ▲                            ▲
  │   │                      │                            │
  │   │              Calidad de proceso           Inventario (gestiona)
  │   │              (Preparación, Cont.,          │
  │   │               Bobinados)                   │
  │   │                                            ▼
  │   └──────────────────────────────────────► Consolidación de lotes
  │
  ▼
  LOT PROCESSING (Proceso por Lotes)
  │
  ├── Flujo por lotes, ciclo de vida independiente
  ├── Cada lote tiene su propio timeline
  ├── Granularidad: lote
  │
  │   Inventario ──► Tintorería ──► Secado ──► Devanado ──► Embolsado ──► Calidad
  │      ▲                                                                    │
  │      └── Inventario (rol) gestiona todo el proceso                        │
  │                                                                           │
  └─────────────────── Lote aprobado ────────────────────────────────────────►│
                                                                            ▼
                                                              ALMACÉN (verificación PT)
```

### 3.2 Yarn Spinning (Hilatura)

**Naturaleza:** Flujo continuo y secuencial. La MP avanza a través de las 5 secciones
sin identificación precisa por lote. Es difícil rastrear la materia prima individual
debido a la naturaleza del proceso (mezcla de fibra, múltiples husos, producción
continua).

**Secciones:**

| Sección | Producción | Avance | Calidad de Proceso | Desperdicio | Quién registra prod./avance |
|---|---|---|---|---|---|
| Preparación | Peso neto, No. mechas | Entrada/salida | Pruebas y muestras | Grupo de máquinas | Calidad |
| Continuas (Ring Spinning) | Peso neto, No. husos | Entrada/salida | Pruebas y muestras (12/máquina/tipo) | Grupo de máquinas | Calidad |
| Bobinados (Winding) | Peso neto, No. husos | Sin avance | Body/km/cortes (sin muestras) | Grupo de máquinas | — |
| Retorcido (Twisting) | Peso neto, No. husos | Entrada/salida | Pruebas (aleatorias) | Grupo de máquinas | Inventario |
| Madejeras (Skeining) | Madejas, peso neto | Sin avance | Pruebas (aleatorias) | Grupo de máquinas | Inventario |

> [!NOTE] **Calidad de Proceso:**
> Calidad realiza pruebas y control en TODAS las secciones y máquinas de la planta, con la frecuencia que corresponde a cada una (muestras sistemáticas en Preparación y Continuas; aleatorias en Retorcido y Madejeras; registro de máquina en Bobinados).

**Detalle completo en:** [`docs/prd/operation/yarn-spinning.md`](./operation/yarn-spinning.md)

### 3.3 Lot Processing (Proceso por Lotes)

**Naturaleza:** Flujo por lotes con ciclo de vida independiente. Cada lote
atraviesa las mismas etapas secuenciales, pero su timeline es autónomo:
dos lotes armados el mismo día no necesariamente llegan a embolsado al mismo
tiempo. Esto permite gestionar cuellos de botella, prioridades y reprocesos
de forma individual.

**Dependencia:** Este proceso **depende del Yarn Spinning**. Madejeras es el
punto donde se consolida el hilado producido y se arman los lotes físicos
para iniciar el proceso de tintorería y acabados. El código de lote asignado
por Almacén se reutiliza durante todo este proceso.

**Etapas:**

| #   | Etapa          | Quién registra         | Qué se registra                                       |
| --- | -------------- | ---------------------- | ----------------------------------------------------- |
| 1   | Inventario     | Inventario             | Fecha, turno, madejas, titulo                           |
| 2   | Tintorería     | Personal de Tintorería | Madejas, peso neto, temperatura, tina, retener        |
| 3   | Secado         | Personal de Tintorería | Madejas, peso total                                   |
| 4   | Devanado       | Inventario             | Conos, desperdicio                                    |
| 5   | Embolsado      | Embolsado               | Bolsas, conos, desperdicio                            |
| 6   | Calidad (lote) | Calidad                | Defectos visuales + internos, resultado, nomenclatura |

> [!NOTE] Madejeras
> La seccion de Madejeras (Yarn Spinning) consolida el hilado y arma los lotes físicos que alimentan la etapa 1 (Inventario) del Lot Processing.

**Detalle completo en:** [`docs/prd/operation/lot-processing.md`](./operation/lot-processing.md)

---

## 4. Reglas de Negocio Transversales

### 4.1 Relación entre procesos

1. **Dependencia unidireccional:** Lot Processing depende de Yarn Spinning.
   No se puede iniciar un lote si no hay hilado producido y consolidado en
   Madejeras.

2. **Flujo independiente de lotes:** Cada lote en Lot Processing tiene su
   propio ciclo de vida. El avance de un lote no condiciona el de otro,
   incluso si fueron armados el mismo día.

3. **Madejeras como punto de consolidación:** Es el punto de unión entre
   ambos procesos. Aquí termina Yarn Spinning y comienza la trazabilidad
   fina por lote.

### 4.2 Responsabilidades por rol

1. **Calidad — control en toda la planta:** Calidad realiza pruebas y control
   de calidad del proceso en TODAS las secciones y máquinas sin excepción.
   La frecuencia y método varía por sección (sistemático en Preparación y
   Continuas, aleatorio en Retorcido y Madejeras, registro de máquina en
   Bobinados).

2. **Calidad — registro de producción:** Además del control de calidad, Calidad
   registra la producción y avance de Preparación y Continuas (actualmente en
   formulario papel, a sistematizar).

3. **Inventario — registro de producción:** Inventario registra la producción
   y avance de Retorcido y Madejeras.

4. **Inventario — desperdicio:** Inventario registra el desperdicio real de
   TODAS las secciones y máquinas de la planta.

5. **Inventario — lotes:** Inventario arma los lotes físicos y asegura que
   lleguen a Embolsado.

6. **Embolsado — producción:** Embolsado organiza a los operadores de devanado,
   ovillado y embolsado, registra los datos de producción del turno y reporta
   a Supervisión.

7. **Calidad — aprobación final de lote:** Calidad es responsable de aprobar
   el estado final del lote (verificar parámetros permitidos) antes de su
   entrega a Almacén. Ningún lote sale de Operación sin aprobación de Calidad.

### 4.3 Desperdicio

1. **Dos tipos de desperdicio:** Se distingue entre **desperdicio real**
   (registrado por Inventario durante el proceso) y **desperdicio acumulado**
   (gestionado por Producción). El término "desperdicio teórico" engloba ambos.

2. **Desperdicio por grupo:** El desperdicio se registra por grupo de
   máquinas, no por máquina individual (se pesan juntas físicamente).

### 4.4 Inmutabilidad y trazabilidad

1. **Datos inmutables:** Los registros críticos (producción, calidad,
   movimientos de lote) no se modifican ni eliminan. Las correcciones
   son nuevos registros con trazabilidad.

2. **Trazabilidad de lote:** El código `NN-GGGG-NNN` asignado por Almacén
    es el identificador único del lote durante todo el proceso productivo.
    Operación no genera códigos de lote nuevos.

### 4.5 Reporte diario

1. **Consolidado al final del turno:** Al finalizar su turno, el Supervisor
     debe poder consultar un reporte consolidado con la producción por
     sección, estado de lotes, calidad y desperdicio de su turno. Este
     reporte alimenta el consolidado diario que el Jefe de Producción
     envía a Administración. No es un dashboard en tiempo real.

---

## 5. Planificación de la Producción

La producción en Operación se planifica a partir de una **producción fija mínima**
destinada a un cliente base, sobre la cual se agregan variedades adicionales.

### 5.1 Producción fija base

Existe un pedido base mensual de aproximadamente **60 000 kg de MP/mes**
distribuido en dos títulos principales:

| Título | kg/día | kg/mes (~30d) |
|---|---|---|
| 2/18 | 1 440 | 43 200 |
| 2/32 | 600 | 18 000 |
| **Total** | **2 040** | **~61 200** |

Sobre esta base se planifica el resto de las variedades (otros títulos, colores,
clientes) según pedidos adicionales.

### 5.2 Responsable

El **Jefe de Producción** es quien planifica la MP a ser procesada, de acuerdo
a los pedidos recibidos y a la producción fija pactada con el cliente base.
Esta planificación determina:

- Las emisiones de MP desde Almacén a Operación
- La prioridad de títulos en Yarn Spinning
- La prioridad de lotes en Lot Processing
- El reporte diario consolidado a Administración

### 5.3 Implicaciones para el sistema

- El sistema debe permitir al Jefe de Producción visualizar la producción
  planificada vs. la producción real por título y período.
- El sistema debe alertar si la producción real se desvía significativamente
  de la base planificada (especialmente para los títulos 2/18 y 2/32).

---

## 6. Subdominios y Archivos

| Subdominio                                         | Archivo PRD                            | Modelo de Dominio                         | Estado PRD |
| -------------------------------------------------- | -------------------------------------- | ----------------------------------------- | ---------- |
| **Yarn Spinning** (5 secciones)                    | `docs/prd/operation/yarn-spinning.md`  | `docs/domain/operation/yarn-spinning.md`  | Escrito    |
| **Lot Processing** (6 etapas + máquina de estados) | `docs/prd/operation/lot-processing.md` | `docs/domain/operation/lot-processing.md` | Escrito    |
| **Calidad de Proceso**                             | `yarn-spinning.md` (incluido)          | `yarn-spinning.md` (incluido)             | Escrito    |
| **Desperdicio**                                    | Ambos archivos de detalle              | Ambos archivos de dominio                 | Escrito    |
| **Calidad de Lote**                                | `lot-processing.md` (incluido)         | `lot-processing.md` (incluido)            | Escrito    |

---

## 7. Decisiones Diferidas

| Decisión | Estado |
|---|---|
| _(ninguna por el momento)_ | — |

---

## 8. Glosario

| Término                 | Definición                                                                                                                                                                             |
| ----------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Yarn Spinning**       | Proceso de hilatura que transforma la MP en hilado de un título específico a través de 5 secciones. También referido como "hilatura" o "producción de título".                         |
| **Lot Processing**      | Proceso por lotes que transforma el hilado consolidado en madejas en producto terminado listo para verificación. Incluye tintorería, secado, devanado, embolsado y control de calidad. |
| **Hoja de ruta**        | Documento que acompaña a la MP desde Almacén con el código de lote, título, color y cliente/destino (comercialización).                                                                |
| **Título**              | Designación del grosor del hilado (ej. 2/18, 2/32, 4/9). Determinado durante el proceso de Yarn Spinning.                                                                              |
| **Consolidación**       | Punto en Madejeras donde se arman los lotes físicos que inician el Lot Processing.                                                                                                     |
| **Desperdicio real**    | Desperdicio registrado por Inventario durante el proceso productivo, por grupo de máquinas.                                                                                            |
| **Desperdicio teórico** | Suma del desperdicio real + desperdicio acumulado.                                                                                                                                     |
