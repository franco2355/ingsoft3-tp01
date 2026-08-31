"""Contrato HTTP del gestor de expedientes."""

import secrets

from flask import Blueprint, jsonify, request
from pymysql.err import IntegrityError

from . import repository
from .db import connect
from .config import settings
from .domain import validate_expediente


api = Blueprint("api", __name__)
active_tokens = set()


def current_token():
    authorization = request.headers.get("Authorization", "")
    if not authorization.startswith("Bearer "):
        return ""
    return authorization.removeprefix("Bearer ").strip()


def require_login():
    if request.path.startswith("/api/expedientes"):
        if current_token() not in active_tokens:
            return jsonify(error="Tenés que iniciar sesión."), 401
    return None


@api.before_request
def protect_expedientes():
    return require_login()


def response(expediente):
    if not expediente:
        return None
    result = dict(expediente)
    for field in ("creado_en", "actualizado_en"):
        result[field] = result[field].isoformat()
    return result


@api.get("/healthz")
def health():
    with connect() as connection, connection.cursor() as cursor:
        cursor.execute("SELECT 1")
    return jsonify(ok=True, service="backend")


@api.post("/api/login")
def login():
    payload = request.get_json(silent=True) or {}
    user = str(payload.get("user", ""))
    password = str(payload.get("password", ""))

    if not settings.app_user or not settings.app_password:
        return jsonify(error="El acceso no está configurado."), 503

    valid_user = secrets.compare_digest(user, settings.app_user)
    valid_password = secrets.compare_digest(password, settings.app_password)
    if not valid_user or not valid_password:
        return jsonify(error="Usuario o contraseña incorrectos."), 401

    token = secrets.token_urlsafe(32)
    active_tokens.add(token)
    return jsonify(token=token, user=settings.app_user)


@api.post("/api/logout")
def logout():
    active_tokens.discard(current_token())
    return "", 204


@api.get("/api/expedientes")
def list_expedientes():
    search = request.args.get("buscar", "").strip()
    return jsonify([response(item) for item in repository.list_all(search)])


@api.post("/api/expedientes")
def create_expediente():
    data, errors = validate_expediente(request.get_json(silent=True) or {})
    if errors:
        return jsonify(errors=errors), 400
    try:
        created = repository.create(data)
    except IntegrityError:
        return jsonify(error="Ya existe ese número de expediente para el año indicado."), 409
    return jsonify(response(created)), 201


@api.put("/api/expedientes/<int:expediente_id>")
def update_expediente(expediente_id):
    current = repository.get_by_id(expediente_id)
    if not current:
        return jsonify(error="Expediente inexistente."), 404

    data, errors = validate_expediente(request.get_json(silent=True) or {})
    if errors:
        return jsonify(errors=errors), 400
    try:
        updated = repository.update(expediente_id, data)
    except IntegrityError:
        return jsonify(error="Ya existe ese número de expediente para el año indicado."), 409
    return jsonify(response(updated))


@api.delete("/api/expedientes/<int:expediente_id>")
def delete_expediente(expediente_id):
    if not repository.delete(expediente_id):
        return jsonify(error="Expediente inexistente."), 404
    return "", 204
