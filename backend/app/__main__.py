"""Punto de entrada del backend."""

from waitress import serve

from . import config
from . import crear_app
from .db import inicializar_base


def iniciar():
    inicializar_base()
    serve(crear_app(), host="0.0.0.0", port=config.PUERTO_APP)


if __name__ == "__main__":
    iniciar()
