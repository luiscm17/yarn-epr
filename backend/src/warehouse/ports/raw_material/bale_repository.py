from collections.abc import Sequence
from typing import Protocol

from warehouse.domain.raw_material.bale import Bale


class BaleRepository(Protocol):
    def add_all(
        self,
        bales: Sequence[Bale],
    ) -> None: ...
