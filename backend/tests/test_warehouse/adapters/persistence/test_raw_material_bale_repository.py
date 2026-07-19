import unittest
from datetime import datetime, timezone
from decimal import Decimal
from uuid import UUID

from sqlalchemy import create_engine
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from warehouse.adapters.persistence.raw_material_bale_record import (
    RawMaterialBaleRecord,
)
from warehouse.adapters.persistence.raw_material_bale_repository import (
    RawMaterialBaleRepository,
)
from warehouse.adapters.persistence.raw_material_reception_record import (
    RawMaterialReceptionRecord,
)
from warehouse.adapters.persistence.warehouse_record_registry import (
    WarehouseRecordRegistry,
)
from warehouse.domain.value_objects import BaleNumber


class TestRawMaterialBaleRepositoryFind(unittest.TestCase):
    def setUp(self) -> None:
        self.engine = create_engine("sqlite+pysqlite:///:memory:")
        WarehouseRecordRegistry.metadata.create_all(self.engine)
        self.session = Session(self.engine)
        self.repository = RawMaterialBaleRepository(self.session)
        self.reception_id = UUID(int=1)
        self.session.add(
            RawMaterialReceptionRecord(
                id=self.reception_id,
                received_at=datetime(2026, 1, 1, tzinfo=timezone.utc),
                shipment_number="SHIP-001",
                provider_name="Provider",
            )
        )
        self.session.flush()

    def tearDown(self) -> None:
        self.session.close()
        self.engine.dispose()

    def _add_bale(self, bale_id: int, bale_number: str) -> None:
        self.session.add(
            RawMaterialBaleRecord(
                id=UUID(int=bale_id),
                reception_id=self.reception_id,
                bale_number=bale_number,
                material_type="COTTON",
                dtex=Decimal("2.2000"),
                gross_weight_kg=Decimal("120.000"),
                container_weight_kg=Decimal("20.000"),
                status="in_warehouse",
            )
        )

    def test_empty_collection_returns_empty_frozenset(self) -> None:
        result = self.repository.find(())

        self.assertEqual(result, frozenset())
        self.assertIsInstance(result, frozenset)

    def test_no_matches_returns_empty_frozenset(self) -> None:
        self._add_bale(2, "BAL-001")

        result = self.repository.find({BaleNumber("BAL-999")})

        self.assertEqual(result, frozenset())

    def test_returns_only_existing_bale_number_value_objects(self) -> None:
        self._add_bale(2, "BAL-001")
        self._add_bale(3, "BAL-002")
        self._add_bale(4, "BAL-003")

        result = self.repository.find(
            {
                BaleNumber("BAL-001"),
                BaleNumber("BAL-003"),
                BaleNumber("BAL-999"),
            }
        )

        self.assertEqual(
            result,
            frozenset({BaleNumber("BAL-001"), BaleNumber("BAL-003")}),
        )
        self.assertTrue(all(isinstance(value, BaleNumber) for value in result))

    def test_named_database_constraint_rejects_sequential_duplicate(self) -> None:
        self._add_bale(2, "BAL-001")
        self.session.commit()
        self._add_bale(3, "BAL-001")

        with self.assertRaises(IntegrityError):
            self.session.commit()

        constraint = next(
            constraint
            for constraint in RawMaterialBaleRecord.__table__.constraints
            if constraint.name == "uq_raw_material_bales_bale_number"
        )
        self.assertEqual(
            {column.name for column in constraint.columns},
            {"bale_number"},
        )

    def test_finds_uncommitted_row_in_same_session(self) -> None:
        self._add_bale(2, "BAL-001")

        result = self.repository.find({BaleNumber("BAL-001")})

        self.assertEqual(result, frozenset({BaleNumber("BAL-001")}))


if __name__ == "__main__":
    unittest.main()
