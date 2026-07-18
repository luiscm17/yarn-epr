from dataclasses import dataclass

from warehouse.domain.enums.bale_status import BaleStatus
from warehouse.domain.exceptions.domain_errors import ( InvalidBaleStateTransitionError )
from warehouse.domain.value_objects.bale_number import BaleNumber
from warehouse.domain.value_objects.bale_weight import BaleWeight
from warehouse.domain.value_objects.material_type import MaterialType
from warehouse.domain.value_objects.dtex import Dtex
from warehouse.domain.value_objects.raw_material_bale_id import (
    RawMaterialBaleId,
)
from warehouse.domain.value_objects.raw_material_reception_id import (
    RawMaterialReceptionId,
)


@dataclass(slots=True)
class RawMaterialBale:
    id: RawMaterialBaleId
    reception_id: RawMaterialReceptionId
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
