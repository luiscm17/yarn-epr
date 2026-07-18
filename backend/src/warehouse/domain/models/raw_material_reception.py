from dataclasses import dataclass

from warehouse.domain.value_objects.shipment_number import ShipmentNumber
from warehouse.domain.value_objects.reception_datetime import ReceptionDateTime
from warehouse.domain.value_objects.raw_material_reception_id import (
    RawMaterialReceptionId,
)
from warehouse.domain.value_objects.raw_material_bale_id import RawMaterialBaleId

from warehouse.domain.exceptions.domain_errors import (
    DuplicateBaleIdError,
    EmptyRawMaterialReceptionError,
    InvalidProviderNameError,
)


@dataclass(frozen=True, slots=True)
class RawMaterialReception:
    id: RawMaterialReceptionId
    received_at: ReceptionDateTime
    shipment_number: ShipmentNumber
    provider_name: str
    bale_ids: tuple[RawMaterialBaleId, ...]

    def __post_init__(self) -> None:
        provider_name = self.provider_name.strip()
        if not provider_name:
            raise InvalidProviderNameError("Provider name cannot be empty.")

        if not self.bale_ids:
            raise EmptyRawMaterialReceptionError(
                "Raw material reception must contain at least one bale."
            )

        if len(self.bale_ids) != len(set(self.bale_ids)):
            raise DuplicateBaleIdError(
                "Raw material reception cannot contain duplicate bale IDs."
            )

        object.__setattr__(
            self,
            "provider_name",
            provider_name,
        )

    @property
    def bale_count(self) -> int:
        return len(self.bale_ids)
