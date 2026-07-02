from __future__ import annotations

from dataclasses import dataclass
from typing import Any

from .value_objects import Email, OrganizationalRole, UserId


@dataclass(frozen=True)
class UserCreated:
    user_id: UserId
    name: str
    email: Email
    role: OrganizationalRole


@dataclass(frozen=True)
class UserUpdated:
    """Emitted when any master data field changes (name, email, role, etc.)."""

    user_id: UserId
    changes: dict[str, Any]


@dataclass(frozen=True)
class UserActivated:
    user_id: UserId


@dataclass(frozen=True)
class UserDeactivated:
    user_id: UserId
