from dataclasses import dataclass

from warehouse.domain.value_objects.departure_number import DepartureNumber
from warehouse.domain.value_objects.dtex_number import DtexNumber
from warehouse.domain.value_objects.reception_datetime import ReceptionDateTime
from warehouse.domain.value_objects.raw_material_reception_id import RawMaterialReceptionId
from warehouse.domain.value_objects.raw_material_bale_id import RawMaterialBaleId

from warehouse.domain.exceptions.domain_errors import (
    DuplicateBaleIdError,
    EmptyRawMaterialReceptionError,
)

@dataclass(slots=True)
class RawMaterialReception:
    id: RawMaterialReceptionId
    received_at: ReceptionDateTime
    departure_number: DepartureNumber
    client_id: str
    dtex: DtexNumber
    bale_ids: tuple[RawMaterialBaleId, ...]

    def __post_init__(self) -> None:
        normalized_bale_ids = tuple(self.bale_ids)

        if not normalized_bale_ids:
            raise EmptyRawMaterialReceptionError(
                "Raw material reception must contain at least one bale."
            )
        
        if len(normalized_bale_ids) != len(set(normalized_bale_ids)):
            raise DuplicateBaleIdError(
                "Raw material reception cannot contain duplcate bale IDs."
            )
        
        object.__setattr__(self, "bale_ids", normalized_bale_ids)

    
    @property
    def bale_count(self) -> int:
        return len(self.bale_ids)