class DuplicateBaleNumberConflict(Exception):
    """A reception contains duplicate canonical bale numbers."""


class DuplicateShipmentNumberConflict(Exception):
    """A transaction persisted an existing shipment number."""
