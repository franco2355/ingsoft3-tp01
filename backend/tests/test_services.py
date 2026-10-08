from datetime import date
from unittest.mock import Mock

from app.services import crear_expediente_validado


def valido():
    return {"numero": " EXP-9 ", "anio": date.today().year, "protagonista": "Ana"}


def test_guarda_el_expediente_valido_una_sola_vez():
    repositorio = Mock()

    creado, _ = crear_expediente_validado(valido(), repositorio)

    repositorio.crear.assert_called_once()
    assert repositorio.crear.call_args.args[0]["numero"] == "EXP-9"
    assert creado == repositorio.crear.return_value


def test_no_guarda_un_expediente_invalido():
    repositorio = Mock()
    expediente = valido()
    expediente["numero"] = ""

    creado, errores = crear_expediente_validado(expediente, repositorio)

    assert creado is None and "numero" in errores
    repositorio.crear.assert_not_called()
