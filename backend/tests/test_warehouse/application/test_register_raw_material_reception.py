import unittest
from collections.abc import Sequence
from datetime import datetime, timezone
from decimal import Decimal
from types import TracebackType
from typing import Self
from uuid import UUID

from warehouse.application.raw_material_reception_errors import (
    DuplicateBaleNumberInReceptionError,
    RawMaterialReceptionApplicationError,
)
from warehouse.application.raw_material_reception_input import (
    RawMaterialBaleReceptionInput,
    RawMaterialReceptionInput,
)
from warehouse.application.raw_material_reception_result import (
    RawMaterialReceptionResult,
)
from warehouse.application.register_raw_material_reception import (
    RegisterRawMaterialReception,
)
from warehouse.domain.models.raw_material_bale import RawMaterialBale
from warehouse.domain.models.raw_material_reception import (
    RawMaterialReception,
)


class FakeIdentityGenerator:
    def __init__(self) -> None:
        self._counter = 0

    def next_id(self) -> UUID:
        self._counter += 1
        return UUID(f"00000000-0000-0000-0000-{self._counter:012d}")


class FakeRawMaterialReceptionRepository:
    def __init__(self) -> None:
        self.added: RawMaterialReception | None = None

    def add(self, reception: RawMaterialReception) -> None:
        self.added = reception


class FakeRawMaterialBaleRepository:
    def __init__(self) -> None:
        self.added_bales: tuple[RawMaterialBale, ...] = ()

    def add_all(self, bales: Sequence[RawMaterialBale]) -> None:
        self.added_bales = tuple(bales)


class FakeWarehouseTransaction:
    def __init__(self) -> None:
        self.committed = False
        self.entered = False

    def __enter__(self) -> Self:
        self.entered = True
        return self

    def __exit__(
        self,
        exception_type: type[BaseException] | None,
        exception: BaseException | None,
        traceback: TracebackType | None,
    ) -> None:
        pass

    def commit(self) -> None:
        self.committed = True


class TestRegisterRawMaterialReception(unittest.TestCase):
    def setUp(self) -> None:
        self.identity_generator = FakeIdentityGenerator()
        self.reception_repo = FakeRawMaterialReceptionRepository()
        self.bale_repo = FakeRawMaterialBaleRepository()
        self.transaction = FakeWarehouseTransaction()

        self.use_case = RegisterRawMaterialReception(
            reception_repository=self.reception_repo,
            bale_repository=self.bale_repo,
            warehouse_transaction=self.transaction,
            identity_generator=self.identity_generator,
        )

    def _make_input(
        self,
        bales: tuple[
            tuple[str, str, str, str, str],
            ...,
        ]
        | None = None,
    ) -> RawMaterialReceptionInput:
        if bales is None:
            bales = (
                ("BAL-001", "ALGODÓN", "2.2", "120", "20"),
                ("BAL-002", "ALGODÓN", "2.2", "130", "25"),
            )

        return RawMaterialReceptionInput(
            received_at=datetime.now(timezone.utc),
            shipment_number="SHIP-001",
            provider_name="  PROV-001  ",
            bales=tuple(
                RawMaterialBaleReceptionInput(
                    bale_number=b[0],
                    material_type=b[1],
                    dtex=Decimal(b[2]),
                    gross_weight_kg=Decimal(b[3]),
                    container_weight_kg=Decimal(b[4]),
                )
                for b in bales
            ),
        )

    def test_registers_with_multiple_bales(self) -> None:
        """Happy path: creates a reception with two bales."""
        input_data = self._make_input()
        result = self.use_case.execute(input_data)

        self.assertIsInstance(result, RawMaterialReceptionResult)
        self.assertIsInstance(result.reception_id, UUID)
        self.assertEqual(result.bale_count, 2)
        self.assertEqual(len(result.bale_ids), 2)

    def test_returns_correct_total_net_weight(self) -> None:
        """Net weight is sum of (gross - container) for all bales."""
        input_data = self._make_input()
        result = self.use_case.execute(input_data)

        # BAL-001: 120 - 20 = 100, BAL-002: 130 - 25 = 105
        self.assertEqual(result.total_net_weight_kg, Decimal("205"))

    def test_single_bale_reception(self) -> None:
        """Works with a single bale."""
        input_data = self._make_input(
            bales=(("BAL-001", "ALGODÓN", "2.2", "200", "50"),)
        )
        result = self.use_case.execute(input_data)

        self.assertEqual(result.bale_count, 1)
        self.assertEqual(result.total_net_weight_kg, Decimal("150"))

    def test_rejects_duplicate_bale_numbers(self) -> None:
        """Duplicate bale numbers in input raise application error."""
        input_data = self._make_input(
            bales=(
                ("BAL-001", "ALGODÓN", "2.2", "120", "20"),
                ("BAL-001", "POLIÉSTER", "1.5", "130", "25"),
            )
        )

        with self.assertRaises(DuplicateBaleNumberInReceptionError):
            self.use_case.execute(input_data)

    def test_no_side_effects_on_duplicate_bale_numbers(self) -> None:
        """When validation fails, nothing is persisted nor committed."""
        input_data = self._make_input(
            bales=(
                ("BAL-001", "ALGODÓN", "2.2", "120", "20"),
                ("BAL-001", "POLIÉSTER", "1.5", "130", "25"),
            )
        )

        with self.assertRaises(DuplicateBaleNumberInReceptionError):
            self.use_case.execute(input_data)

        self.assertIsNone(self.reception_repo.added)
        self.assertEqual(len(self.bale_repo.added_bales), 0)
        self.assertFalse(self.transaction.committed)

    def test_persists_reception_and_bales(self) -> None:
        """After a successful execution, reception and bales are stored."""
        input_data = self._make_input()
        self.use_case.execute(input_data)

        added = self.reception_repo.added
        assert added is not None
        self.assertEqual(added.bale_count, 2)
        self.assertEqual(len(self.bale_repo.added_bales), 2)

    def test_commits_transaction(self) -> None:
        """Transaction context manager is entered and committed."""
        input_data = self._make_input()
        self.use_case.execute(input_data)

        self.assertTrue(self.transaction.entered)
        self.assertTrue(self.transaction.committed)

    def test_strips_provider_name(self) -> None:
        """Provider name is stripped of surrounding whitespace."""
        input_data = self._make_input()
        self.use_case.execute(input_data)

        added = self.reception_repo.added
        assert added is not None
        self.assertEqual(added.provider_name, "PROV-001")

    def test_generates_unique_identities(self) -> None:
        """Reception and each bale get distinct IDs."""
        input_data = self._make_input()
        result = self.use_case.execute(input_data)

        self.assertNotEqual(result.reception_id, result.bale_ids[0])
        self.assertNotEqual(result.bale_ids[0], result.bale_ids[1])

    def test_bales_belong_to_reception(self) -> None:
        """Every created bale references the reception's ID."""
        input_data = self._make_input()
        result = self.use_case.execute(input_data)

        for bale in self.bale_repo.added_bales:
            self.assertEqual(
                bale.reception_id.value,
                result.reception_id,
            )

    def test_application_error_is_base(self) -> None:
        """DuplicateBaleNumberInReceptionError inherits from the base."""
        self.assertTrue(
            issubclass(
                DuplicateBaleNumberInReceptionError,
                RawMaterialReceptionApplicationError,
            )
        )


if __name__ == "__main__":
    unittest.main()
