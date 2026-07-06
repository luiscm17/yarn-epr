# Git Workflow

> Branch strategy, commit convention, pull request process, and code review
> guidelines for the Textile Production Management System.
>

---

## Quick Reference

| Topic | Rule |
|-------|------|
| **Base branch** | `main` — always stable, always deployable |
| **Branch format** | `<layer>/<short-topic>` — layer first, no type prefix |
| **Layer prefix** | `front/`, `back/`, `devops/`, `docs/` |
| **Commit format** | Conventional Commits — `type(scope): description` |
| **PR target** | `main` — always |
| **Merge strategy** | Squash merge (one commit per PR into `main`) |
| **Review required** | At least 1 approval before merge |
| **PR size limit** | 400 changed lines max — split into stacked PRs if larger |

---

## 1. Branch Naming

### 1.1 Format

```
<layer>/<short-topic>
```

### 1.2 Layers

| Layer | When |
|-------|------|
| `front/` | Frontend code — UI components, forms, routing |
| `back/` | Backend code — API, services, data access, **migrations** |
| `devops/` | Infrastructure — CI/CD, Docker, config, scripts |
| `docs/` | Documentation — guides, READMEs, specs |

### 1.3 Rules

- Always lowercase, hyphens as separators.
- **2-3 words max** after the layer. If it needs more, the topic is too broad.
- Do NOT include issue tracker IDs.
- Delete the branch after merge.

### 1.4 Examples

| Branch | What it contains |
|--------|-----------------|
| `back/machine-catalog` | Machine CRUD API + data layer |
| `front/shift-form` | Production shift form UI |
| `front/login-page` | Login screen and auth UI |
| `back/auth` | Auth middleware, JWT, login endpoint |
| `back/batch-state-machine` | Batch lifecycle logic |
| `front/batch-status-badge` | UI badge showing batch state |
| `devops/docker-compose` | Docker setup for local dev |
| `devops/cd-pipeline` | Deployment pipeline config |
| `docs/git-workflow` | Git conventions guide |
| `front/warehouse-receipts` | Warehouse receipt form + list |

---

## 2. Commit Convention (Conventional Commits)

Every commit message **must** follow the [Conventional Commits](https://www.conventionalcommits.org/) format.

### 2.1 Format

```
<type>(<scope>): <description>

[optional body]
```

### 2.2 Message characteristics

Every commit message **title** must follow these rules:

| Rule | Why |
|------|-----|
| **Imperative mood** — "Add shift form", not "Added" or "Adds" | Reads like an instruction, consistent with generated merge commits |
| **No period at the end** | Terse, scannable |
| **Max 200 characters** for the title | Long enough to capture the functional change without truncation |
| **Blank line before body** (if body exists) | Standard convention, tools rely on it |

```
# Good
feat(op): add production shift form
fix(wh): validate receipt date range

# Bad
feat(op): Added production shift form.  ← past tense + period
feat(op): add production shift form with machine grid and section selector  ← describes implementation, not functional change
refactor(op): replace ProductionDischarge.py with discharge.py  ← names the file, not the functional change
```

### 2.3 Types

| Type | When to use |
|------|-------------|
| `feat` | A new feature |
| `fix` | A bug fix |
| `refactor` | Code change that neither fixes a bug nor adds a feature |
| `test` | Adding or fixing tests |
| `docs` | Documentation only |
| `chore` | Maintenance, dependencies, tooling, config |
| `style` | Formatting, linting — no production code change |
| `perf` | Performance improvement |

### 2.4 Scope (optional but recommended)

The scope is the **module or domain** the change affects. Use one of:

| Scope | Area |
|-------|------|
| `op` | Operation (machines, shifts, lots, quality, waste) |
| `wh` | Warehouse (receipts, issues, stock, verification) |
| `admin` | Administration (valuation, costing, closures) |
| `shared` | Shared catalogs (employees, machines, titles) |
| `auth` | Authentication and authorization |
| `api` | API design or contract changes |
| `ui` | Frontend / UI changes |
| `docs` | Documentation |

### 2.5 Good examples

```
feat(op): add production shift form with machine grid
feat(wh): register material receipt with location assignment
fix(op): prevent negative tare values in net weight calculation
refactor(wh): extract stock service from warehouse controller
test(op): cover batch state machine transitions
docs: add git workflow and naming conventions
chore: configure eslint and prettier
```

### 2.6 Bad examples and why

| Bad commit | Problem |
|-----------|---------|
| `fix bug` | No type, no scope, too vague |
| `feat(warehouse): fix` | Type says feat, description says fix — inconsistent |
| `WIP` | Useless on its own; use `chore: wip` or squash before merge |
| `asdflkj` | Zero information |
| `refactor(wh): replace schema-design.md with warehouse.dbml` | Names the file instead of the functional change |

> **Principio — describe el cambio funcional, no el archivo.**
> El título debe responder **qué cambió en el sistema**, no qué archivo se tocó.
>
> | Archivo | Cambio funcional |
> |---|---|
> | `docs(arch): replace warehouse schema doc with DBML` | `docs(arch): codify warehouse schema as DBML replacing prose design` |
> | `docs(db): replace spinning schemas with warehouse DBML` | `docs(db): restructure DBML schemas per bounded context` |
> | `refactor(wh): rename ProductionDischarge.py` | `refactor(wh): extract yarn-spinning discharge into independent module` |
>
> Si cuesta describirlo sin nombrar archivos, probablemente el commit no sea atómico.

### 2.7 Body (when to use)

Use the commit body when the change needs explanation:

```
feat(op): calculate net weight automatically

Derive net weight from gross - tare on the client side as the
user types. The server re-calculates on save to prevent tampering.

Why inline calculation?
- Immediate feedback for the supervisor
- Prevents manual math errors
- Server validates on persist regardless
```

---

## 3. Daily Workflow

```bash
main ──► <layer>/xxx ──► commits ──► push ──► PR ──► review ──► merge ──► delete branch
```

### 3.1 Start a new branch

```bash
# Backend work
git checkout main && git pull
git checkout -b back/machine-catalog

# Frontend work
git checkout main && git pull
git checkout -b front/shift-form

# Documentation
git checkout main && git pull
git checkout -b docs/git-workflow
```

### 3.2 Commit often, push when ready

```bash
# Make small, logical commits as you work
git add <files>
git commit -m "feat(op): add machine selector to shift form"

# Push the branch (first time)
git push -u origin back/machine-catalog

# Subsequent pushes
git push
```

### 3.3 Keep your branch up to date

```bash
git checkout main && git pull
git checkout back/machine-catalog
git rebase main
```

**Always rebase, never merge `main` into your feature branch.** Rebasing keeps history linear and clean. If you have conflicts:

```bash
git rebase main
# resolve conflicts in each file
git add <resolved-file>
git rebase --continue
```

### 3.4 Open a Pull Request

1. Push your branch.
2. Open a PR on GitHub targeting `main`.
3. Fill the PR template (see section 4).
4. Mark as **Ready for review** (not Draft).
5. Assign at least one reviewer.

### 3.5 After merge

```bash
git checkout main && git pull
git branch -d back/machine-catalog
```

---

## 4. Pull Request Process

### 4.1 Template

Each PR description **must** include:

```markdown
## Summary

<!-- One paragraph: what does this change do and why? -->

## Changes

- <!-- key changes, bullet points -->
```

### 4.2 Size rule

If the PR exceeds **400 changed lines**, split it into stacked / chained PRs:

- PR #1: `back/data-model` — domain logic and persistence
- PR #2: `back/api` — endpoints and validation
- PR #3: `front/form` — UI components

Each stacked PR targets `main` in order. This protects reviewers from burnout and keeps reviews focused.

### 4.3 Merge strategy

**Always squash merge** into `main`. This produces one clean commit per PR. The squashed commit message should match the PR title, formatted as a conventional commit:

```
feat(op): add production shift form with machine grid (#42)
```

Do NOT use "Create a merge commit" or "Rebase and merge" — they clutter history with intermediate commits.

### 4.4 Branch deletion

Delete the branch immediately after merge. GitHub offers a "Delete branch" button after merge — use it.

---

## 5. Code Review Guidelines

### 5.1 For the author

- Keep PRs small and focused (one concern per PR).
- Self-review before requesting review — catch your own oversights first.
- Respond to every comment. Even if you disagree, acknowledge and explain.
- If a comment is addressed in a new commit, mark it as resolved.
- Do not merge until all comments are resolved.

### 5.2 For the reviewer

- Review within 1 business day when possible.
- Focus on: correctness, maintainability, test coverage, edge cases.
- Distinguish between **blocking** and **non-blocking** comments:
  - **Blocking**: the PR must not merge without addressing this.
  - **Non-blocking**: suggestion, optional improvement. Use "nit:" prefix.
- Be constructive. Instead of "this is wrong", explain **why** and suggest **how**.

### 5.3 Review flow

```
Author opens PR
    │
    ▼
Reviewer reviews ──► Comments / Change requests
    │                       │
    ▼                       ▼
Approved             Author addresses feedback
    │                       │
    ▼                       ▼
Author merges        Author pushes new commits
                            │
                            ▼
                      Reviewer re-reviews
```

---

## 6. Integration with SDD

This project uses **Spec-Driven Development (SDD)**. The workflow integrates with Git as follows:

| SDD Phase | Git Action |
|-----------|------------|
| Proposal / Spec | No branch needed — documentation only |
| Design / Tasks | No branch needed — documentation only |
| Apply | Create branch, implement, commit |
| Verify | Tests pass, self-review, push — no separate branch |
| Archive | No branch — merge is done, branch deleted |
| PR | Open PR → review → squash merge → delete branch |

Each SDD change maps to **one branch** and **one squashed commit** in `main`. The branch layer follows where the change lives: `back/`, `front/`, `devops/`, or `docs/`.

---

## 7. Quick Reference Card (CLI)

```bash
# Start new work — pick the right layer
git checkout main && git pull
git checkout -b back/machine-catalog   # backend
git checkout -b front/shift-form      # frontend
git checkout -b devops/docker-compose # infrastructure
git checkout -b docs/git-workflow     # documentation

# Commit
git add <files>
git commit -m "feat(op): add machine catalog endpoints"

# Push
git push -u origin back/machine-catalog

# Update branch with main
git checkout main && git pull
git checkout back/machine-catalog && git rebase main

# After merge, clean up
git checkout main && git pull
git branch -d back/machine-catalog
```
