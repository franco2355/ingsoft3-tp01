from datetime import date

import pytest

from app.domain import antiguedad, validar_expediente


def expediente_con(campo, valor):
    # Cambia un dato de un expediente válido.
    expediente = {"numero": "123-A", "anio": 2020, "protagonista": "Ana"}
    expediente[campo] = valor
    return expediente


def test_acepta_un_expediente_valido():
    _, errores = validar_expediente(expediente_con("numero", "123-A"))
    assert errores == {}


# Repite el test con cada valor.
@pytest.mark.parametrize("numero", ["", "X" * 31])
def test_rechaza_un_numero_invalido(numero):
    _, errores = validar_expediente(expediente_con("numero", numero))
    assert "numero" in errores


@pytest.mark.parametrize("anio", [1899, None, "no-es-un-año"])
def test_rechaza_un_anio_invalido(anio):
    _, errores = validar_expediente(expediente_con("anio", anio))
    assert "anio" in errores


def test_rechaza_un_protagonista_vacio():
    _, errores = validar_expediente(expediente_con("protagonista", ""))
    assert "protagonista" in errores


def test_rechaza_un_acta_demasiado_larga():
    _, errores = validar_expediente(expediente_con("acta", "x" * 61))
    assert "acta" in errores


# Prueba los límites entre las categorías.
@pytest.mark.parametrize(("anios", "esperado"), [(0, "reciente"), (1, "reciente"), (5, "en curso"), (6, "archivo")])
def test_clasifica_la_antiguedad(anios, esperado):
    anio = date.today().year - anios
    assert antiguedad(anio) == esperado
