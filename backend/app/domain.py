"""Validación básica de un expediente, sin Flask ni base de datos."""

from datetime import date


LIMITES_TEXTO = {
    "acta": 60,
    "fecha": 10,
    "dni": 20,
    "articulos": 255,
    "detalle": 255,
    "movimiento": 255,
}


def validar_expediente(datos):
    errores = {}
    numero = str(datos.get("numero", "")).strip()
    protagonista = str(datos.get("protagonista", "")).strip()
    campos_opcionales = {
        campo: str(datos.get(campo, "")).strip()
        for campo in LIMITES_TEXTO
    }

    try:
        anio = int(datos.get("anio"))
    except (TypeError, ValueError):
        anio = None

    if not numero or len(numero) > 30:
        errores["numero"] = "Debe tener entre 1 y 30 caracteres."
    if anio is None or anio < 1900 or anio > date.today().year + 1:
        errores["anio"] = "El año está fuera del rango permitido."
    if not protagonista or len(protagonista) > 120:
        errores["protagonista"] = "Debe tener entre 1 y 120 caracteres."
    for campo, limite in LIMITES_TEXTO.items():
        if len(campos_opcionales[campo]) > limite:
            errores[campo] = f"No puede superar los {limite} caracteres."

    if errores:
        return None, errores

    return {
        "numero": numero,
        "anio": anio,
        "acta": campos_opcionales["acta"],
        "fecha": campos_opcionales["fecha"],
        "protagonista": protagonista,
        "dni": campos_opcionales["dni"],
        "articulos": campos_opcionales["articulos"],
        "detalle": campos_opcionales["detalle"],
        "movimiento": campos_opcionales["movimiento"],
    }, {}


def antiguedad(anio):
    """Clasifica un expediente según cuántos años tiene."""
    anios = date.today().year - anio
    if anios <= 1:
        return "reciente"
    if anios <= 5:
        return "en curso"
    return "archivo"
