from dataclasses import dataclass

from warehouse.domain.raw_material.bale_id import BaleId
from warehouse.domain.raw_material.bale_reception_id import BaleReceptionId
from warehouse.domain.raw_material.domain_errors import (
    DuplicateBaleIdError,
    EmptyBaleReceptionError,
    InvalidProviderNameError,
)
from warehouse.domain.raw_material.reception_datetime import ReceptionDateTime
from warehouse.domain.raw_material.shipment_number import ShipmentNumber


@dataclass(frozen=True, slots=True)
class BaleReception:
    id: BaleReceptionId
    received_at: ReceptionDateTime
    shipment_number: ShipmentNumber
    provider_name: str
    bale_ids: tuple[BaleId, ...]

    def __post_init__(self) -> None:
        provider_name = self.provider_name.strip()
        if not provider_name:
            raise InvalidProviderNameError("Provider name cannot be empty.")

        if not self.bale_ids:
            raise EmptyBaleReceptionError(
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
