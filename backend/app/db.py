"""Conexión MySQL, esquema y datos mínimos de demostración."""

import pymysql
from pymysql.cursors import DictCursor

from .config import settings


DEMO_EXPEDIENTES = (
    ("DEMO-001", 2026, "15/26", "2026-08-20", "Persona Demo A", "", "Art. 84", "Expediente ficticio.", "Ingresado"),
    ("DEMO-002", 2026, "18/26", "2026-08-22", "Persona Demo B", "", "Art. 89", "Expediente ficticio.", "En trámite"),
    ("DEMO-003", 2026, "21/26", "2026-08-25", "Persona Demo C", "", "", "Expediente ficticio.", "Resuelto"),
)

EXTRA_COLUMNS = {
    "acta": "VARCHAR(60) NOT NULL DEFAULT ''",
    "fecha": "VARCHAR(10) NOT NULL DEFAULT ''",
    "dni": "VARCHAR(20) NOT NULL DEFAULT ''",
    "articulos": "VARCHAR(255) NOT NULL DEFAULT ''",
    "movimiento": "VARCHAR(255) NOT NULL DEFAULT ''",
}


def connect():
    return pymysql.connect(
        host=settings.db_host,
        port=settings.db_port,
        user=settings.db_user,
        password=settings.db_password,
        database=settings.db_name,
        cursorclass=DictCursor,
        charset="utf8mb4",
        autocommit=False,
    )


def init_database():
    schema = """
        CREATE TABLE IF NOT EXISTS expedientes (
            id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            numero VARCHAR(30) NOT NULL,
            anio SMALLINT UNSIGNED NOT NULL,
            acta VARCHAR(60) NOT NULL DEFAULT '',
            fecha VARCHAR(10) NOT NULL DEFAULT '',
            protagonista VARCHAR(120) NOT NULL,
            dni VARCHAR(20) NOT NULL DEFAULT '',
            articulos VARCHAR(255) NOT NULL DEFAULT '',
            detalle VARCHAR(255) NOT NULL DEFAULT '',
            movimiento VARCHAR(255) NOT NULL DEFAULT '',
            creado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            actualizado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
                ON UPDATE CURRENT_TIMESTAMP,
            UNIQUE KEY uq_expediente (numero, anio)
        ) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
    """
    with connect() as connection:
        with connection.cursor() as cursor:
            cursor.execute(schema)
            cursor.execute("SHOW COLUMNS FROM expedientes")
            existing_columns = {column["Field"] for column in cursor.fetchall()}
            for name, definition in EXTRA_COLUMNS.items():
                if name not in existing_columns:
                    cursor.execute(
                        f"ALTER TABLE expedientes ADD COLUMN {name} {definition}"
                    )
            cursor.execute("SELECT COUNT(*) AS total FROM expedientes")
            if cursor.fetchone()["total"] == 0:
                cursor.executemany(
                    """
                    INSERT INTO expedientes
                        (numero, anio, acta, fecha, protagonista, dni,
                         articulos, detalle, movimiento)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
                    """,
                    DEMO_EXPEDIENTES,
                )
        connection.commit()
