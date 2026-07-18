from dataclasses import dataclass

from warehouse.domain.exceptions.domain_errors import DomainError


@dataclass(frozen=True, slots=True)
class DepartureNumber:
    value: str

    def __post_init__(self) -> None:
        normalized = self.value.strip().upper()

        if not normalized:
            raise DomainError(
                "Departure number cannot be empty."
            )

        if len(normalized) > 10:
            raise DomainError(
                "Departure number cannot exceed 10 characters."
            )

        object.__setattr__(self, "value", normalized)