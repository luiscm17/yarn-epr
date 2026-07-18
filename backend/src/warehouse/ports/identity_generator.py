from typing import Protocol
from uuid import UUID


class IdentityGenerator(Protocol):
    def next_id(self) -> UUID:
        """Generator a new identity."""
        ...