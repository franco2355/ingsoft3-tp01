from datetime import date

import pytest

from app.domain import antiguedad, validar_expediente

AHORA = date.today().year


def valido():
    return {"numero": "123-A", "anio": AHORA, "protagonista": "Ana"}


def test_acepta_un_expediente_valido_y_recorta_espacios():
    expediente = valido()
    expediente["numero"] = " 123-A "
    expediente["protagonista"] = " Ana "

    datos, errores = validar_expediente(expediente)

    assert errores == {}
    assert (datos["numero"], datos["protagonista"]) == ("123-A", "Ana")


@pytest.mark.parametrize("numero", ["", "   ", "X" * 31])
def test_rechaza_numero_invalido(numero):
    expediente = valido()
    expediente["numero"] = numero

    _, errores = validar_expediente(expediente)

    assert "numero" in errores


@pytest.mark.parametrize(
    ("campo", "valor"),
    [("anio", 1900), ("anio", AHORA + 1), ("numero", "X" * 30), ("protagonista", "P" * 120), ("acta", "x" * 60)],
)
def test_acepta_los_valores_justo_en_el_borde(campo, valor):
    expediente = valido()
    expediente[campo] = valor

    _, errores = validar_expediente(expediente)

    assert errores == {}


@pytest.mark.parametrize("anio", [1899, AHORA + 2, None, "no-es-un-año"])
def test_rechaza_anio_invalido(anio):
    expediente = valido()
    expediente["anio"] = anio

    _, errores = validar_expediente(expediente)

    assert "anio" in errores


@pytest.mark.parametrize("protagonista", ["", " ", "P" * 121])
def test_rechaza_protagonista_invalido(protagonista):
    expediente = valido()
    expediente["protagonista"] = protagonista

    _, errores = validar_expediente(expediente)

    assert "protagonista" in errores


@pytest.mark.parametrize(("campo", "limite"), [("acta", 60), ("dni", 20), ("movimiento", 255)])
def test_rechaza_texto_opcional_largo(campo, limite):
    expediente = valido()
    expediente[campo] = "x" * (limite + 1)

    _, errores = validar_expediente(expediente)

    assert campo in errores


@pytest.mark.parametrize(("anios", "esperado"), [(0, "reciente"), (1, "reciente"), (5, "en curso"), (6, "archivo")])
def test_clasifica_la_antiguedad(anios, esperado):
    assert antiguedad(AHORA - anios) == esperado
