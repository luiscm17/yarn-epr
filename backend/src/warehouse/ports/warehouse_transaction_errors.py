class DuplicateBaleNumberConflict(Exception):
    """A concurrent transaction persisted the same canonical bale number."""
