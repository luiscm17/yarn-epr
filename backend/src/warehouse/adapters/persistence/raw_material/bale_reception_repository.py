from sqlalchemy.orm import Session

from warehouse.adapters.persistence.raw_material.bale_reception_mapper import (
    BaleReceptionMapper,
)
from warehouse.domain.raw_material.bale_reception import BaleReception
from warehouse.ports.raw_material.bale_reception_repository import (
    BaleReceptionRepository as BaleReceptionRepositoryPort,
)


class BaleReceptionRepository(BaleReceptionRepositoryPort):
    def __init__(self, session: Session) -> None:
        self._session = session

    def add(self, reception: BaleReception) -> None:
        self._session.add(BaleReceptionMapper.to_record(reception))
        self._session.flush()
