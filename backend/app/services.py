"""Casos de uso de expedientes independientes de Flask y de MySQL."""

from .domain import validate_expediente


def create_validated_expediente(payload, storage):
    """Valida un expediente y lo persiste mediante la dependencia recibida."""
    data, errors = validate_expediente(payload)
    if errors:
        return None, errors

    return storage.create(data), {}
