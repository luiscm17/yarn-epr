from typing import Annotated, Protocol

from fastapi import Depends
from sqlalchemy.orm import Session

from bootstrap.database_session_dependency import SessionProvider
from warehouse.adapters.identity.uuid_identity_generator import UuidIdentityGenerator
from warehouse.adapters.persistence.raw_material.bale_reception_repository import (
    BaleReceptionRepository,
)
from warehouse.adapters.persistence.raw_material.bale_repository import BaleRepository
from warehouse.adapters.persistence.warehouse_transaction import WarehouseTransaction
from warehouse.application.raw_material.register_bale_reception import (
    RegisterBaleReception,
)


class UseCaseProvider(Protocol):
    def __call__(self, session: Session) -> RegisterBaleReception: ...


def build_use_case(session: Session) -> RegisterBaleReception:
    return RegisterBaleReception(
        reception_repository=BaleReceptionRepository(session),
        bale_repository=BaleRepository(session),
        warehouse_transaction=WarehouseTransaction(session),
        identity_generator=UuidIdentityGenerator(),
    )


def use_case_dependency(
    session_provider: SessionProvider,
) -> UseCaseProvider:
    def provide_use_case(
        session: Annotated[Session, Depends(session_provider)],
    ) -> RegisterBaleReception:
        return build_use_case(session)

    return provide_use_case
