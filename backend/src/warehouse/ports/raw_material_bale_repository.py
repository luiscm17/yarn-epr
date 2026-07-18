from collections.abc import Sequence
from typing import Protocol

from warehouse.domain.models.raw_material_bale import RawMaterialBale


class RawMaterialBaleRepository(Protocol):
    def add_all(self, bales: Sequence[RawMaterialBale]) -> None:
        ...