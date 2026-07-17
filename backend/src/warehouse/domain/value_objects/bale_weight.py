from dataclasses import dataclass
from decimal import Decimal, InvalidOperation

from warehouse.domain.exceptions.domain_errors import (
    InvalidBaleWeightError
)

@dataclass(frozen=True, slots=True)
class BaleWeight:
    gross_kg: Decimal
    net_kg: Decimal
    container_kg: Decimal

    def __post_init__(self) -> None:
        gross = self._normalize(self.gross_kg, "Gross Weight")
        net = self._normalize(self.net_kg, "Net Weight")
        container = self._normalize(self.container_kg, "Container Weight")

        if gross <= Decimal("0"):
            raise InvalidBaleWeightError(
                "Gross weight must be greater than zero."
            )
        
        if net <= Decimal("0"):
            raise InvalidBaleWeightError(
                "Net weight must be greater than zero."
            )
        
        if gross != net + container:
            raise InvalidBaleWeightError(
                "Gross weight must equal net weight plus container weight."
            )
        
        object.__setattr__(self, "gross_kg", gross)
        object.__setattr__(self, "net_kg", net)
        object.__setattr__(self, "container_kg", container)

    
    @staticmethod
    def _normalize(value: Decimal, field_name: str) -> Decimal:
        try:
            normalized = Decimal(str(value))
        except (InvalidOperation, ValueError) as error:
            raise InvalidBaleWeightError(
                f"{field_name} must be a valid decimal value."
            )
        
        if not normalized.is_finite():
            raise InvalidBaleWeightError(
                f"{field_name} must be finite."
            )
        

        return normalized