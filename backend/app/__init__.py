"""Aplicación Flask del gestor de expedientes."""

from flask import Flask, jsonify


def create_app():
    from .routes import api

    app = Flask(__name__)
    app.register_blueprint(api)

    @app.errorhandler(404)
    def not_found(_error):
        return jsonify(error="Recurso inexistente."), 404

    @app.errorhandler(500)
    def internal_error(_error):
        return jsonify(error="Error interno del servidor."), 500

    return app
