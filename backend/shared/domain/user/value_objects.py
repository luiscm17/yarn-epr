from __future__ import annotations

import uuid
from dataclasses import dataclass
from enum import Enum


@dataclass(frozen=True)
class OrganizationalRole:
    """Organizational role (job position) — NOT an RBAC role.

    This is master data, not an enum. New directions and roles
    (Administración, Comercialización, etc.) are added via seed data,
    not code changes.

    Reference — known values used in seed data:
    ===========================================
    ``production/direction``       — Dirección de Producción
    ``production/manager``         — Jefe de Producción
    ``production/warehouse-chief`` — Jefe Unidad Almacén
    ``production/warehouse-aux``   — Auxiliar Operativo (Almacén)
    ``production/supervisor``      — Supervisor de turno
    ``production/operator``        — Operario (no usa sistema)
    ``management``                 — Gerencia
    """

    value: str

    def __post_init__(self) -> None:
        if not self.value.strip():
            raise ValueError("Organizational role must not be empty")


class UserStatus(Enum):
    ACTIVE = "active"
    INACTIVE = "inactive"


@dataclass(frozen=True)
class UserId:
    value: uuid.UUID

    @classmethod
    def generate(cls) -> UserId:
        return cls(value=uuid.uuid4())


@dataclass(frozen=True)
class Email:
    value: str

    def __post_init__(self) -> None:
        if "@" not in self.value:
            raise ValueError(f"Invalid email: {self.value}")
