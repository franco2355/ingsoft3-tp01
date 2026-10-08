"""Aplicación Flask del gestor de expedientes."""

from flask import Flask, jsonify


def crear_app():
    from .routes import api

    aplicacion = Flask(__name__)
    aplicacion.register_blueprint(api)

    @aplicacion.errorhandler(404)
    def recurso_inexistente(_error):
        return jsonify(error="Recurso inexistente."), 404

    @aplicacion.errorhandler(500)
    def error_interno(_error):
        return jsonify(error="Error interno del servidor."), 500

    return aplicacion
