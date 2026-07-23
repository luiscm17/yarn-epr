from dataclasses import dataclass

from warehouse.domain.raw_material.bale_id import BaleId
from warehouse.domain.raw_material.bale_number import BaleNumber
from warehouse.domain.raw_material.bale_reception_id import BaleReceptionId
from warehouse.domain.raw_material.bale_status import BaleStatus
from warehouse.domain.raw_material.bale_weight import BaleWeight
from warehouse.domain.raw_material.domain_errors import InvalidBaleStateTransitionError
from warehouse.domain.raw_material.dtex import Dtex
from warehouse.domain.raw_material.material_type import MaterialType


@dataclass(slots=True)
class Bale:
    id: BaleId
    reception_id: BaleReceptionId
    bale_number: BaleNumber
    material: MaterialType
    dtex: Dtex
    weight: BaleWeight
    status: BaleStatus = BaleStatus.IN_WAREHOUSE

    def deliver(self) -> None:
        if self.status is not BaleStatus.IN_WAREHOUSE:
            raise InvalidBaleStateTransitionError(
                f"Bale {self.bale_number.value} is not available in warehouse."
            )

        self.status = BaleStatus.DELIVERED

    @property
    def is_available(self) -> bool:
        return self.status is BaleStatus.IN_WAREHOUSE
