# Yarn Spinning — Hilatura

> **Domain PRD — Yarn Spinning (Producción de Título)**
>
> Proceso continuo de hilatura que transforma la Materia Prima en hilado
> de un título específico a través de 5 secciones productivas.
>
> Pertenece a la Unidad Operación. Para el contexto general, actores y
> reglas transversales, ver [`docs/prd/operation.md`](../operation.md).

---

## 1. Propósito y Alcance

### 1.1 Propósito

Documentar el proceso de **Yarn Spinning** (hilatura / producción de título),
un flujo continuo y secuencial que transforma los fardos de MP recibidos de
Almacén en hilado de un título específico, listo para su consolidación en
Madejeras y posterior ingreso al proceso de Lot Processing.

### 1.2 Alcance

Cubre las 5 secciones productivas, sus registros de producción, avance,
calidad de proceso y desperdicio:

| Sección                   | Producción | Avance             | Calidad            | Desperdicio |
| ------------------------- | ---------- | ------------------ | ------------------ | ----------- |
| Preparación               | ✓          | ✓ (entrada/salida) | ✓ (muestras)       | ✓           |
| Continuas (Ring Spinning) | ✓          | ✓ (entrada/salida) | ✓ (muestras)       | ✓           |
| Bobinados (Winding)       | ✓          | —                  | ✓ (body/km/cortes) | ✓           |
| Retorcido (Twisting)      | ✓          | ✓ (entrada/salida) | ✓ (aleatoria)      | ✓           |
| Madejeras (Skeining)      | ✓          | —                  | ✓ (aleatoria)      | ✓           |

**No incluye:**

- El proceso por lotes posterior (Lot Processing, documentado en `lot-processing.md`)
- Calidad de lote (evaluación final antes de entrega a Almacén, en `lot-processing.md`)
- Gestión de insumos o MP (responsabilidad de Almacén)

### 1.3 Dependencias

| Proceso                     | Relación                                                                 |
| --------------------------- | ------------------------------------------------------------------------ |
| **Almacén (entrada)**       | Recibe la MP con código `NN-GGGG-NNN` y hoja de ruta                     |
| **Lot Processing (salida)** | Madejeras consolida el hilado y arma los lotes para el siguiente proceso |

---

## 2. Las 5 Secciones

### 2.1 Flujo del Proceso

```
MP (fardos)
  │
  ▼
PREPARACIÓN
  │  Máquinas: PSJ (Preparación A/B) + FIN (Finisores A/B)
  │  Registro: FIN producen, PSJ solo avance
  ▼
CONTINUAS (Ring Spinning)
  │  Máquinas: Ring Spinning frames
  │  Registro: peso neto, No. husos
  ▼
BOBINADOS (Winding)
  │  Máquinas: Winding machines
  │  Registro: peso neto, No. husos (sin avance)
  ▼
RETORCIDO (Twisting)
  │  Máquinas: Twisting frames
  │  Registro: peso neto, No. husos (gestiona Inventario)
  ▼
MADEJERAS (Skeining)
  │  Producción: madejas (no husos)
  │  Punto de consolidación de lotes
  ▼
  LOT PROCESSING
```

### 2.2 Cuadro por Sección

| #   | Sección                       | Tipo de máquinas     | Unidad de producción   | Tiene avance | Quién registra prod. | Quién registra avance |
| --- | ----------------------------- | -------------------- | ---------------------- | ------------ | -------------------- | --------------------- |
| 1   | **Preparación**               | PSJ (A/B), FIN (A/B) | kg (neto), No. mechas  | Sí           | Calidad              | Calidad               |
| 2   | **Continuas** (Ring Spinning) | Ring frames          | kg (neto), No. husos   | Sí           | Calidad              | Calidad               |
| 3   | **Bobinados** (Winding)       | Winding              | kg (neto), No. husos   | No           | —                    | —                     |
| 4   | **Retorcido** (Twisting)      | Twisting             | kg (neto), No. husos   | Sí           | Inventario           | Inventario            |
| 5   | **Madejeras** (Skeining)      | Skeining             | No. madejas, peso neto | No           | Inventario           | —                     |

> **Nota:** Bobinados no tiene un responsable fijo de registro de producción
> en la definición actual — el Supervisor asigna quién registra según el turno.
> Se definirá en el diseño del sistema.

---

## 3. Registro de Producción

### 3.1 Naturaleza del Registro

El registro de producción es **granular, por descarga**. Una misma máquina
puede tener múltiples descargas en un mismo turno (del mismo o distinto título),
o puede no tener ninguna. Cada descarga se registra individualmente.

**Granularidad:** 1 descarga × 1 máquina × 1 turno × 1 fecha × 1 título.

### 3.2 El Número de Husos

Cada máquina tiene entre 20 y 200 husos (según la sección y tipo de máquina).
No es práctico pesar cada huso individualmente. Por eso el **número de husos
operativos** es un dato fundamental. El cálculo del peso varía según el tipo
de registro:

| Tipo de registro | Cálculo de peso |
|---|---|
| **Avance (entrada/salida/acumulado)** | Se pesa 1 huso como muestra (bruto − tara de ese huso), se asume que todos los husos tienen el mismo peso, y se multiplica por el número total de husos. |
| **Descarga (producción granular)** | Se pesa el carro/tacho/turril completo (peso bruto total). El neto se calcula como: **bruto_total − (tara_huso × num_husos) − peso_carro**. |

> En las descargas, el peso neto no es simplemente bruto − tara de un
> contenedor, porque cada descarga contiene el producto de múltiples husos
> y se transporta en un carro que tiene su propio peso.

### 3.3 Datos Registrados por Descarga

#### Preparación, Continuas, Bobinados, Retorcido

Para cada descarga se registra:

- **Máquina** que produjo
- **Turno** y **fecha**
- **Supervisor de turno**
- **Título** producido (ej. 2/18, 2/32). Puede ser distinto del título
  inicial del turno si hubo cambio.
- **Peso bruto total** de la descarga (carro o contenedor completo)
- **Tara por huso** (para el cálculo ajustado)
- **Número de husos** operativos en la máquina
- **Peso del carro / contenedor** usado para transportar la descarga
- **Quién registra** (Calidad excepto las secciond e Retorcido que la registra Inventario)

> [!WARNING]
> No existe registro de produccion de Preparacion y Bobinados

#### Madejeras

Para cada descarga se registra:

- **Máquina** que produjo
- **Turno** y **fecha**
- **Supervisor de  turno**
- **Título**
- **Número de madejas** producidas
- **Peso unitario estimado** por monio (1 monio = 10 madejas ~ 5kg, en ocasiones la madeja debe pesar 600g y no 500g de acuerdo a requirimeinto del titulo)
- **Quién registra** (Inventario)

> [!NOTE] Madejeras
> La producción es operario-dependiente, no ciclo-máquina.
> La métrica principal es el número de madejas producidas. No usa husos ni tara. El peso total se estima como: madejas × peso unitario.

### 3.4 Reglas de Producción

1. **Peso neto siempre calculado:** El sistema calcula el neto aplicando la
   fórmula correspondiente (con husos y carro para descarga; con muestreo
   proporcional para avance). No se ingresa peso neto directo.
2. **Solo FIN producen en Preparación:** Las máquinas FIN-A y FIN-B son las
   únicas que registran producción en Preparación. Las PSJ solo registran avance.
3. **Madejeras no usa husos ni tara:** Madejeras registra madejas producidas
   (valor numérico) y peso unitario estimado. No aplica el cálculo con husos.
4. **Múltiples descargas por turno:** Una máquina puede tener varias descargas
   en un mismo turno, o ninguna. Cada descarga es un registro independiente.
5. **Cambio de título durante el turno:** Una máquina puede cambiar de título
   dentro del mismo turno, o trabajar con títulos diferentes simultáneamente
   en distintos husos. Cada descarga lleva el título que le corresponde.
6. **Inmutabilidad:** Una vez registrada una descarga, no se modifica ni
   elimina. Las correcciones son nuevos registros con trazabilidad.

---

## 4. Avance

### 4.1 Naturaleza del Registro

El registro de avance es un **reporte/resumen** por máquina, turno y título.
A diferencia de la producción (granular por descarga), el avance consolida
en un solo registro:

- Lo que **entró** a la máquina/sección como materia prima
- Lo que **se produjo** (sumatoria de descargas del turno)
- Lo que **sale** como producto hacia la siguiente sección

Es decir, el avance es una **sumatoria del detalle de producción** más los
datos de entrada y salida del proceso.

**Cálculo del peso en avance:** A diferencia de las descargas (que se pesan
por carro completo), en el avance el peso de entrada y salida se calcula
**por muestreo de huso**: se pesa 1 huso, se resta su tara, y se multiplica
por el número total de husos de la máquina. Se asume que todos los husos
tienen el mismo peso.

### 4.2 Secciones con Avance

Solo 3 secciones registran avance:

| Sección | Quién registra | Datos registrados |
|---|---|---|
| **Preparación** | Calidad | Peso de entrada, peso total descargado (suma de descargas), peso de salida |
| **Continuas** | Calidad | Peso de entrada, peso neto en máquina, peso total descargado, No. husos, horas trabajadas, peso de salida |
| **Retorcido** | Inventario | Peso de entrada, peso neto en máquina, peso total descargado, No. husos, horas trabajadas, peso de salida |

**Bobinados y Madejeras no registran avance.**

### 4.3 Granularidad

Cada registro de avance representa: **1 máquina × 1 turno × 1 fecha × 1 título**.

### 4.4 Propósito del Avance

El avance permite:

- **Validación cruzada:** El peso total descargado (del avance) debe coincidir
  con la suma de las descargas individuales de producción.
- **Cálculo de merma:** Diferencia entre peso de entrada y peso de salida revela
  pérdidas en la sección.
- **Productividad:** kg/hora por máquina y sección.
- **Estado del proceso:** Saber cuánto material está procesando cada sección.

---

## 5. Calidad de Proceso

### 5.1 Responsable

**Calidad** es responsable del control de calidad de proceso en TODAS las
secciones de Yarn Spinning, sin excepción. La frecuencia y el método varían
según la sección.

### 5.2 Métodos por Sección

| Sección         | Método                     | Descripción                                                                                       |
| --------------- | -------------------------- | ------------------------------------------------------------------------------------------------- |
| **Preparación** | Muestras                   | Se toman muestras de Preparación A y B para evaluar consistencia                                  |
| **Continuas**   | Muestras (12/máquina/tipo) | 12 muestras por máquina y tipo de hilado. Evalúa CV%, tenacidad, elongación                       |
| **Bobinados**   | Body/km/cortes             | No se toman muestras. Se registran datos de la máquina: body, kilómetros, cortes por bobina       |
| **Retorcido**   | Aleatoria                  | Pruebas aleatorias. Frecuencia menor que en Preparación y Continuas                               |
| **Madejeras**   | Aleatoria                  | Pruebas aleatorias. Madejeras no tiene calidad de proceso sistemática (se evalúa a nivel de lote) |

### 5.3 Datos Registrados

Por cada control de calidad se captura:

- **Sección, máquina y turno** evaluados
- **Tipo de muestra:** según el título evaluado (HB, N, CH, etc.)
- **Resultados de las pruebas:** varían según el método:
  - *Muestras:* valores individuales de cada muestra, CV%, tenacidad
  - *Body/km/cortes:* datos registrados por la máquina
  - *Aleatorio:* resultados de las pruebas realizadas
- **Quién registra** (Calidad)

### 5.4 Reglas de Calidad

1. **Todas las secciones son evaluadas:** No hay excepciones. Calidad prueba
   todas las máquinas en todas las secciones.
2. **Frecuencia variable:** Preparación y Continuas tienen muestreo sistemático.
   Retorcido y Madejeras tienen muestreo aleatorio. Bobinados usa registro de
   máquina en lugar de muestras.
3. **Nomenclaturas especiales:** Como resultado de la calidad de proceso y de
   lote, Calidad asigna nomenclaturas al PT (-AT alta torsión, -FT fuera de
   tabla, -VARR con varrilla, -D devanado, -SN, -Dev, etc.). Esto aplica al
   lote completo, no a la máquina individual.
4. **Registro separado:** La calidad de proceso en Yarn Spinning es distinta e
   independiente de la calidad de lote (evaluación final en Lot Processing).

---

## 6. Desperdicio

### 6.1 Responsable

**Inventario** registra el desperdicio real de TODAS las secciones y máquinas
de la planta, incluyendo Yarn Spinning.

### 6.2 Datos Registrados

Por cada registro de desperdicio se captura:

- **Sección** y **grupo de máquinas** (se pesan juntas)
- **Turno** y **fecha**
- **Peso** del desperdicio
- **Tipo:** real o acumulado
- **Quién registra** (Inventario)

### 6.3 Reglas de Desperdicio

1. **Desperdicio por grupo de máquinas:** Las máquinas se pesan juntas
   físicamente. No se pesa máquina por máquina.
2. **Desperdicio real vs acumulado:** El desperdicio real lo registra
   Inventario. El desperdicio acumulado lo gestiona Producción. La suma
   de ambos se denomina "desperdicio teórico".
3. **Madejeras — desperdicio excepcional:** Las madejas fuera de
   especificación no se registran como desperdicio convencional. Retornan
   a una etapa anterior del proceso para reproceso.
4. **Inmutabilidad:** Una vez registrado, el desperdicio no se modifica.
   Las correcciones son nuevos registros.

---

## 7. Actores y Responsabilidades

| Actor                      | Rol en Yarn Spinning                                                                                                   |
| -------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| **Supervisor**             | Supervisa la producción de su turno. Responsable de la planta y del personal. Verifica coherencia de datos.            |
| **Control de Calidad**     | Realiza pruebas de calidad en TODAS las secciones y máquinas. Registra producción y avance de Preparación y Continuas. |
| **Inventario**             | Registra producción y avance de Retorcido y Madejeras. Registra desperdicio real de todas las secciones.               |
| **Embolsado**              | No interviene directamente en Yarn Spinning. Su participación comienza en Lot Processing.                              |
| **Personal de Tintorería** | No interviene en Yarn Spinning.                                                                                        |

---

## 8. Requerimientos Funcionales

### 8.1 Producción

| ID       | Requerimiento                                                                                                                         |
| -------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| YS-PR-01 | El sistema debe permitir registrar producción por máquina, turno, fecha y título para cada sección.                                   |
| YS-PR-02 | El sistema debe calcular el peso neto automáticamente (gross - tare).                                                                 |
| YS-PR-03 | El sistema debe validar que solo las máquinas FIN (A/B) registren producción en Preparación.                                          |
| YS-PR-04 | El sistema debe permitir el registro de Madejeras con madejas y peso unitario, no peso bruto/tara.                       |
| YS-PR-05 | El sistema debe asignar quién registra según la sección: Calidad para Preparación y Continuas, Inventario para Retorcido y Madejeras. |
| YS-PR-06 | El sistema debe permitir al Supervisor consultar la producción de su turno en todas las secciones.                                    |

### 8.2 Avance

| ID       | Requerimiento                                                                                                                          |
| -------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| YS-AV-01 | El sistema debe permitir registrar avance (entrada/salida) por máquina, turno, fecha y título para Preparación, Continuas y Retorcido. |
| YS-AV-02 | El sistema debe calcular la diferencia entrada - salida para detectar merma en cada sección.                                           |
| YS-AV-03 | Bobinados y Madejeras no deben tener formulario de avance.                                                                             |

### 8.3 Calidad de Proceso

| ID       | Requerimiento                                                                                                                                         |
| -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| YS-QL-01 | El sistema debe permitir registrar controles de calidad por máquina, turno y sección.                                                                 |
| YS-QL-02 | El sistema debe soportar los 3 métodos de calidad: muestras (Preparación, Continuas), body/km/cortes (Bobinados), y aleatorio (Retorcido, Madejeras). |
| YS-QL-03 | El sistema debe permitir registrar nomenclaturas especiales del PT a nivel de lote (no por máquina).                                                  |
| YS-QL-04 | Calidad debe poder consultar el historial de calidad de cualquier máquina y sección.                                                                  |

### 8.4 Desperdicio

| ID       | Requerimiento                                                                                                                                      |
| -------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| YS-WS-01 | El sistema debe permitir registrar desperdicio por grupo de máquinas, no por máquina individual.                                                   |
| YS-WS-02 | El sistema debe distinguir entre desperdicio real (registrado por Inventario) y teorico (real + acumulado).                             |
| YS-WS-03 | El sistema debe manejar el caso especial de Madejeras: madejas fuera de especificación no se registran como desperdicio, se marcan para reproceso. |

### 8.5 Transversales

| ID       | Requerimiento                                                                                                              |
| -------- | -------------------------------------------------------------------------------------------------------------------------- |
| YS-TR-01 | Todos los registros de producción, avance, calidad y desperdicio son inmutables (append-only).                             |
| YS-TR-02 | Las correcciones deben ser nuevos registros con trazabilidad al registro original.                                         |
| YS-TR-03 | El sistema debe validar que el usuario tenga el rol adecuado para cada tipo de registro (Calidad, Inventario, Supervisor). |
| YS-TR-04 | El Supervisor debe poder visualizar un consolidado de producción, avance, calidad y desperdicio de su turno.               |

---

## 9. Métricas y Reportes

A partir de los datos registrados (producción, avance, calidad y desperdicio),
el sistema debe calcular las siguientes métricas para el dashboard de cada
sección y el consolidado del Supervisor.

### 9.1 Métricas de Producción

| Métrica | Unidad | Propósito |
|---|---|---|
| **Total descargado** | kg | Suma de todas las descargas del período (turno/día/semana) por máquina, título y sección |
| **Número de descargas** | — | Cantidad de descargas realizadas en el período. Ayuda a detectar frecuencia de descarga |
| **Promedio por descarga** | kg | Total descargado / número de descargas. Control de consistencia |

### 9.2 Métricas de Avance

| Métrica | Unidad | Propósito |
|---|---|---|
| **Productividad** | kg/h | Peso total descargado / horas trabajadas. Por máquina y sección |
| **Merma** | kg | Peso de entrada − peso de salida. Pérdida de material en la sección |
| **Merma relativa** | % | (entrada − salida) / entrada × 100 |
| **Horas efectivas** | h | Horas registradas por máquina en el turno |

### 9.3 Métricas de Calidad

| Métrica | Propósito |
|---|---|
| **CV% promedio** | Consistencia del hilado en las pruebas de muestras |
| **Muestras fuera de tolerancia** | Porcentaje de muestras que no pasan los límites establecidos |
| **Body promedio** | Nivel de imperfecciones en Bobinados |
| **Cortes por bobina** | Frecuencia de cortes en Bobinados |

### 9.4 Métricas de Desperdicio

| Métrica | Unidad | Propósito |
|---|---|---|
| **Desperdicio real** | kg | Suma del desperdicio registrado por Inventario en el período |
| **Tasa de desperdicio** | % | Desperdicio real / total producido × 100. Por sección y grupo de máquinas |

### 9.5 Métricas Transversales

| Métrica | Propósito |
|---|---|
| **Producción vs planificación** | Compara lo producido con la base planificada (ver `operation.md §5`). Alerta si hay desviación significativa, especialmente en títulos 2/18 y 2/32 |
| **Utilización de husos** | Husos operativos / husos totales de la máquina. Porcentaje de capacidad utilizada |
| **Consolidado por turno** | Producción, calidad y desperdicio agregado por Supervisor para su reporte diario |

> **Nota:** Las fórmulas detalladas, filtros temporales (cruce con turno anterior),
> y lógica de cálculo específica se documentarán en la especificación de métricas
> o en el diseño del dominio, no en este PRD.

---

## 10. Decisiones Diferidas

| Decisión                                               | Estado                                                                                                                                                                            |
| ------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Responsable de registro de producción en Bobinados** | Pendiente. Actualmente no hay un responsable fijo; el Supervisor asigna según el turno. Definir si lo asume Calidad, Inventario, o queda como asignación dinámica del Supervisor. |
| **Frecuencia exacta de muestreo aleatorio**            | Pendiente. Definir la frecuencia mínima de pruebas aleatorias en Retorcido y Madejeras (ej. N pruebas por semana, o por cada N kg producidos).                                    |

---

## 11. Glosario

| Término                   | Definición                                                                                                                      |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| **Finisor**         | Máquinas Finisores en Preparación. Las únicas que registran producción en esa sección.                                          |
| **Pasaje**                   | Máquinas de Preparación A/B. Solo registran avance (entrada/salida), no producción.                                             |
| **Título**                | Designación del grosor del hilado (ej. 2/18, 2/32, 4/9). Se produce durante Yarn Spinning.                                      |
| **Huso**                  | Unidad de producción en las máquinas de hilatura (Continuas, Bobinados, Retorcido).                                             |
| **Madeja**                | Unidad de producción en Madejeras. El hilado se presenta en madejas (ovillos sueltos), no en conos.                             |
| **Body**                  | Medida de calidad en Bobinados. Registro de imperfecciones por unidad de longitud.                                              |
| **CV%**                   | Coeficiente de variación — medida de consistencia del hilado en las pruebas de calidad.                                         |
| **Nomenclatura especial** | Sufijo agregado al código del lote que indica una característica del PT (-AT, -FT, -VARR, -D, -SN, -Dev). Asignado por Calidad. |
| **Desperdicio real**      | Desperdicio registrado por Inventario durante el proceso, por grupo de máquinas.                                                |
| **Desperdicio teórico**   | Suma del desperdicio real + acumulado.                                                                              |
