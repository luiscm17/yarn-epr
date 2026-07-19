class RawMaterialReceptionApplicationError(Exception):
    """Base error for raw-material reception orchestration."""


class DuplicateBaleNumberError(RawMaterialReceptionApplicationError):
    """A canonical bale number is already present or repeated."""
