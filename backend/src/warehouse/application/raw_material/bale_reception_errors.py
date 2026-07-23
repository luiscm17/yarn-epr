class BaleReceptionApplicationError(Exception):
    """Base error for raw-material reception orchestration."""


class DuplicateBaleNumberError(BaleReceptionApplicationError):
    """A reception contains duplicate canonical bale numbers."""


class DuplicateShipmentNumberError(BaleReceptionApplicationError):
    """A raw-material reception already uses the shipment number."""
