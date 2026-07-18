class DomainError(Exception):
    """Base exception for warehouse domain rule violations."""

class InvalidBaleNumberError(DomainError):
    """Raised when a bale number is invalid."""

class InvalidMaterialTypeError(DomainError):
    """Raised when a material type is invalid."""

class InvalidBaleWeightError(DomainError):
    """Raised when a bale weight information is invalid."""

class InvalidBaleStateTransitionError(DomainError):
    """Raised when an invalid state transition is attempted for a bale."""

class InvalidDtexNumberError(DomainError):
    """Raised when a Dtex number is invalid."""

class InvalidReceptionDateTimeError(DomainError):
    """Raised when a reception date and time is invalid."""

class EmptyRawMaterialReceptionError(DomainError):
    """Raised when a reception does not contain any bale."""

class DuplicateBaleIdError(DomainError):
    """Raised when a reception contains duplicate bale identities."""