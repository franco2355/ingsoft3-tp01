"""Contrato HTTP del gestor de expedientes."""

import secrets

from flask import Blueprint, jsonify, request
from pymysql.err import IntegrityError

from . import config
from . import repository as repositorio
from .db import conectar
from .domain import validar_expediente
from .services import crear_expediente_validado


api = Blueprint("api", __name__)
tokens_activos = set()


def token_actual():
    autorizacion = request.headers.get("Authorization", "")
    if not autorizacion.startswith("Bearer "):
        return ""
    return autorizacion.removeprefix("Bearer ").strip()


@api.before_request
def exigir_login():
    ruta_protegida = request.path.startswith("/api/expedientes")
    sesion_invalida = token_actual() not in tokens_activos
    if ruta_protegida and sesion_invalida:
        return jsonify(error="Tenés que iniciar sesión."), 401


def preparar_respuesta(expediente):
    if not expediente:
        return None
    resultado = dict(expediente)
    for campo in ("creado_en", "actualizado_en"):
        resultado[campo] = resultado[campo].isoformat()
    return resultado


@api.get("/healthz")
def estado():
    with conectar() as conexion, conexion.cursor() as cursor:
        cursor.execute("SELECT 1")
    return jsonify(ok=True, service="backend")


@api.post("/api/login")
def iniciar_sesion():
    datos = request.get_json(silent=True) or {}
    usuario = str(datos.get("user", ""))
    clave = str(datos.get("password", ""))

    if not config.USUARIO_APP or not config.CLAVE_APP:
        return jsonify(error="El acceso no está configurado."), 503

    usuario_valido = secrets.compare_digest(usuario, config.USUARIO_APP)
    clave_valida = secrets.compare_digest(clave, config.CLAVE_APP)
    if not usuario_valido or not clave_valida:
        return jsonify(error="Usuario o contraseña incorrectos."), 401

    token = secrets.token_urlsafe(32)
    tokens_activos.add(token)
    return jsonify(token=token, user=config.USUARIO_APP)


@api.post("/api/logout")
def cerrar_sesion():
    tokens_activos.discard(token_actual())
    return "", 204


@api.get("/api/expedientes")
def listar_expedientes():
    busqueda = request.args.get("buscar", "").strip()
    expedientes = repositorio.listar(busqueda)
    return jsonify([preparar_respuesta(expediente) for expediente in expedientes])


@api.post("/api/expedientes")
def crear_expediente():
    datos = request.get_json(silent=True) or {}
    try:
        creado, errores = crear_expediente_validado(datos, repositorio)
    except IntegrityError:
        return jsonify(error="Ya existe ese número de expediente para el año indicado."), 409
    if errores:
        return jsonify(errors=errores), 400
    return jsonify(preparar_respuesta(creado)), 201


@api.put("/api/expedientes/<int:id_expediente>")
def actualizar_expediente(id_expediente):
    actual = repositorio.buscar_por_id(id_expediente)
    if not actual:
        return jsonify(error="Expediente inexistente."), 404

    entrada = request.get_json(silent=True) or {}
    datos, errores = validar_expediente(entrada)
    if errores:
        return jsonify(errors=errores), 400
    try:
        actualizado = repositorio.actualizar(id_expediente, datos)
    except IntegrityError:
        return jsonify(error="Ya existe ese número de expediente para el año indicado."), 409
    return jsonify(preparar_respuesta(actualizado))


@api.delete("/api/expedientes/<int:id_expediente>")
def eliminar_expediente(id_expediente):
    if not repositorio.eliminar(id_expediente):
        return jsonify(error="Expediente inexistente."), 404
    return "", 204
