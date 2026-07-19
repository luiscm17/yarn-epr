import unittest

from sqlalchemy import DateTime, Numeric, String, Text

from warehouse.adapters.persistence.raw_material_bale_record import (
    RawMaterialBaleRecord,
)
from warehouse.adapters.persistence.raw_material_reception_record import (
    RawMaterialReceptionRecord,
)


class TestPersistenceSchema(unittest.TestCase):
    def test_domain_bounded_strings_match_domain_limits(self) -> None:
        bale_number = RawMaterialBaleRecord.__table__.c.bale_number.type
        material_type = RawMaterialBaleRecord.__table__.c.material_type.type

        self.assertIsInstance(bale_number, String)
        self.assertEqual(bale_number.length, 10)
        self.assertIsInstance(material_type, String)
        self.assertEqual(material_type.length, 20)

    def test_provider_name_is_unbounded(self) -> None:
        provider_name = RawMaterialReceptionRecord.__table__.c.provider_name.type

        self.assertIsInstance(provider_name, Text)

    def test_decimals_have_no_unconfirmed_precision_or_scale(self) -> None:
        for column_name in (
            "dtex",
            "gross_weight_kg",
            "container_weight_kg",
        ):
            numeric = RawMaterialBaleRecord.__table__.c[column_name].type
            self.assertIsInstance(numeric, Numeric)
            self.assertIsNone(numeric.precision)
            self.assertIsNone(numeric.scale)

    def test_reception_datetime_remains_timezone_aware(self) -> None:
        received_at = RawMaterialReceptionRecord.__table__.c.received_at.type

        self.assertIsInstance(received_at, DateTime)
        self.assertTrue(received_at.timezone)


if __name__ == "__main__":
    unittest.main()
