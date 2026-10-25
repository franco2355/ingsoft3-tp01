output "url" {
  value = "http://localhost:${docker_container.frontend.ports[0].external}"
}

output "health_url" {
  value = "http://localhost:${docker_container.frontend.ports[0].external}/healthz"
}
