from collections.abc import Collection, Sequence

from sqlalchemy import select
from sqlalchemy.orm import Session

from warehouse.adapters.persistence.raw_material_bale_mapper import RawMaterialBaleMapper
from warehouse.adapters.persistence.raw_material_bale_record import RawMaterialBaleRecord
from warehouse.domain.models.raw_material_bale import RawMaterialBale
from warehouse.domain.value_objects.bale_number import BaleNumber
from warehouse.ports.raw_material_bale_repository import (
    RawMaterialBaleRepository as RawMaterialBaleRepositoryPort,
)


class RawMaterialBaleRepository(RawMaterialBaleRepositoryPort):
    def __init__(self, session: Session) -> None:
        self._session = session

    def find(
        self,
        bale_numbers: Collection[BaleNumber],
    ) -> frozenset[BaleNumber]:
        if not bale_numbers:
            return frozenset()

        values = tuple(number.value for number in bale_numbers)

        statement = select(RawMaterialBaleRecord.bale_number).where(
            RawMaterialBaleRecord.bale_number.in_(values)
        )

        return frozenset(
            BaleNumber(value) for value in self._session.scalars(statement)
        )

    def add_all(
        self,
        bales: Sequence[RawMaterialBale],
    ) -> None:
        self._session.add_all(
            [RawMaterialBaleMapper.to_record(bale) for bale in bales]
        )
