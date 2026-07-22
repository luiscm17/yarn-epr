import unittest
from datetime import datetime, timezone
from decimal import Decimal
from uuid import UUID

from sqlalchemy import create_engine
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from infra.persistence.record_registry import RecordRegistry
from warehouse.adapters.persistence.raw_material_bale_record import (
    RawMaterialBaleRecord,
)
from warehouse.adapters.persistence.raw_material_reception_record import (
    RawMaterialReceptionRecord,
)


class TestRawMaterialBaleRepository(unittest.TestCase):
    def setUp(self) -> None:
        self.engine = create_engine("sqlite+pysqlite:///:memory:")
        RecordRegistry.metadata.create_all(self.engine)
        self.session = Session(self.engine)
        self._add_reception(1, "SHIP-001")
        self._add_reception(2, "SHIP-002")
        self.session.flush()

    def tearDown(self) -> None:
        self.session.close()
        self.engine.dispose()

    def _add_reception(self, reception_id: int, shipment_number: str) -> None:
        self.session.add(
            RawMaterialReceptionRecord(
                id=UUID(int=reception_id),
                received_at=datetime(2026, 1, 1, tzinfo=timezone.utc),
                shipment_number=shipment_number,
                provider_name="Provider",
            )
        )

    def _add_bale(
        self,
        bale_id: int,
        reception_id: int,
        bale_number: str,
    ) -> None:
        self.session.add(
            RawMaterialBaleRecord(
                id=UUID(int=bale_id),
                reception_id=UUID(int=reception_id),
                bale_number=bale_number,
                material_type="COTTON",
                dtex=Decimal("2.2000"),
                gross_weight_kg=Decimal("120.000"),
                container_weight_kg=Decimal("20.000"),
                status="in_warehouse",
            )
        )

    def test_rejects_same_bale_number_within_reception(self) -> None:
        self._add_bale(3, 1, "BAL-001")
        self.session.commit()
        self._add_bale(4, 1, "BAL-001")

        with self.assertRaises(IntegrityError):
            self.session.commit()

    def test_allows_same_bale_number_in_different_receptions(self) -> None:
        self._add_bale(3, 1, "BAL-001")
        self._add_bale(4, 2, "BAL-001")

        self.session.commit()

        self.assertEqual(
            self.session.query(RawMaterialBaleRecord).count(),
            2,
        )


if __name__ == "__main__":
    unittest.main()
