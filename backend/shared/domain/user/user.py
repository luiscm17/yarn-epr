from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any

from .events import UserActivated, UserCreated, UserDeactivated, UserUpdated
from .value_objects import Email, OrganizationalRole, UserId, UserStatus


@dataclass
class User:
    id: UserId
    name: str
    email: Email
    organizational_role: OrganizationalRole
    status: UserStatus = UserStatus.ACTIVE
    events: list = field(default_factory=list)

    @classmethod
    def create(
        cls,
        name: str,
        email: Email,
        role: OrganizationalRole,
    ) -> User:
        user = cls(
            id=UserId.generate(),
            name=name,
            email=email,
            organizational_role=role,
        )
        user.events.append(
            UserCreated(
                user_id=user.id,
                name=user.name,
                email=user.email,
                role=user.organizational_role,
            )
        )
        return user

    def update(self, **changes: Any) -> None:
        """Apply field changes and emit ``UserUpdated``.

        Only fields that actually change are recorded in the event.
        Accepts: ``name``, ``email``, ``organizational_role``.
        """
        applied: dict[str, Any] = {}

        for field_name, new_value in changes.items():
            current = getattr(self, field_name)
            if current != new_value:
                setattr(self, field_name, new_value)
                applied[field_name] = new_value

        if applied:
            self.events.append(
                UserUpdated(user_id=self.id, changes=applied)
            )

    def activate(self) -> None:
        if self.status is UserStatus.ACTIVE:
            return
        self.status = UserStatus.ACTIVE
        self.events.append(UserActivated(user_id=self.id))

    def deactivate(self) -> None:
        if self.status is UserStatus.INACTIVE:
            return
        self.status = UserStatus.INACTIVE
        self.events.append(UserDeactivated(user_id=self.id))

    def clear_events(self) -> None:
        self.events.clear()
