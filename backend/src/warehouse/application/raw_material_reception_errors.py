class RawMaterialReceptionApplicationError(Exception):
    """Base error for raw-material reception orchestration."""


class DuplicateBaleNumberInReceptionError(RawMaterialReceptionApplicationError): ...
