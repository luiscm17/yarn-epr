import unittest
from datetime import datetime, timezone
from decimal import Decimal
from unittest.mock import patch
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.engine import Engine
from sqlalchemy.orm import Session

from backend.integration_tests.database_test_support import (
    clean_warehouse_tables,
    create_test_engine,
)
from warehouse.adapters.identity.uuid_identity_generator import (
    UuidIdentityGenerator,
)
from warehouse.adapters.persistence.raw_material_bale_record import (
    RawMaterialBaleRecord,
)
from warehouse.adapters.persistence.raw_material_bale_repository import (
    RawMaterialBaleRepository,
)
from warehouse.adapters.persistence.raw_material_reception_record import (
    RawMaterialReceptionRecord,
)
from warehouse.adapters.persistence.raw_material_reception_repository import (
    RawMaterialReceptionRepository,
)
from warehouse.adapters.persistence.warehouse_transaction import (
    WarehouseTransaction,
)
from warehouse.application import (
    DuplicateShipmentNumberError,
    RawMaterialBaleReceptionInput,
    RawMaterialReceptionInput,
    RegisterRawMaterialReception,
)


class TestRegisterRawMaterialReceptionIntegration(unittest.TestCase):
    engine: Engine

    @classmethod
    def setUpClass(cls) -> None:
        cls.engine = create_test_engine()

    @classmethod
    def tearDownClass(cls) -> None:
        cls.engine.dispose()

    def setUp(self) -> None:
        clean_warehouse_tables(self.engine)

    def tearDown(self) -> None:
        clean_warehouse_tables(self.engine)

    def test_persists_reception_and_bales_with_database_types(self) -> None:
        received_at = datetime.fromisoformat("2026-07-22T14:15:16.123456-04:00")
        reception_input = RawMaterialReceptionInput(
            received_at=received_at,
            shipment_number="SHIP-800",
            provider_name="Andean Fiber Cooperative",
            bales=(
                RawMaterialBaleReceptionInput(
                    bale_number="BAL-800",
                    material_type="alpaca",
                    dtex=Decimal("2.20"),
                    gross_weight_kg=Decimal("125.750"),
                    container_weight_kg=Decimal("5.25"),
                ),
                RawMaterialBaleReceptionInput(
                    bale_number="BAL-801",
                    material_type="cotton",
                    dtex=Decimal("3.125"),
                    gross_weight_kg=Decimal("98.5"),
                    container_weight_kg=Decimal("3.1250"),
                ),
            ),
        )

        with Session(self.engine) as write_session:
            result = self._use_case(write_session).execute(reception_input)

        self.assertIsInstance(result.reception_id, UUID)
        self.assertEqual(len(result.bale_ids), 2)
        self.assertTrue(all(isinstance(bale_id, UUID) for bale_id in result.bale_ids))
        self.assertEqual(result.bale_count, 2)
        self.assertEqual(result.total_net_weight_kg, Decimal("215.8750"))

        with Session(self.engine) as read_session:
            reception = read_session.scalar(
                select(RawMaterialReceptionRecord).where(
                    RawMaterialReceptionRecord.id == result.reception_id
                )
            )
            bales = read_session.scalars(
                select(RawMaterialBaleRecord)
                .where(RawMaterialBaleRecord.id.in_(result.bale_ids))
                .order_by(RawMaterialBaleRecord.bale_number)
            ).all()

            self.assertIsNotNone(reception)
            assert reception is not None
            self.assertIsInstance(reception.id, UUID)
            self.assertEqual(reception.shipment_number, "SHIP-800")
            self.assertEqual(reception.provider_name, "Andean Fiber Cooperative")
            self.assertIsNotNone(reception.received_at.tzinfo)
            self.assertEqual(
                reception.received_at.astimezone(timezone.utc),
                received_at.astimezone(timezone.utc),
            )
            self.assertEqual(len(bales), 2)

            expected = (
                ("BAL-800", "ALPACA", Decimal("2.20"), Decimal("125.750"), Decimal("5.25")),
                ("BAL-801", "COTTON", Decimal("3.125"), Decimal("98.5"), Decimal("3.1250")),
            )
            for bale, values, expected_id in zip(bales, expected, result.bale_ids, strict=True):
                number, material, dtex, gross, container = values
                self.assertIsInstance(bale.id, UUID)
                self.assertEqual(bale.id, expected_id)
                self.assertEqual(bale.reception_id, result.reception_id)
                self.assertEqual(bale.bale_number, number)
                self.assertEqual(bale.material_type, material)
                self.assertIsInstance(bale.dtex, Decimal)
                self.assertIsInstance(bale.gross_weight_kg, Decimal)
                self.assertIsInstance(bale.container_weight_kg, Decimal)
                self.assertEqual(bale.dtex, dtex)
                self.assertEqual(bale.gross_weight_kg, gross)
                self.assertEqual(bale.container_weight_kg, container)
                self.assertEqual(bale.status, "in_warehouse")

    def test_duplicate_shipment_rolls_back_second_reception(self) -> None:
        ids = tuple(UUID(int=value) for value in range(1, 7))
        first_input = self._input("SHIP-810", "BAL-810", "First provider")
        second_input = self._input("SHIP-810", "BAL-811", "Second provider")

        with patch(
            "warehouse.adapters.identity.uuid_identity_generator.uuid4",
            side_effect=ids,
        ):
            with Session(self.engine) as first_session:
                first_result = self._use_case(first_session).execute(first_input)
            with Session(self.engine) as second_session:
                with self.assertRaises(DuplicateShipmentNumberError):
                    self._use_case(second_session).execute(second_input)

        with Session(self.engine) as read_session:
            first_reception = read_session.get(
                RawMaterialReceptionRecord, first_result.reception_id
            )
            first_bale = read_session.get(RawMaterialBaleRecord, first_result.bale_ids[0])
            second_reception = read_session.get(RawMaterialReceptionRecord, ids[2])
            second_bale = read_session.get(RawMaterialBaleRecord, ids[3])

            self.assertIsNotNone(first_reception)
            self.assertIsNotNone(first_bale)
            assert first_reception is not None
            assert first_bale is not None
            self.assertEqual(first_reception.provider_name, "First provider")
            self.assertEqual(first_bale.bale_number, "BAL-810")
            self.assertIsNone(second_reception)
            self.assertIsNone(second_bale)
            self.assertIsNone(
                read_session.scalar(
                    select(RawMaterialBaleRecord).where(
                        RawMaterialBaleRecord.bale_number == "BAL-811"
                    )
                )
            )

    @staticmethod
    def _use_case(session: Session) -> RegisterRawMaterialReception:
        return RegisterRawMaterialReception(
            reception_repository=RawMaterialReceptionRepository(session),
            bale_repository=RawMaterialBaleRepository(session),
            warehouse_transaction=WarehouseTransaction(session),
            identity_generator=UuidIdentityGenerator(),
        )

    @staticmethod
    def _input(
        shipment_number: str,
        bale_number: str,
        provider_name: str,
    ) -> RawMaterialReceptionInput:
        return RawMaterialReceptionInput(
            received_at=datetime.fromisoformat("2026-07-22T12:00:00+00:00"),
            shipment_number=shipment_number,
            provider_name=provider_name,
            bales=(
                RawMaterialBaleReceptionInput(
                    bale_number=bale_number,
                    material_type="cotton",
                    dtex=Decimal("2.2"),
                    gross_weight_kg=Decimal("100.5"),
                    container_weight_kg=Decimal("5.5"),
                ),
            ),
        )


if __name__ == "__main__":
    unittest.main()
