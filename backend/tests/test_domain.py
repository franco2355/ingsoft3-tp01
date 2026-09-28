"""Tests unitarios de las reglas de expedientes."""

from datetime import date

import pytest

from app.domain import validate_expediente


def valid_payload(**changes):
    payload = {
        "numero": "123-A",
        "anio": date.today().year,
        "protagonista": "Persona de prueba",
        "detalle": "Ingreso inicial",
    }
    payload.update(changes)
    return payload


def test_accepts_valid_payload():
    data, errors = validate_expediente(valid_payload())

    assert errors == {}
    assert data["numero"] == "123-A"


def test_normalizes_required_and_optional_text():
    data, errors = validate_expediente(
        valid_payload(numero="  123-A  ", protagonista="  Ana  ", acta="  10/26  ")
    )

    assert errors == {}
    assert (data["numero"], data["protagonista"], data["acta"]) == (
        "123-A",
        "Ana",
        "10/26",
    )


@pytest.mark.parametrize("numero", ["", "   ", "X" * 31])
def test_rejects_invalid_number(numero):
    _, errors = validate_expediente(valid_payload(numero=numero))

    assert "numero" in errors


@pytest.mark.parametrize("anio", [1900, date.today().year + 1])
def test_accepts_year_boundaries(anio):
    data, errors = validate_expediente(valid_payload(anio=anio))

    assert errors == {}
    assert data["anio"] == anio


@pytest.mark.parametrize("anio", [1899, date.today().year + 2])
def test_rejects_year_outside_boundaries(anio):
    _, errors = validate_expediente(valid_payload(anio=anio))

    assert "anio" in errors


@pytest.mark.parametrize("anio", [None, "no-es-un-año"])
def test_rejects_non_numeric_year(anio):
    _, errors = validate_expediente(valid_payload(anio=anio))

    assert "anio" in errors


@pytest.mark.parametrize("protagonista", ["", " ", "P" * 121])
def test_rejects_invalid_protagonist(protagonista):
    _, errors = validate_expediente(valid_payload(protagonista=protagonista))

    assert "protagonista" in errors


@pytest.mark.parametrize(
    ("field", "limit"),
    [("acta", 60), ("dni", 20), ("detalle", 255), ("movimiento", 255)],
)
def test_rejects_optional_text_over_its_limit(field, limit):
    _, errors = validate_expediente(valid_payload(**{field: "x" * (limit + 1)}))

    assert field in errors


def test_returns_all_normalized_fields():
    data, errors = validate_expediente(valid_payload())

    assert errors == {}
    assert set(data) == {
        "numero",
        "anio",
        "acta",
        "fecha",
        "protagonista",
        "dni",
        "articulos",
        "detalle",
        "movimiento",
    }
