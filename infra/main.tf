terraform {
  required_version = ">= 1.5, < 2.0"
  required_providers {
    docker = {
      source  = "kreuzwerker/docker"
      version = "4.6.0"
    }
  }
  backend "local" {}
}

provider "docker" {}

resource "docker_network" "preprod" {
  name = "expedientes-preprod"
}

resource "docker_volume" "db" {
  name = "expedientes-preprod-db"
}

resource "docker_image" "db" {
  name         = "mysql:8.4"
  keep_locally = true
}

resource "docker_image" "backend" {
  name         = "ghcr.io/franco2355/ingsoft3-tp01-backend:${var.image_tag}"
  keep_locally = true
}

resource "docker_image" "frontend" {
  name         = "ghcr.io/franco2355/ingsoft3-tp01-frontend:${var.image_tag}"
  keep_locally = true
}

resource "docker_container" "db" {
  name    = "expedientes-preprod-db"
  image   = docker_image.db.image_id
  restart = "unless-stopped"
  env = [
    "MYSQL_DATABASE=expedientes",
    "MYSQL_USER=expedientes",
    "MYSQL_PASSWORD=${var.db_password}",
    "MYSQL_RANDOM_ROOT_PASSWORD=yes",
  ]
  networks_advanced {
    name = docker_network.preprod.name
  }
  volumes {
    volume_name    = docker_volume.db.name
    container_path = "/var/lib/mysql"
  }
  healthcheck {
    test     = ["CMD", "mysqladmin", "ping", "-h", "127.0.0.1"]
    interval = "5s"
    timeout  = "5s"
    retries  = 30
  }
  wait         = true
  wait_timeout = 180
}

resource "docker_container" "backend" {
  name    = "expedientes-preprod-backend"
  image   = docker_image.backend.image_id
  restart = "unless-stopped"
  env = [
    "DB_HOST=${docker_container.db.name}",
    "DB_PASSWORD=${var.db_password}",
    "APP_USER=${var.app_user}",
    "APP_PASSWORD=${var.app_password}",
  ]
  networks_advanced {
    name = docker_network.preprod.name
  }
  healthcheck {
    test = [
      "CMD", "python", "-c",
      "import urllib.request; urllib.request.urlopen('http://127.0.0.1:8000/healthz', timeout=3)",
    ]
    interval = "5s"
    timeout  = "5s"
    retries  = 20
  }
  wait         = true
  wait_timeout = 120
}

resource "docker_container" "frontend" {
  name    = "expedientes-preprod-frontend"
  image   = docker_image.frontend.image_id
  restart = "unless-stopped"
  env     = ["BACKEND_URL=http://${docker_container.backend.name}:8000"]
  networks_advanced {
    name = docker_network.preprod.name
  }
  ports {
    internal = 3000
    external = var.port
    ip       = "127.0.0.1"
  }
}
