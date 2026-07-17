class DomainErrors(Exception):
    """Base exception for warehouse domain rule violations."""

class InvalidBaleNumberError(DomainErrors):
    """Raised when a bale number is invalid."""

class InvalidMaterialTypeError(DomainErrors):
    """Raised when a material code is invalid."""

class InvalidBaleWeightError(DomainErrors):
    """Raised when a bale weight information is invalid."""

class InvalidBaleStateTransitionError(DomainErrors):
    """Raised when an invalid state transition is attempted for a bale."""