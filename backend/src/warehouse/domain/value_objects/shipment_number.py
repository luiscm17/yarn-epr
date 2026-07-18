from dataclasses import dataclass

from warehouse.domain.exceptions.domain_errors import DomainError


@dataclass(frozen=True, slots=True)
class ShipmentNumber:
    value: str

    def __post_init__(self) -> None:
        normalized = self.value.strip().upper()

        if not normalized:
            raise DomainError(
                "Shipment number cannot be empty."
            )

        if len(normalized) > 10:
            raise DomainError(
                "Shipment number cannot exceed 10 characters."
            )

        object.__setattr__(self, "value", normalized)
