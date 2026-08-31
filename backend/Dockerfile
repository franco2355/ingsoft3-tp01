FROM python:3.12 AS build
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt

FROM python:3.12-slim AS runtime
WORKDIR /app
COPY --from=build /usr/local /usr/local
COPY app/ ./app/
EXPOSE 8000
CMD ["python", "-m", "app"]
