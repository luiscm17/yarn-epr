# Auth — Autenticación y Autorización

> **Domain PRD — Auth (cross-cutting)**
>
> Define el modelo de autenticación, roles, permisos y scopes del sistema.
>
> Es un **cross-cutting concern**: no pertenece a una unidad de negocio
> específica sino que aplica a todos los dominios (Almacén, Operación,
> Administración, y futuros).

---

## 1. Propósito y Alcance

### 1.1 Propósito

Definir cómo los usuarios acceden al sistema (autenticación) y qué pueden hacer
una vez dentro (autorización), de forma que:

- Cada persona acceda solo a lo que necesita para su trabajo
- El modelo sea **genérico** y escalable a nuevas direcciones sin reescribir
  permisos
- Las restricciones finas (ej. "ver detalle solo de su turno") se resuelvan
  en la capa de servicio, no en el motor de permisos

### 1.2 Alcance

| Incluye | No incluye |
|---|---|
| Autenticación (login, JWT, Supabase Auth) | Restricciones por instancia (ej. "no puede aprobar una emisión de otro turno") |
| Roles genéricos (operator, technician, overseer, director, executive, sysadmin) | Lógica de negocio que aplica esas restricciones |
| Scopes jerárquicos (production.*, warehouse.*, operation.*, etc.) | |
| Asignación usuario → rol → scope | |
| Excepciones por asignación (allow/deny granular) | |
| Gestión de usuarios (CRUD solo por admin) | |

### 1.3 Principios de diseño

1. **No hay registro público (sign-up).** Solo un usuario con rol `sysadmin`
   o `director` puede crear usuarios en el sistema.

2. **Roles genéricos, no específicos.** Los roles se definen por nivel de
    capacidad (`operator`, `technician`, `overseer`, `director`, `executive`, `sysadmin`),
   no por cargo (`supervisor`, `inventory`). El cargo se mapea a un rol +
   un scope.

3. **Scopes jerárquicos.** Un usuario puede ver `warehouse.*` (todo almacén)
   o solo `warehouse.mp` (materia prima). Los scopes hijos heredan del padre.

4. **El contexto de negocio no vive en el permiso.** El motor de permisos
   responde "¿puede este usuario, en teoría, leer registros de producción?".
   La capa de servicio responde "¿puede leer ESTE registro en particular?".

5. **Excepciones explícitas.** Si un usuario necesita un permiso que su rol
   no tiene, o no debería tener uno que su rol sí tiene, se registra como
   excepción en su asignación — no se crea un rol nuevo.

---

## 2. Actores del Sistema

### 2.1 Organigrama

Basado en el PRD Maestro (`docs/prd.md §2.1`):

```
                    GERENCIA
                       │
         ┌─────────────┼─────────────┐
         │             │             │
         ▼             ▼             ▼
    ┌─────────┐ ┌───────────┐ ┌────────────────┐
    │PRODUC-  │ │ADMINIS-   │ │COMERCIALIZA-   │
    │CIÓN     │ │TRACIÓN    │ │CIÓN            │
    └────┬────┘ └───────────┘ └────────────────┘
         │
         ▼
┌──────────────────────────────┐
│   DIRECCIÓN DE PRODUCCIÓN    │
│                              │
│  ┌──────────────────────┐   │
│  │ JEFE DE PRODUCCIÓN   │   │
│  │ + Secretaria         │   │
│  └────────┬─────────────┘   │
│           │                 │
│     ┌─────┴─────┐           │
│     │           │           │
│     ▼           ▼           │
│ ┌────────┐ ┌──────────┐    │
│ │ALMACÉN │ │OPERACIÓN │    │
│ │Jefe +  │ │Supervis. │    │
│ │Auxil.  │ │(x turno) │    │
│ └────────┘ │+ Calidad  │    │
│            │+ Invent.  │    │
│            │+ Tintor.  │    │
│            │+ Embols.  │    │
│            └──────────┘    │
└───────────────┬─────────────┘
                │
                ▼
        ┌──────────────┐
        │ADMINISTRACIÓN│
        │(1 persona —  │
        │ nexo Gcia)   │
        └──────────────┘
```

### 2.2 Tabla de actores

| Actor | Cant. | ¿Usa el sistema? | Descripción |
|---|---|---|---|
| **Jefe de Producción** | 1 | Sí | Usuario central. Autoriza, supervisa ambas unidades, consolida reporte diario. |
| **Secretaria** | 1 | Sí | Opera con el Jefe de Producción. Mismo nivel pero sin autorizar emisiones. |
| **Jefe Unidad Almacén** | 1 | Sí | Supervisa recepción, emisiones, verificación PT, control de inventarios. |
| **Auxiliar Operativo (Almacén)** | — | Sí | Ejecuta y registra movimientos físicos. |
| **Supervisor** | 3 (1/turno) | Sí | A cargo de la operación en su turno. Registra producción, calidad, lotes, desperdicio. Ve detalle solo de su turno, puede ver general de toda la operación. |
| **Calidad** | — | Sí | Pruebas y control de calidad en todas las secciones. Registra producción en Preparación y Continuas. |
| **Inventario** | — | Sí | Registra producción en Retorcido y Madejeras. Registra desperdicio de todas las secciones. Gestiona lotes. |
| **Tintorería** | — | Sí | Opera el proceso de tintorería en lotes. |
| **Embolsado** | — | Sí | Organiza operadores, registra datos de producción del turno. |
| **Administración** | 1 | Sí | Recibe y revisa reportes consolidados. Nexo con Gerencia. |
| **Gerencia** | 1 | No directo | Recibe reporte diario consolidado (puede tener usuario de solo lectura). |
| **Operarios** | — | **No** | Operan máquinas. Su producción la registra el Supervisor. |
| **SysAdmin** | 1-2 | Sí | Crea y gestiona usuarios y sus asignaciones. La estructura de permisos (scopes, resource types, matriz) se define en seed + deploy. No opera ningún dominio de negocio. |

---

## 3. Modelo de Autorización

### 3.1 Conceptos

```
Usuarios ──tienen──> Asignaciones ──tienen──> Roles (nivel genérico)
                         │                        │
                         │                   Acciones base
                         │                   (create, read, approve, etc.)
                         │
                         └──> Scope (ámbito jerárquico)
                              └──> Excepciones (allow/deny granular)
```

- **Usuario:** Persona que accede al sistema. Creada solo por admin.
- **Rol (Role Definition):** Nivel genérico de capacidad. No sabe qué dominio
  opera — solo define qué acciones puede realizar.
- **Scope:** Ámbito jerárquico donde aplica el rol. Ej: `warehouse.*`,
  `operation.quality`.
- **Asignación:** Víncula un usuario con un rol y un scope.
- **Excepción:** Permiso adicional o denegado dentro de una asignación, sin
  crear un nuevo rol.

### 3.2 Roles (Role Definitions)

Son **genéricos** y aplican a cualquier dominio. No mencionan cargos ni
direcciones específicas.

| Código | Display name | Acciones base | ¿Quién lo usa en el sistema? |
|---|---|---|---|
| `executive` | Ejecutivo | `read` | Gerencia / Administración. Solo lectura de reportes consolidados. |
| `director` | Director | `read, approve, consolidate, manage` | Jefe de Producción. Autoriza entre unidades. Secretaria (con excepciones). |
| `overseer` | Supervisor | `read, create, approve, manage` | Supervisor de turno (Operación), Jefe de Unidad (Almacén). Gestionan y autorizan en su ámbito. |
| `technician` | Técnico | `create, read_own` | Calidad, Inventario, Tintorería, Embolsado. Lideran procesos específicos dentro de un área. |
| `operator` | Operador | `create, read_own` | Auxiliares Operativos de Almacén. Ejecutan movimientos sin supervisión sobre otros. |
| `sysadmin` | SysAdmin | `manage` | Gestión de usuarios y asignaciones. No configura scopes, resource types ni la matriz (van en seed + deploy). No opera ningún dominio de negocio. |

### 3.3 Scopes

Definen el ámbito jerárquico donde aplica un rol. Se implementan con
**ltree** (extension nativa de PostgreSQL: `CREATE EXTENSION ltree`),
que modela el árbol mediante paths en lugar de lft/rgt, permitiendo
inserciones sin rebalancear.

```
system                          ← sysadmin               → path: 'system'

production.*                    ← director               → path: 'production'
├── warehouse.*                 ← overseer               → path: 'production.warehouse'
│   ├── warehouse.mp            ← operator (Aux. Almacén) → path: 'production.warehouse.mp'
│   ├── warehouse.pt                                      → path: 'production.warehouse.pt'
│   └── warehouse.supplies                                → path: 'production.warehouse.supplies'
├── operation.*                 ← overseer (Supervisor)   → path: 'production.operation'
│   ├── operation.production    ← technician (Inventario) → path: 'production.operation.production'
│   ├── operation.quality       ← technician (Calidad)    → path: 'production.operation.quality'
│   ├── operation.waste                                   → path: 'production.operation.waste'
│   └── operation.lots          ← technician (Tintorería, Embolsado) → path: 'production.operation.lots'

reports.*                       ← executive              → path: 'reports'
├── reports.daily                                         → path: 'reports.daily'
└── reports.admin                                         → path: 'reports.admin'
```

**Consultas con ltree:**
```sql
-- ¿quality está bajo operation?
SELECT * FROM scopes WHERE path @> 'production.operation';

-- Todos los hijos directos de operation?
SELECT * FROM scopes WHERE path ~ 'production.operation.*{1}';

-- Todos los descendientes de production?
SELECT * FROM scopes WHERE path <@ 'production';
```

### 3.4 Mapeo organigrama → asignaciones

| Persona | Rol | Scope | Excepciones |
|---|---|---|---|
| Jefe Producción | `director` | `production.*` | — |
| Secretaria | `director` | `production.*` | `deny: (emission, approve)`, `deny: (pt_sale, approve)` |
| Supervisor | `overseer` | `operation.*` | — |
| Calidad | `technician` | `operation.quality` | `allow: (production_record, create)` |
| Inventario | `technician` | `operation.production` | `allow: (waste_record, create)` |
| Tintorería | `technician` | `operation.lots` | — |
| Embolsado | `technician` | `operation.lots` | — |
| Jefe Almacén | `overseer` | `warehouse.*` | — |
| Auxiliar Almacén | `operator` | `warehouse.*` | — |
| Administración | `executive` | `reports.*` | — |
| Gerencia | `executive` | `reports.daily` | — |
| SysAdmin | `sysadmin` | `system` | — |

**Nota:** El Supervisor ve datos generales de toda la operación (dashboards,
métricas agregadas) por su scope `operation.*`. La restricción de "ver detalle
solo de su turno" se resuelve en la capa de servicio filtrando por el turno
asignado al usuario — no es parte del motor de permisos.

### 3.5 Sobre los operarios

Los operarios **no usan el sistema** (PRD §2.2). No tienen usuario. Su
producción la registra el Supervisor, Calidad o Inventario según la sección.
Cuando se requiera registrar datos de un operario (ej. nombre del operador
en Madejeras), se usa un campo de texto libre (`operator_name`), no una
referencia a usuario.

---

## 4. Requerimientos Funcionales

### 4.1 Autenticación

| ID | Requerimiento |
|---|---|
| AUTH-01 | El sistema debe autenticar usuarios mediante email y password usando Supabase Auth. |
| AUTH-02 | El sistema debe emitir un JWT con los claims del usuario (user_id, rol, scope) para autorización en backend. |
| AUTH-03 | No debe existir registro público (sign-up). Solo un usuario con rol `sysadmin` o `director` puede crear nuevos usuarios. |
| AUTH-04 | El sistema debe permitir sesión persistente (refresh token) mientras el usuario esté activo. |
| AUTH-05 | El sistema debe permitir cerrar sesión y revocar el token. |

### 4.2 Gestión de Usuarios

| ID | Requerimiento |
|---|---|
| AUTH-06 | El sistema debe permitir a `sysadmin` y `director` crear, editar y desactivar usuarios. |
| AUTH-07 | Al crear un usuario se debe asignar: nombre completo, email, rol, scope, y turno (si aplica). |
| AUTH-08 | Un usuario desactivado no puede iniciar sesión. |
| AUTH-09 | El sistema debe listar usuarios con su rol, scope y estado (activo/inactivo). |

### 4.3 Autorización (Permisos)

| ID | Requerimiento |
|---|---|
| AUTH-10 | El backend debe verificar permisos en cada operación: `check_access(user, resource, action) → bool`. |
| AUTH-11 | El sistema debe resolver permisos usando: asignaciones → excepciones → matriz rol × recurso × acción. |
| AUTH-12 | Las excepciones `deny` siempre ganan sobre cualquier `allow`. |
| AUTH-13 | El scope debe ser jerárquico: un permiso en `warehouse.*` cubre `warehouse.mp`, `warehouse.pt`, etc. |
| AUTH-14 | El frontend puede consultar los permisos del usuario para mostrar/ocultar acciones, pero el backend es la autoridad final. |
| AUTH-15 | El sistema debe rechazar con 401 (no autenticado) o 403 (no autorizado) según corresponda. |

### 4.4 Contexto de Negocio (Restricciones por Instancia)

| ID | Requerimiento |
|---|---|
| AUTH-16 | El Supervisor debe ver datos detallados solo de su turno asignado. El dashboard general (datos agregados) puede verlo de toda la operación. |
| AUTH-17 | Un usuario no puede aprobar/editar registros de otro turno a menos que tenga rol `director` o superior. |
| AUTH-18 | Las restricciones por instancia se validan en la capa de servicio, no en el motor de permisos. |

---

## 5. Matriz de Permisos

### 5.1 Resource Types

| Código | Display name | Dominio |
|---|---|---|
| `emission` | Emisión de MP a Operación | warehouse |
| `pt_reception` | Recepción de Producto Terminado | warehouse |
| `supplies_movement` | Movimiento de Insumos | warehouse |
| `inventory_adj` | Ajuste de inventario | warehouse |
| `production_record` | Registro de producción por máquina | operation |
| `advance_record` | Registro de avance | operation |
| `quality_test` | Control de calidad de proceso | operation |
| `waste_record` | Registro de desperdicio | operation |
| `lot_management` | Gestión de lotes (etapas) | operation |
| `daily_report` | Reporte diario consolidado | reports |
| `admin_report` | Reportes administrativos | reports |
| `user_management` | Gestión de usuarios | system |
| `catalog` | Gestión de catálogos | system |

### 5.2 Matriz rol × recurso × acción

```
                     operator technician overseer   director  exec     sysadmin
                     ──────────────────────────────────────────────────────────
warehouse:
  emission.create    allow     deny       allow     allow     deny     deny
  emission.request   allow     deny       allow     allow     deny     deny
  emission.read      allow     allow      allow     allow     deny     deny
  emission.approve   deny      deny       allow     allow     deny     deny

operation:
  prod_record.create   deny    allow↑    allow     allow     deny     deny
  prod_record.read     deny    allow     allow     allow     deny     deny
  prod_record.approve  deny    deny      allow     allow     deny     deny

  advance.create       deny    deny      allow     allow     deny     deny
  advance.read         deny    allow     allow     allow     deny     deny

  quality.create       deny    allow     allow     allow     deny     deny
  quality.read         deny    allow     allow     allow     deny     deny

  waste.create         deny    allow↑    allow     allow     deny     deny
  waste.read           deny    allow     allow     allow     deny     deny

  lot.create           deny    allow     allow     allow     deny     deny
  lot.read             deny    allow     allow     allow     deny     deny

reports:
  daily.read           deny    allow     allow     allow     allow    deny
  daily.consolidate    deny    deny      deny      allow     deny     deny
  admin.read           deny    deny      deny      allow     allow    deny

system:
  user_management      deny    deny      deny      allow     deny     allow
  catalog.manage       deny    deny      allow     allow     deny     allow

↑ Por excepción: Calidad → allow prod_record.create, Inventario → allow waste.create
```

---

## 6. Decisiones Diferidas

| Decisión | Estado |
|---|---|
| **Frecuencia de pruebas aleatorias** (Retorcido, Madejeras) | Pendiente. No afecta a Auth. |
| **¿El frontend debe ocultar acciones no permitidas o solo el backend rechaza?** | Pendiente. Lo recomendable es ambas: UX no muestra lo que no puede hacer + backend valida. |
| **¿El JWT debe incluir el scope completo del usuario o solo el role_def?** | Resuelto: JWT solo lleva `user_id` + `role_code`. Scopes y excepciones se resuelven desde una caché en memoria (LRU con TTL 5 min). Cache MISS → DB → popular caché. No requiere Redis en el volumen actual. |
| **Manejo de múltiples turnos para un usuario** (ej. Supervisor suplente) | Pendiente. Por ahora 1 usuario = 1 turno asignado. |
| **SysAdmin: ¿interno o externo?** | Pendiente. Podría ser un rol del sistema sin persona física (solo para onboarding inicial). |
| **Gobernanza de scopes, resource types y matriz** | Resuelto: todo en seed + código (Modelo A). Role definitions, scopes, resource types y matriz se definen en archivos seed ejecutados al deployar. SysAdmin o Director solicitan cambios vía ticket/PR. Sin UI de administración de permisos por ahora. |

---

## 7. Glosario

| Término | Definición |
|---|---|
| **Role Definition** | Nivel genérico de capacidad (operator, technician, overseer, director, executive, sysadmin). Define qué acciones puede realizar un usuario. |
| **Scope** | Ámbito jerárquico donde aplica un rol. Ej: `warehouse.*`, `operation.quality`. |
| **Asignación** | Vínculo entre un usuario, un rol y un scope. |
| **Excepción** | Permiso adicional (allow) o denegado (deny) dentro de una asignación. |
| **Restricción por instancia** | Validación de contexto de negocio que no resuelve el motor de permisos. Ej: "solo datos de mi turno". |
| **ltree** | Extensión de PostgreSQL para árboles jerárquicos mediante paths (`production.operation.quality`). Reemplaza nested sets para evitar rebalance en inserciones. Consultas: `@>` ancestro, `<@` descendiente, `~` patrón. |
| **Resource Type** | Tipo de recurso sobre el que se pueden realizar acciones. Registrado por cada módulo. |

---

## 8. Documentos Relacionados

- `docs/research/rbac-design.md` — Investigación técnica del modelo RBAC con scopes
- `docs/prd.md` — PRD Maestro (organigrama, principios)
- `docs/prd/operation.md` — PRD de Operación (consume permisos de producción)
- `docs/prd/warehouse.md` — PRD de Almacén (consume permisos de almacén)
- `docs/db/auth-schema.md` — Schema DB de Auth (por definir)
- `docs/domain/auth.md` — Modelo de dominio de Auth (por definir)
