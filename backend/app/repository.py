"""Operaciones SQL del agregado Expediente."""

from .db import connect


FIELDS = """id, numero, anio, acta, fecha, protagonista, dni, articulos,
            detalle, movimiento, creado_en, actualizado_en"""
EDITABLE_FIELDS = (
    "numero", "anio", "acta", "fecha", "protagonista", "dni",
    "articulos", "detalle", "movimiento",
)


def values(data):
    return tuple(data[field] for field in EDITABLE_FIELDS)


def list_all(search=""):
    sql = f"SELECT {FIELDS} FROM expedientes"
    params = ()
    if search:
        sql += """ WHERE numero LIKE %s OR CAST(anio AS CHAR) LIKE %s
                   OR acta LIKE %s OR fecha LIKE %s OR protagonista LIKE %s
                   OR dni LIKE %s OR articulos LIKE %s OR detalle LIKE %s
                   OR movimiento LIKE %s"""
        term = f"%{search}%"
        params = (term,) * 9
    sql += " ORDER BY actualizado_en DESC, id DESC"

    with connect() as connection, connection.cursor() as cursor:
        cursor.execute(sql, params)
        return cursor.fetchall()


def get_by_id(expediente_id):
    with connect() as connection, connection.cursor() as cursor:
        cursor.execute(
            f"SELECT {FIELDS} FROM expedientes WHERE id = %s",
            (expediente_id,),
        )
        return cursor.fetchone()


def create(data):
    sql = """
        INSERT INTO expedientes
            (numero, anio, acta, fecha, protagonista, dni, articulos,
             detalle, movimiento)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
    """
    with connect() as connection, connection.cursor() as cursor:
        cursor.execute(sql, values(data))
        expediente_id = cursor.lastrowid
        connection.commit()
    return get_by_id(expediente_id)


def update(expediente_id, data):
    sql = """
        UPDATE expedientes
        SET numero=%s, anio=%s, acta=%s, fecha=%s, protagonista=%s,
            dni=%s, articulos=%s, detalle=%s, movimiento=%s
        WHERE id=%s
    """
    with connect() as connection, connection.cursor() as cursor:
        cursor.execute(sql, (*values(data), expediente_id))
        connection.commit()
    return get_by_id(expediente_id)


def delete(expediente_id):
    with connect() as connection, connection.cursor() as cursor:
        cursor.execute("DELETE FROM expedientes WHERE id=%s", (expediente_id,))
        deleted = cursor.rowcount == 1
        connection.commit()
    return deleted
