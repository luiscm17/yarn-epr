from typing import Protocol

from warehouse.domain.raw_material.bale_reception import BaleReception


class BaleReceptionRepository(Protocol):
    def add(self, reception: BaleReception) -> None: ...
