from dataclasses import dataclass
from decimal import Decimal, InvalidOperation

from warehouse.domain.exceptions.domain_errors import InvalidDtexError


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
            raise InvalidDtexError(f"{value} must be a valid decimal value.") from error

        if not normalized.is_finite():
            raise InvalidDtexError(f"{value} must be finite.")

        if normalized <= Decimal("0"):
            raise InvalidDtexError("Dtex must be greater than zero.")

        return normalized
