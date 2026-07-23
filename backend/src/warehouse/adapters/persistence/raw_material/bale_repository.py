from collections.abc import Sequence

from sqlalchemy.orm import Session

from warehouse.adapters.persistence.raw_material.bale_mapper import BaleMapper
from warehouse.domain.raw_material.bale import Bale
from warehouse.ports.raw_material.bale_repository import (
    BaleRepository as BaleRepositoryPort,
)


class BaleRepository(BaleRepositoryPort):
    def __init__(self, session: Session) -> None:
        self._session = session

    def add_all(self, bales: Sequence[Bale]) -> None:
        self._session.add_all([BaleMapper.to_record(bale) for bale in bales])
