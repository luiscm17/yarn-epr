from dataclasses import dataclass
from decimal import Decimal
from uuid import UUID

@dataclass(frozen=True, slots=True)
class RawMaterialReceptionResult:
    reception_id: UUID
    bale_ids: tuple[UUID, ...]
    bale_count: int
    total_net_weight_kg: Decimal