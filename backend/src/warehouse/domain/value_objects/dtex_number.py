from dataclasses import dataclass
from decimal import Decimal, InvalidOperation

from warehouse.domain.exceptions.domain_errors import InvalidDtexNumberError

@dataclass(frozen=True, slots=True)
class Dtex:
    value: Decimal

    def __post_init__(self) -> None:
        normalized = self._normalize(self.value)
        object.__setattr__(self, "value", normalized)

    @staticmethod
    def _normalize(value: Decimal) -> Decimal:
        try:
            normalized = Decimal(str(value))
        except (InvalidOperation, ValueError, TypeError) as error:
            raise InvalidDtexNumberError(
                f"{value} must be a valid decimal value."
            ) from error
        
        if not normalized.is_finite():
            raise InvalidDtexNumberError(
                f"{value} must be finite."
            )
        
        if normalized <= Decimal("0"):
            raise InvalidDtexNumberError(
                "Dtex must be greater than zero."
            )
        
        return normalized
