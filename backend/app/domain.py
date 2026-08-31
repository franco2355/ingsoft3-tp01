"""Validación básica de un expediente, sin Flask ni base de datos."""

from datetime import date


TEXT_LIMITS = {
    "acta": 60,
    "fecha": 10,
    "dni": 20,
    "articulos": 255,
    "detalle": 255,
    "movimiento": 255,
}


def validate_expediente(payload):
    errors = {}
    numero = str(payload.get("numero", "")).strip()
    protagonista = str(payload.get("protagonista", "")).strip()
    optional = {
        field: str(payload.get(field, "")).strip()
        for field in TEXT_LIMITS
    }

    try:
        anio = int(payload.get("anio"))
    except (TypeError, ValueError):
        anio = 0

    if not numero or len(numero) > 30:
        errors["numero"] = "Debe tener entre 1 y 30 caracteres."
    if anio < 1900 or anio > date.today().year + 1:
        errors["anio"] = "El año está fuera del rango permitido."
    if not protagonista or len(protagonista) > 120:
        errors["protagonista"] = "Debe tener entre 1 y 120 caracteres."
    for field, limit in TEXT_LIMITS.items():
        if len(optional[field]) > limit:
            errors[field] = f"No puede superar los {limit} caracteres."

    if errors:
        return None, errors

    return {
        "numero": numero,
        "anio": anio,
        "acta": optional["acta"],
        "fecha": optional["fecha"],
        "protagonista": protagonista,
        "dni": optional["dni"],
        "articulos": optional["articulos"],
        "detalle": optional["detalle"],
        "movimiento": optional["movimiento"],
    }, {}
