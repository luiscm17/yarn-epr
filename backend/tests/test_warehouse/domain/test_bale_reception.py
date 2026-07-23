import unittest
from datetime import datetime, timezone
from uuid import uuid4

from warehouse.domain.raw_material import (
    BaleId,
    BaleReception,
    BaleReceptionId,
    DomainError,
    DuplicateBaleIdError,
    EmptyBaleReceptionError,
    InvalidProviderNameError,
    ReceptionDateTime,
    ShipmentNumber,
)


class TestBaleReception(unittest.TestCase):
    def setUp(self) -> None:
        self.reception_id = BaleReceptionId(uuid4())
        self.received_at = ReceptionDateTime(datetime.now(timezone.utc))
        self.shipment_number = ShipmentNumber("SHIP-001")
        self.bale_id_1 = BaleId(uuid4())
        self.bale_id_2 = BaleId(uuid4())

    def _make_reception(
        self,
        bale_ids: tuple[BaleId, ...] | None = None,
    ) -> BaleReception:
        return BaleReception(
            id=self.reception_id,
            received_at=self.received_at,
            shipment_number=self.shipment_number,
            provider_name="PROV-001",
            bale_ids=(self.bale_id_1, self.bale_id_2) if bale_ids is None else bale_ids,
        )

    def test_creates_with_multiple_bales(self) -> None:
        reception = self._make_reception()
        self.assertEqual(reception.id, self.reception_id)
        self.assertEqual(reception.shipment_number.value, "SHIP-001")
        self.assertEqual(reception.provider_name, "PROV-001")
        self.assertEqual(len(reception.bale_ids), 2)

    def test_creates_with_single_bale(self) -> None:
        reception = self._make_reception(bale_ids=(self.bale_id_1,))
        self.assertEqual(reception.bale_count, 1)

    def test_bale_count_matches_number_of_bales(self) -> None:
        reception = self._make_reception()
        self.assertEqual(reception.bale_count, 2)

    def test_rejects_empty_bale_ids(self) -> None:
        with self.assertRaises(EmptyBaleReceptionError) as ctx:
            self._make_reception(bale_ids=())
        self.assertIn("at least one bale", str(ctx.exception))

    def test_rejects_duplicate_bale_ids(self) -> None:
        with self.assertRaises(DuplicateBaleIdError) as ctx:
            self._make_reception(bale_ids=(self.bale_id_1, self.bale_id_1))
        self.assertIn("duplicate", str(ctx.exception))

    def test_strips_provider_name_whitespace(self) -> None:
        reception = BaleReception(
            id=self.reception_id,
            received_at=self.received_at,
            shipment_number=self.shipment_number,
            provider_name="  PROV-001  ",
            bale_ids=(self.bale_id_1,),
        )
        self.assertEqual(reception.provider_name, "PROV-001")

    def test_rejects_empty_provider_name(self) -> None:
        with self.assertRaises(InvalidProviderNameError) as ctx:
            BaleReception(
                id=self.reception_id,
                received_at=self.received_at,
                shipment_number=self.shipment_number,
                provider_name="",
                bale_ids=(self.bale_id_1,),
            )
        self.assertIn("empty", str(ctx.exception))

    def test_rejects_whitespace_only_provider_name(self) -> None:
        with self.assertRaises(InvalidProviderNameError):
            BaleReception(
                id=self.reception_id,
                received_at=self.received_at,
                shipment_number=self.shipment_number,
                provider_name="   ",
                bale_ids=(self.bale_id_1,),
            )

    def test_is_frozen(self) -> None:
        reception = self._make_reception()
        with self.assertRaises(AttributeError):
            reception.provider_name = "OTHER"  # type: ignore[misc]

    def test_all_exceptions_inherit_from_domain_error(self) -> None:
        self.assertTrue(issubclass(EmptyBaleReceptionError, DomainError))
        self.assertTrue(issubclass(DuplicateBaleIdError, DomainError))
        self.assertTrue(issubclass(InvalidProviderNameError, DomainError))


if __name__ == "__main__":
    unittest.main()
