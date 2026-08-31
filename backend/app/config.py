"""Configuración centralizada en variables de entorno."""

import os
from dataclasses import dataclass


@dataclass(frozen=True)
class Settings:
    db_host: str = os.getenv("DB_HOST", "db")
    db_port: int = int(os.getenv("DB_PORT", "3306"))
    db_name: str = os.getenv("DB_NAME", "expedientes")
    db_user: str = os.getenv("DB_USER", "expedientes")
    db_password: str = os.getenv("DB_PASSWORD", "")
    app_port: int = int(os.getenv("APP_PORT", "8000"))
    app_user: str = os.getenv("APP_USER", "")
    app_password: str = os.getenv("APP_PASSWORD", "")


settings = Settings()
