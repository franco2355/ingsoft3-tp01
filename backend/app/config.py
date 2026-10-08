"""Configuración tomada de variables de entorno."""

import os


HOST_DB = os.getenv("DB_HOST", "db")
PUERTO_DB = int(os.getenv("DB_PORT", "3306"))
NOMBRE_DB = os.getenv("DB_NAME", "expedientes")
USUARIO_DB = os.getenv("DB_USER", "expedientes")
CLAVE_DB = os.getenv("DB_PASSWORD", "")
PUERTO_APP = int(os.getenv("APP_PORT", "8000"))
USUARIO_APP = os.getenv("APP_USER", "")
CLAVE_APP = os.getenv("APP_PASSWORD", "")
