class RawMaterialReceptionApplicationError(Exception):
    """Base error for raw-material reception orchestration."""


class DuplicateBaleNumberError(RawMaterialReceptionApplicationError):
    """A reception contains duplicate canonical bale numbers."""


class DuplicateShipmentNumberError(RawMaterialReceptionApplicationError):
    """A raw-material reception already uses the shipment number."""
