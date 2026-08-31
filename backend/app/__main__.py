"""Punto de entrada del backend."""

from waitress import serve

from . import create_app
from .config import settings
from .db import init_database


def main():
    init_database()
    serve(create_app(), host="0.0.0.0", port=settings.app_port)


if __name__ == "__main__":
    main()
