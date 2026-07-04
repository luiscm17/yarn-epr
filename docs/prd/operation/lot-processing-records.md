# Registros Funcionales — Proceso por Lotes (`Lot Processing`)

> **Encadenado desde:** `docs/prd/operation/lot-processing.md`
> **Relacionados:** `docs/prd/operation.md`, `docs/prd/access-control.md`

---

## 1. Propósito

Este documento describe los **registros funcionales** del **Proceso por Lotes
(`Lot Processing`)**.

Su función es servir como puente entre:

- el PRD del negocio
- el diseño posterior del dominio
- el futuro modelado de datos
- el diseño de formularios, validaciones y pantallas

No define tablas, columnas técnicas ni estructura de base de datos. Define
qué necesita registrar el negocio, con qué granularidad y con qué significado.

---

## 2. Regla transversal de uso

Los registros descritos aquí reflejan la operación actual esperada.

- El **registrador actual** indica quién carga hoy ese dato.
- Esa asignación **no es rígida**: puede cambiar por política de acceso.
- El proceso mantiene un **historial único del lote**.

Cada etapa no crea un documento aislado de “entrega” y otro de “recepción”.
En cambio, cada etapa completa **un único registro de etapa**, donde se combinan:

1. **datos heredados** de la etapa anterior o de Almacén
2. **datos que la etapa puede verificar localmente**
3. **datos nuevos generados por la propia etapa**
4. **observaciones, desperdicio y condición de salida**

Además, cada registro de etapa debe distinguir explícitamente entre:

- **fecha de negocio**: la fecha operativa ingresada por el usuario responsable
- **turno**: el turno seleccionado por el usuario responsable
- **timestamp de registro**: la fecha y hora capturada automáticamente por el sistema

Estas tres piezas no representan el mismo evento y no deben confundirse.

Este enfoque representa mejor la operación real y evita duplicar registros que
después complican el diseño de dominio, la auditoría y la base de datos.

---

## 3. Familia principal de registro

En Proceso por Lotes la familia principal es:

1. **Registro de etapa del lote**

Cada etapa aporta un registro al historial único del lote. Ese registro puede
incluir, según corresponda:

- datos de ingreso
- datos verificados localmente
- datos técnicos del proceso
- desperdicio de la etapa
- observaciones o incidencias
- condición de salida hacia la etapa siguiente

Además, Inventario recibe y consolida información de desperdicio generada por
otras secciones, sin que eso reemplace el registro propio de cada etapa dentro
del historial del lote.

---

## 4. Registro por etapa

## 4.1 Inventario — Armado del lote

- **Qué representa:** nacimiento físico del lote dentro del proceso.
- **Granularidad:** 1 lote × 1 registro de etapa Inventario.

### Datos heredados o de referencia

- código de lote definido por Almacén
- título
- color
- cliente o destino
- especificaciones del pedido

### Datos que Inventario verifica localmente

- disponibilidad de madejas del título requerido
- cantidad de madejas reunidas
- peso total del lote armado

### Datos generados por la etapa

- fecha de negocio
- turno
- responsable que arma el lote
- supervisor a cargo
- cantidad final de madejas que componen el lote
- peso total del lote

### Datos técnicos automáticos

- timestamp de registro en el sistema

### Datos opcionales o contextuales

- observaciones
- incidencias de armado
- detalle de faltantes o diferencias
- motivo de corrección si hubo edición posterior

### Unidades o medición

- cantidad de madejas
- peso total en kg

### Registrador actual

- Inventario

### Nota de permisos

- configurable por política de acceso

---

## 4.2 Tintorería

- **Qué representa:** procesamiento del lote en tinas para aplicar color.
- **Granularidad:** 1 lote × 1 registro de etapa Tintorería.

### Datos heredados o de referencia

- código de lote
- título
- color requerido
- cantidad de madejas armadas por Inventario
- peso del lote informado por Inventario

### Datos que Tintorería verifica localmente

- cantidad de madejas recibidas
- coincidencia general con lo esperado para el lote

> **Importante:** Tintorería puede no contar con balanza propia. Por eso no debe
> simular una medición que no realiza. El sistema debe distinguir entre
> **dato heredado** y **dato verificado localmente**.

### Datos generados por la etapa

- fecha de negocio
- turno
- responsable de la etapa
- supervisor a cargo
- material o referencia de proceso si aplica
- temperatura
- número de tina
- reteñir sí/no
- condición de salida hacia Secado

### Datos técnicos automáticos

- timestamp de registro en el sistema

### Desperdicio de la etapa

- cantidad o peso del desperdicio si corresponde
- causa
- observaciones

### Datos opcionales o contextuales

- observaciones operativas
- incidencias de temperatura
- tina incorrecta o contaminada
- detalle del reteñido si ocurrió

### Unidades o medición

- madejas
- kg cuando exista medición real
- temperatura

### Registrador actual

- Personal de Tintorería

### Nota de permisos

- configurable por política de acceso

### Nota de consolidación

- el desperdicio de la etapa también llega a Inventario

---

## 4.3 Secado

- **Qué representa:** eliminación de humedad del lote después de Tintorería.
- **Granularidad:** 1 lote × 1 registro de etapa Secado.

### Datos heredados o de referencia

- código de lote
- cantidad de madejas
- información relevante de Tintorería

### Datos que Secado verifica localmente

- cantidad de madejas recibidas
- condición general del lote al ingresar

### Datos generados por la etapa

- fecha de negocio
- turno
- responsable de la etapa
- supervisor a cargo
- peso total al ingresar, si la operación realmente lo mide
- condición de salida hacia Devanado/Ovillado

### Datos técnicos automáticos

- timestamp de registro en el sistema

### Desperdicio de la etapa

- cantidad o peso del desperdicio si corresponde
- causa
- observaciones

### Datos opcionales o contextuales

- observaciones
- humedad excesiva
- incidencias del proceso

### Unidades o medición

- madejas
- kg cuando exista medición real

### Registrador actual

- Personal de Tintorería

### Nota de permisos

- configurable por política de acceso

### Nota de consolidación

- el desperdicio de la etapa también llega a Inventario

---

## 4.4 Devanado / Ovillado

- **Qué representa:** conversión del lote al formato final intermedio.
- **Granularidad:** 1 lote × 1 registro de etapa Devanado/Ovillado.

### Datos heredados o de referencia

- código de lote
- cantidad de madejas provenientes de Secado
- información de condición del lote

### Datos que la etapa verifica localmente

- cantidad de madejas recibidas para procesar
- consistencia general del lote respecto a la salida de Secado

### Datos generados por la etapa

- fecha de negocio
- turno
- responsable de la etapa
- supervisor a cargo
- variante del proceso: devanado u ovillado
- cantidad de conos u ovillos producidos
- condición de salida hacia Embolsado

### Datos técnicos automáticos

- timestamp de registro en el sistema

### Desperdicio de la etapa

- cantidad o peso del desperdicio generado en la conversión
- causa
- observaciones

### Datos opcionales o contextuales

- incidencias de equipo
- observaciones

### Unidades o medición

- madejas de entrada
- conos u ovillos de salida
- kg cuando aplique para desperdicio

### Registrador actual

- el responsable operativo hoy asignado a Devanado/Ovillado; actualmente puede coincidir con el mismo responsable que atiende Embolsado

### Nota de permisos

- configurable por política de acceso

### Nota de consolidación

- el desperdicio de la etapa también llega a Inventario

---

## 4.5 Embolsado

- **Qué representa:** empaque del producto final antes de Calidad.
- **Granularidad:** 1 lote × 1 registro de etapa Embolsado.

### Datos heredados o de referencia

- código de lote
- cantidad de conos u ovillos provenientes de Devanado/Ovillado
- información relevante de la etapa anterior

### Datos que Embolsado verifica localmente

- cantidad de conos u ovillos recibidos
- consistencia del lote para empaque

### Datos generados por la etapa

- fecha de negocio
- turno
- responsable de la etapa
- supervisor a cargo
- cantidad de bolsas utilizadas
- cantidad de conos u ovillos por bolsa
- condición de salida hacia Calidad

### Datos técnicos automáticos

- timestamp de registro en el sistema

### Desperdicio de la etapa

- cantidad o peso del desperdicio generado en Embolsado
- causa
- observaciones

### Datos opcionales o contextuales

- incidencias de etiquetas o fichas
- observaciones

### Unidades o medición

- bolsas
- conos
- ovillos
- kg cuando aplique para desperdicio

### Registrador actual

- el encargado operativo de Embolsado

### Nota de permisos

- configurable por política de acceso

### Nota de consolidación

- el desperdicio de la etapa también llega a Inventario y permanece en el
  historial del lote

---

## 4.6 Calidad

- **Qué representa:** evaluación final del lote antes de su entrega a Almacén.
- **Granularidad:** 1 lote × 1 registro de etapa Calidad.

### Datos heredados o de referencia

- código de lote
- historial completo del lote
- datos relevantes de Embolsado

### Datos que Calidad verifica localmente

- condición real del producto terminado
- defectos visibles e internos
- correspondencia entre lo producido y lo entregable

### Datos generados por la etapa

- fecha de negocio de inspección
- turno de inspección
- responsable de calidad
- supervisor a cargo
- defectos visuales detectados
- defectos internos detectados
- estado de calidad del lote al momento de entrega
- condiciones de entrega a Almacén

### Datos técnicos automáticos

- timestamp de registro en el sistema

### Datos opcionales o contextuales

- nomenclatura especial según política vigente
- observaciones adicionales
- detalle de decisiones tomadas dentro de Operación antes de entregar

### Unidades o medición

- no aplica como unidad principal; usa catálogos, categorías y descripciones

### Registrador actual

- Control de Calidad

### Nota de permisos

- configurable por política de acceso

### Nota de cierre

- Calidad no clasifica definitivamente el inventario ni define la disposición
  comercial final. Calidad documenta el estado del lote y las condiciones con
  las que se entrega a Almacén.

---

## 5. Reglas transversales de los registros

1. **Nacimiento físico del lote:** el lote nace físicamente en este proceso,
   cuando Inventario arma el conjunto de madejas.
2. **Código definido externamente:** el código del lote es definido por Almacén;
   Operación no crea códigos nuevos.
3. **Historial único del lote:** cada etapa complementa el mismo historial con
   nuevos datos; no se modela como pares separados de entrega/recepción.
4. **Dato heredado vs dato verificado:** el sistema debe distinguir claramente
   qué información proviene de la etapa anterior y qué información fue verificada
   o medida realmente por la etapa actual.
5. **Tiempo de negocio vs tiempo de sistema:** cada etapa debe guardar la fecha
   de negocio y el turno ingresados por el usuario, además del timestamp de
   registro capturado automáticamente por el sistema.
6. **Corrección con auditoría:** si existe error de carga, el registro puede
   corregirse con auditoría completa.
7. **Ventana operativa:** los roles operativos pueden corregir dentro de la
   ventana definida por la política vigente.
8. **Restricción posterior:** fuera de la ventana operativa, solo SysAdmin puede
   editar.
9. **Sin estados intermedios formales:** demoras u observaciones se registran
   dentro de la etapa actual.
10. **Permisos configurables:** el registrador actual no equivale a permiso fijo.
11. **Continuidad del historial en Almacén:** al terminar Operación, el historial
   del lote continúa bajo la misma identidad en la Unidad Almacén.

---

## 6. Cómo usar este documento más adelante

Este documento debe alimentar, en ese orden:

1. **modelo de dominio**
   - qué conceptos son entidades, eventos o value objects
2. **modelado de datos**
   - qué información persistir
   - cómo agrupar registros funcionales
   - qué relaciones conceptuales deben mantenerse
3. **formularios y UI**
   - qué pantallas necesita cada etapa
   - qué datos son obligatorios
   - qué datos son heredados
   - qué datos deben verificarse localmente
   - qué datos ingresa el usuario y qué datos captura automáticamente el sistema
4. **reglas de validación**
   - secuencia entre etapas
   - control de completitud
   - consistencia de pesos, cantidades y entregas

No debe usarse directamente como diseño de tablas. Su función es cerrar el
significado funcional del dato antes del diseño técnico.

---

## 7. Ambigüedades todavía abiertas

1. Debe precisarse si algunos desperdicios se registran en peso, cantidad o
   ambas medidas según la etapa.
2. Conviene cerrar con más detalle la estructura de las condiciones de entrega
   usadas por Calidad al derivar el lote a Almacén.
