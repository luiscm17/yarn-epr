from collections.abc import Collection, Sequence
from typing import Protocol

from warehouse.domain.models.raw_material_bale import RawMaterialBale
from warehouse.domain.value_objects.bale_number import BaleNumber


class RawMaterialBaleRepository(Protocol):
    def find(
        self,
        bale_numbers: Collection[BaleNumber],
    ) -> frozenset[BaleNumber]:
        """Return the requested canonical bale numbers that already exist."""
        ...

    def add_all(
        self,
        bales: Sequence[RawMaterialBale],
    ) -> None: ...
