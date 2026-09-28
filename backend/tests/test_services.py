"""Tests unitarios de casos de uso con la persistencia reemplazada por un mock."""

from datetime import date
from unittest.mock import Mock

from app.services import create_validated_expediente


def valid_payload(**changes):
    payload = {
        "numero": "EXP-9",
        "anio": date.today().year,
        "protagonista": "Persona de prueba",
    }
    payload.update(changes)
    return payload


def test_create_validated_expediente_calls_storage_with_normalized_data():
    storage = Mock()
    storage.create.return_value = {"id": 9, "numero": "EXP-9"}

    created, errors = create_validated_expediente(
        valid_payload(numero="  EXP-9 "), storage
    )

    assert errors == {}
    assert created == {"id": 9, "numero": "EXP-9"}
    storage.create.assert_called_once()
    assert storage.create.call_args.args[0]["numero"] == "EXP-9"


def test_create_validated_expediente_does_not_persist_invalid_input():
    storage = Mock()

    created, errors = create_validated_expediente(valid_payload(numero=""), storage)

    assert created is None
    assert "numero" in errors
    storage.create.assert_not_called()
