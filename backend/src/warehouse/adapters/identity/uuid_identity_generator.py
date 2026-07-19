from uuid import UUID, uuid4

from warehouse.ports.identity_generator import IdentityGenerator


class UuidIdentityGenerator(IdentityGenerator):
    def next_id(self) -> UUID:
        return uuid4()
