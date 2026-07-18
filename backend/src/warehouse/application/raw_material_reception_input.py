from dataclasses import dataclass
from decimal import Decimal
from datetime import datetime


@dataclass(frozen=True, slots=True)
class RawMaterialBaleReceptionInput:
    bale_number: str
    material_type: str
    dtex: Decimal
    gross_weight_kg: Decimal
    container_weight_kg: Decimal


@dataclass(frozen=True, slots=True)
class RawMaterialReceptionInput:
    received_at: datetime
    shipment_number: str
    provider_name: str
    bales: tuple[RawMaterialBaleReceptionInput, ...]
