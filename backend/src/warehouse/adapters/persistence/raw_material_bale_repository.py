from collections.abc import Sequence

from sqlalchemy.orm import Session

from warehouse.adapters.persistence.raw_material_bale_mapper import RawMaterialBaleMapper
from warehouse.domain.models.raw_material_bale import RawMaterialBale
from warehouse.ports.raw_material_bale_repository import (
    RawMaterialBaleRepository as RawMaterialBaleRepositoryPort,
)


class RawMaterialBaleRepository(RawMaterialBaleRepositoryPort):
    def __init__(self, session: Session) -> None:
        self._session = session

    def add_all(
        self,
        bales: Sequence[RawMaterialBale],
    ) -> None:
        self._session.add_all(
            [RawMaterialBaleMapper.to_record(bale) for bale in bales]
        )
