from collections.abc import Sequence
from typing import Protocol

from warehouse.domain.models.raw_material_reception import RawMaterialReception


class RawMaterialReceptionRepository(Protocol):
    def add(self, reception: RawMaterialReception) -> None:
        ...