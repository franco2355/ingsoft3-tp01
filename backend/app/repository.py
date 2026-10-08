"""Operaciones SQL de expedientes."""

from .db import conectar


CAMPOS = """id, numero, anio, acta, fecha, protagonista, dni, articulos,
            detalle, movimiento, creado_en, actualizado_en"""
CAMPOS_EDITABLES = (
    "numero", "anio", "acta", "fecha", "protagonista", "dni",
    "articulos", "detalle", "movimiento",
)


def valores_editables(datos):
    return tuple(datos[campo] for campo in CAMPOS_EDITABLES)


def listar(busqueda=""):
    consulta = f"SELECT {CAMPOS} FROM expedientes"
    parametros = ()
    if busqueda:
        consulta += """ WHERE numero LIKE %s OR CAST(anio AS CHAR) LIKE %s
                        OR acta LIKE %s OR fecha LIKE %s OR protagonista LIKE %s
                        OR dni LIKE %s OR articulos LIKE %s OR detalle LIKE %s
                        OR movimiento LIKE %s"""
        termino = f"%{busqueda}%"
        parametros = (termino,) * 9
    consulta += " ORDER BY actualizado_en DESC, id DESC"

    with conectar() as conexion, conexion.cursor() as cursor:
        cursor.execute(consulta, parametros)
        return cursor.fetchall()


def buscar_por_id(id_expediente):
    with conectar() as conexion, conexion.cursor() as cursor:
        cursor.execute(
            f"SELECT {CAMPOS} FROM expedientes WHERE id = %s",
            (id_expediente,),
        )
        return cursor.fetchone()


def crear(datos):
    consulta = """
        INSERT INTO expedientes
            (numero, anio, acta, fecha, protagonista, dni, articulos,
             detalle, movimiento)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
    """
    with conectar() as conexion, conexion.cursor() as cursor:
        cursor.execute(consulta, valores_editables(datos))
        id_expediente = cursor.lastrowid
        conexion.commit()
    return buscar_por_id(id_expediente)


def actualizar(id_expediente, datos):
    consulta = """
        UPDATE expedientes
        SET numero = %s, anio = %s, acta = %s, fecha = %s, protagonista = %s,
            dni = %s, articulos = %s, detalle = %s, movimiento = %s
        WHERE id = %s
    """
    parametros = valores_editables(datos) + (id_expediente,)
    with conectar() as conexion, conexion.cursor() as cursor:
        cursor.execute(consulta, parametros)
        conexion.commit()
    return buscar_por_id(id_expediente)


def eliminar(id_expediente):
    with conectar() as conexion, conexion.cursor() as cursor:
        cursor.execute("DELETE FROM expedientes WHERE id = %s", (id_expediente,))
        eliminado = cursor.rowcount == 1
        conexion.commit()
    return eliminado
