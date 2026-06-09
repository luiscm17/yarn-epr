# ADR-001: Stack Tecnológico

> **Architecture Decision Record**
>
> **Status:** Aceptado
> **Contexto:** PRD v1 redefine el sistema de monodominio (Producción) a
> un sistema de gestión del flujo de valor textil con 3 dominios (Operación,
> Almacén, Administración). Se necesita elegir un stack que permita desarrollo
> rápido, bajo costo operativo y sea amigable para un desarrollador.

---

## Decisión

| Capa | Tecnología | Hosting |
|---|---|---|
| Frontend | React (Vite) + TypeScript | Vercel |
| Backend | FastAPI (Python) + SQLAlchemy + Alembic | Railway |
| Base de datos | PostgreSQL | Supabase |
| Auth | Supabase Auth (built-in) | Supabase |
| Storage | Supabase Storage (futuro) | Supabase |
| Testing | pytest (back), Vitest (front) | — |
| CI/CD | GitHub Actions | — |

---

## Opciones Consideradas

| Opción | Pros | Contras | Descartada por |
|---|---|---|---|
| **Next.js + Supabase** | Todo en Vercel, un solo lenguaje | TipoScript para cálculos densos | Python es mejor para lógica de negocio textil |
| **Django + PostgreSQL** | Admin built-in, ORM sólido | Peso pesado, menos flexible para API-first | FastAPI es más liviano y docs automáticos |
| **FastAPI + React + Supabase** (elegido) | Swagger automático, cálculos naturales en Python, separación clara front/back | Dos proyectos, dos deploys | — |

---

## Consecuencias

### Positivas

- FastAPI genera documentación automática (Swagger + ReDoc) — el junior siempre tiene referencia
- Supabase elimina la necesidad de escribir auth desde cero
- SQLAlchemy + Alembic dan control total sobre migraciones y consultas complejas
- Python permite cálculos de valuación y costeo sin librerías externas
- React es el estándar frontend — cualquier dev lo conoce

### Negativas / Riesgos

- Dos deploys separados (Vercel + Railway) — más superficie operativa
- El junior aprende dos lenguajes (Python + TypeScript) en lugar de uno
- Sin RLS a nivel base (usamos middleware en FastAPI) — hay que ser disciplinado con permisos

### Mitigaciones

- Railway es tan simple como Vercel — deploy con `Procfile`
- El junior arranca solo con backend la primera semana; React se agrega después
- Las dependencias de roles en FastAPI son explícitas y testeables

---

## Stack Técnico Detallado

```yaml
backend:
  runtime: python 3.12
  framework: fastapi
  orm: sqlalchemy 2.0
  migrations: alembic
  validation: pydantic
  testing: pytest + httpx (TestClient)

frontend:
  runtime: node 20
  framework: react 18 + vite
  language: typescript
  routing: react-router-dom
  auth-client: @supabase/supabase-js
  testing: vitest

infra:
  database: supabase (postgresql 15)
  auth: supabase auth
  backend-host: railway
  frontend-host: vercel
  ci: github actions
```

---

## Referencias

- [PRD](../prd.md)
- [Sprint 1 — README](../sprints/01-foundations/README.md)
- [Sprint 1 — Stack Tasks](../sprints/01-foundations/stack-tasks.md)
