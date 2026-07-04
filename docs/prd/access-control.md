# SISTEMA DE GESTIÓN DE PRODUCCIÓN TEXTIL — Control de Acceso

> **Cross-cutting PRD — Roles, permisos y autorización**
>
> Define los requisitos de negocio y producto para el control de acceso del
> sistema, de forma transversal a todas las direcciones, unidades, procesos y
> áreas.
>
> Este documento complementa los PRD de dominio. No redefine sus procesos: define
> cómo se gobierna quién puede ver, registrar, validar, aprobar, consolidar o
> administrar información dentro del sistema.

---

## 1. Propósito

Establecer un modelo de control de acceso que permita que el sistema evolucione
con la organización, sin quedar atado rígidamente a la estructura actual de
cargos, áreas o unidades.

El sistema debe soportar cambios organizacionales como:

- creación de nuevos roles
- retiro de roles existentes
- división o fusión de responsabilidades
- reasignación de permisos entre áreas, unidades, procesos o turnos
- excepciones puntuales para usuarios específicos

sin exigir rediseño funcional de los procesos de negocio ya definidos en los PRD
de dominio.

---

## 2. Alcance

Este PRD aplica a todo el sistema.

Incluye:

- Dirección de Producción
- Unidad Almacén
- Unidad Operación
- Administración
- futuras direcciones o áreas que se incorporen al sistema

No define autenticación ni infraestructura técnica. Su foco es la
**autorización**: qué puede hacer cada usuario dentro del sistema y en qué
ámbito puede hacerlo.

---

## 3. Problema que resuelve

La organización puede cambiar con el tiempo. Un mismo proceso puede mantenerse
estable mientras cambian:

- los cargos que participan
- quién registra los datos
- quién valida
- quién aprueba
- quién consolida información

Si el sistema ata los permisos directamente a la estructura organizacional del
momento, cada cambio interno obliga a rediseñar formularios, reglas o flujos.

El sistema debe separar:

1. **la responsabilidad operativa del negocio**
2. **la autorización para actuar dentro del sistema**

Ambas se relacionan, pero no son equivalentes.

---

## 4. Conceptos base

### 4.1 Actores organizacionales

Son los cargos, funciones o personas que existen en la organización real.

Ejemplos:

- Jefe de Producción
- Secretaría de Producción
- Supervisor
- Control de Calidad
- Inventario
- Jefe Unidad Almacén
- Administración

Estos actores describen la estructura y las responsabilidades del negocio.

### 4.2 Roles del sistema

Son perfiles de capacidad dentro de la aplicación. Definen qué tipo de acciones
puede realizar un usuario, independientemente del nombre exacto de su cargo.

Un actor organizacional puede mapearse a uno o más roles del sistema, y ese
mapeo puede cambiar con el tiempo.

### 4.3 Permisos

Son capacidades concretas sobre información o procesos del sistema.

Ejemplos de acciones:

- registrar
- leer
- validar
- aprobar
- consolidar
- corregir
- administrar

### 4.4 Ámbitos o scopes

Los permisos no solo dependen de la acción, sino también del ámbito donde
aplican.

Ejemplos de ámbito:

- una dirección
- una unidad
- un proceso
- una sección
- una etapa de lote
- un turno

Esto permite que un usuario tenga capacidad en una parte del sistema y no en
otra.

---

## 5. Requisitos del sistema

### 5.1 Permisos configurables

El sistema debe permitir configurar quién puede realizar acciones sobre cada
proceso, sección, etapa o recurso sin alterar el flujo de negocio definido en
los PRD de dominio.

### 5.2 Independencia del organigrama actual

El modelo de permisos no debe depender rígidamente de los nombres actuales de
los cargos ni asumir que la organización permanecerá igual en el tiempo.

### 5.3 Evolución organizacional

El sistema debe soportar sin rediseño funcional:

- creación de nuevos roles
- eliminación de roles
- cambio de responsabilidades
- reasignación de permisos entre roles
- incorporación de nuevas direcciones, áreas o unidades

### 5.4 Permisos por ámbito

El sistema debe poder asignar permisos en ámbitos distintos, por ejemplo:

- toda una dirección
- una unidad específica
- un proceso determinado
- una sección concreta
- un turno particular

### 5.5 Separación entre registrar, validar y aprobar

El sistema debe distinguir entre:

- quién registra información
- quién la valida
- quién la aprueba
- quién la consolida
- quién solo la consulta

Estas capacidades pueden recaer en el mismo rol o en roles distintos, según la
política vigente.

### 5.6 Excepciones controladas

El sistema debe permitir excepciones puntuales para usuarios específicos cuando
la operación lo requiera, sin convertir esas excepciones en una redefinición del
modelo general.

### 5.7 Trazabilidad de permisos

Todo cambio relevante en asignaciones de acceso debe ser auditable. Debe poder
conocerse:

- qué permiso tenía un usuario
- en qué ámbito aplicaba
- desde cuándo aplicó
- qué cambio se realizó

### 5.8 Coherencia con los PRD de dominio

Los PRD de dominio describen procesos, actores y operación esperada. Este PRD
define cómo el sistema traduce eso en permisos configurables sin congelar la
estructura organizacional en el software.

---

## 6. Reglas de negocio transversales

1. **Los procesos no deben rediseñarse por cambios de permisos.**
   Si cambia el rol que registra una sección o etapa, el flujo del proceso debe
   mantenerse estable.

2. **Los cargos organizacionales no equivalen automáticamente a permisos.**
   Un mismo cargo puede tener distintas capacidades según el área, el turno o la
   decisión vigente de la empresa.

3. **Los permisos pueden cambiar sin cambiar el dominio.**
   Una reasignación de registro, validación o aprobación es una decisión de
   política de acceso, no una redefinición del proceso productivo.

4. **Las excepciones deben ser explícitas y trazables.**
   Los permisos especiales para usuarios puntuales deben quedar identificados y
   auditables.

5. **La lectura y la intervención son capacidades distintas.**
   Consultar información no implica poder registrarla, validarla o aprobarla.

6. **El sistema debe tolerar crecimiento organizacional.**
   La aparición de nuevas direcciones, áreas, unidades o funciones no debe
   invalidar el modelo de acceso existente.

---

## 7. Ejemplos de uso esperados

### 7.1 Reasignación dentro de una sección

Hoy, en una sección determinada, el registro puede estar a cargo de
**Inventario**. Mañana la empresa puede decidir que ese registro pase a
**Control de Calidad**.

El sistema debe permitir ese cambio sin:

- rediseñar el proceso
- reescribir el PRD del proceso
- perder trazabilidad histórica

### 7.2 Distintos permisos para el mismo cargo

Dos usuarios con el mismo cargo organizacional pueden tener permisos distintos
si trabajan en ámbitos diferentes o si existe una excepción aprobada.

### 7.3 Nuevas áreas futuras

Si el sistema incorpora una nueva dirección o área, el modelo de control de
acceso debe poder extenderse a ese nuevo ámbito sin romper lo ya definido para
Producción, Almacén u Operación.

---

## 8. Relación con los PRD de dominio

### PRD maestro (`docs/prd.md`)

Define el marco organizacional, las unidades, los actores y las reglas
transversales del sistema.

### PRD de Operación (`docs/prd/operation.md`)

Describe la operación productiva, los turnos, los roles operativos y la
asignación actual o esperada de responsabilidades dentro del proceso.

### PRD de Almacén (`docs/prd/warehouse.md`)

Describe la operación documental y física de Almacén, sus movimientos y sus
actores.

### Este PRD transversal

Define cómo esas responsabilidades se convierten en permisos configurables,
auditables y reasignables dentro del sistema.

---

## 9. No objetivos

Este documento no define:

- el proveedor o mecanismo de autenticación
- tablas de base de datos
- endpoints o contratos técnicos
- estructura de tokens o sesiones
- detalles de implementación interna

Tampoco reemplaza los PRD de dominio. Su función es servir como contrato de
producto para la autorización transversal.

---

## 10. Decisiones abiertas

1. Qué nivel de administración de permisos existirá en la primera versión:
   - solo configuración controlada por desarrollo/soporte
   - o interfaz administrativa para gestión de permisos

2. Qué reglas de excepción requieren aprobación especial.

3. Qué nivel de granularidad de scopes se necesitará inicialmente:
   - dirección
   - unidad
   - proceso
   - sección
   - turno

---

## 11. Glosario

| Término | Definición |
|---|---|
| **Control de acceso** | Conjunto de reglas que determina qué puede hacer un usuario dentro del sistema. |
| **Autorización** | Decisión sobre si un usuario puede ejecutar una acción en un ámbito determinado. |
| **Rol del sistema** | Perfil de capacidades usado para asignar permisos dentro de la aplicación. |
| **Actor organizacional** | Cargo, función o persona definida por la estructura real de la empresa. |
| **Permiso** | Capacidad concreta para actuar sobre información o procesos del sistema. |
| **Scope / ámbito** | Alcance donde aplica un permiso, como dirección, unidad, proceso, sección o turno. |
| **Excepción** | Permiso especial o restricción particular aplicada a un usuario o caso específico. |
| **Trazabilidad de permisos** | Capacidad de reconstruir históricamente qué permisos existían, cuándo y para quién. |
