output "url" {
  value = "http://localhost:${var.port}"
}

output "health_url" {
  value = "http://localhost:${var.port}/healthz"
}
