FROM python:3.12 AS build
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt

FROM build AS test
COPY requirements-dev.txt .
RUN pip install -r requirements-dev.txt
COPY .coveragerc .
COPY app/ ./app/
COPY tests/ ./tests/
COPY scripts/ ./scripts/
CMD ["sh", "-c", "python -m pytest --cov=app --cov-config=.coveragerc --cov-report=term-missing --cov-report=json:coverage.json --cov-report=xml:coverage.xml --cov-report=html:htmlcov && python scripts/check_coverage.py coverage.json --lines 90 --branches 85"]

FROM python:3.12-slim AS runtime
WORKDIR /app
COPY --from=build /usr/local /usr/local
COPY app/ ./app/
EXPOSE 8000
CMD ["python", "-m", "app"]
