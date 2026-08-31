import unittest
from datetime import date

from app.domain import validate_expediente


class ValidateExpedienteTest(unittest.TestCase):
    def valid(self, **changes):
        payload = {
            "numero": "123-A",
            "anio": date.today().year,
            "protagonista": "Persona de prueba",
            "detalle": "Ingreso inicial",
        }
        payload.update(changes)
        return payload

    def test_accepts_valid_payload(self):
        data, errors = validate_expediente(self.valid())
        self.assertFalse(errors)
        self.assertEqual(data["numero"], "123-A")

    def test_rejects_empty_number(self):
        _, errors = validate_expediente(self.valid(numero=""))
        self.assertIn("numero", errors)

    def test_rejects_old_year(self):
        _, errors = validate_expediente(self.valid(anio=1899))
        self.assertIn("anio", errors)

    def test_rejects_far_future_year(self):
        _, errors = validate_expediente(self.valid(anio=date.today().year + 2))
        self.assertIn("anio", errors)

    def test_rejects_empty_person(self):
        _, errors = validate_expediente(self.valid(protagonista=" "))
        self.assertIn("protagonista", errors)

    def test_rejects_long_optional_field(self):
        _, errors = validate_expediente(self.valid(movimiento="x" * 256))
        self.assertIn("movimiento", errors)


if __name__ == "__main__":
    unittest.main()
