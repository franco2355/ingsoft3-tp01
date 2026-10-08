"""Casos de uso de expedientes independientes de Flask y de MySQL."""

from .domain import validar_expediente


def crear_expediente_validado(datos, repositorio):
    """Valida un expediente y lo persiste mediante la dependencia recibida."""
    datos_validos, errores = validar_expediente(datos)
    if errores:
        return None, errores

    return repositorio.crear(datos_validos), {}
