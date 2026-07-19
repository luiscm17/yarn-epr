import unittest
from unittest.mock import Mock

from sqlalchemy.exc import IntegrityError

from warehouse.adapters.persistence.warehouse_transaction import (
    BALE_NUMBER_UNIQUE_CONSTRAINT,
    WarehouseTransaction,
    is_bale_number_unique_violation,
)
from warehouse.ports.warehouse_transaction_errors import (
    DuplicateBaleNumberConflict,
)


class FakeDatabaseError(Exception):
    def __init__(self, constraint_name: str | None) -> None:
        self.diag = Mock(constraint_name=constraint_name)


def make_integrity_error(constraint_name: str | None) -> IntegrityError:
    return IntegrityError(
        "statement",
        {},
        FakeDatabaseError(constraint_name),
    )


class TestBaleNumberUniqueViolationClassification(unittest.TestCase):
    def test_matches_named_bale_number_constraint(self) -> None:
        error = make_integrity_error(BALE_NUMBER_UNIQUE_CONSTRAINT)

        self.assertTrue(is_bale_number_unique_violation(error))

    def test_does_not_match_unrelated_constraint(self) -> None:
        error = make_integrity_error("fk_raw_material_bales_reception_id")

        self.assertFalse(is_bale_number_unique_violation(error))

    def test_does_not_guess_without_postgresql_diagnostics(self) -> None:
        error = IntegrityError("statement", {}, Exception("unique failed"))

        self.assertFalse(is_bale_number_unique_violation(error))


class TestWarehouseTransaction(unittest.TestCase):
    def test_translates_named_unique_constraint_and_rolls_back_once(self) -> None:
        session = Mock()
        session.commit.side_effect = make_integrity_error(
            BALE_NUMBER_UNIQUE_CONSTRAINT
        )
        transaction = WarehouseTransaction(session)

        with self.assertRaises(DuplicateBaleNumberConflict):
            with transaction:
                transaction.commit()

        session.rollback.assert_called_once_with()

    def test_preserves_unrelated_integrity_error_and_rolls_back(self) -> None:
        error = make_integrity_error("unrelated_constraint")
        session = Mock()
        session.commit.side_effect = error
        transaction = WarehouseTransaction(session)

        with self.assertRaises(IntegrityError) as raised:
            with transaction:
                transaction.commit()

        self.assertIs(raised.exception, error)
        session.rollback.assert_called_once_with()


if __name__ == "__main__":
    unittest.main()
