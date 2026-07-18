from dataclasses import dataclass
from decimal import Decimal

from warehouse.domain.exceptions.domain_errors import InvalidDtexNumberError

@dataclass(frozen=True, slots=True)
class DtexNumber:
    dtex: Decimal

    def __post_init__(self) -> None:
        normalized = self._normalize(self.dtex)
        object.__setattr__(self, "dtex", normalized)

    @staticmethod
    def _normalize(value: Decimal) -> Decimal:
        try:
            normalized = Decimal(str(value))
        except ValueError as error:
            raise InvalidDtexNumberError(
                f"{value} must be a valid decimal value."
            )
        
        if not normalized.is_finite():
            raise InvalidDtexNumberError(
                f"{value} must be finite."
            )
        
        return normalized