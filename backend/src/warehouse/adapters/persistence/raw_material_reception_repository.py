from sqlalchemy.orm import Session

from warehouse.adapters.persistence.raw_material_reception_mapper import RawMaterialReceptionMapper
from warehouse.domain.models.raw_material_reception import RawMaterialReception
from warehouse.ports.raw_material_reception_repository import (
    RawMaterialReceptionRepository as RawMaterialReceptionRepositoryPort,
)


class RawMaterialReceptionRepository(
    RawMaterialReceptionRepositoryPort
):
    def __init__(self, session: Session) -> None:
        self._session = session

    def add(
            self,
            reception: RawMaterialReception,
    ) -> None:
        self._session.add(
            RawMaterialReceptionMapper.to_record(reception)
        )
