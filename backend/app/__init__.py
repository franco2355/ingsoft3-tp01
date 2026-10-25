"""Aplicación Flask del gestor de expedientes."""

import os

import sentry_sdk
from flask import Flask, jsonify


def filtrar_evento(evento, _hint):
    """Conservar errores y tiempos sin cuerpos, búsquedas ni consultas SQL."""
    evento.pop("breadcrumbs", None)
    evento.pop("spans", None)
    peticion = evento.get("request", {})
    for campo in ("headers", "cookies", "data", "query_string"):
        peticion.pop(campo, None)
    if "url" in peticion:
        peticion["url"] = peticion["url"].split("?", 1)[0]
    return evento


def crear_app():
    from .routes import api

    if os.getenv("SENTRY_DSN"):
        sentry_sdk.init(
            dsn=os.environ["SENTRY_DSN"],
            environment=os.getenv("SENTRY_ENVIRONMENT", "local"),
            release=os.getenv("SENTRY_RELEASE"),
            traces_sample_rate=1.0,
            send_default_pii=False,
            include_local_variables=False,
            max_request_body_size="never",
            before_send=filtrar_evento,
            before_send_transaction=filtrar_evento,
        )

    aplicacion = Flask(__name__)
    aplicacion.register_blueprint(api)

    @aplicacion.errorhandler(404)
    def recurso_inexistente(_error):
        return jsonify(error="Recurso inexistente."), 404

    @aplicacion.errorhandler(500)
    def error_interno(_error):
        return jsonify(error="Error interno del servidor."), 500

    return aplicacion
