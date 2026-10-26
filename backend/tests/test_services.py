from unittest.mock import Mock

from app.services import crear_expediente_validado


def test_guarda_un_expediente_valido():
    repositorio = Mock()
    expediente = {"numero": "EXP-9", "anio": 2020, "protagonista": "Ana"}
    crear_expediente_validado(expediente, repositorio)
    repositorio.crear.assert_called_once()


def test_no_guarda_un_expediente_invalido():
    repositorio = Mock()
    expediente = {"numero": "", "anio": 2020, "protagonista": "Ana"}
    crear_expediente_validado(expediente, repositorio)
    repositorio.crear.assert_not_called()
