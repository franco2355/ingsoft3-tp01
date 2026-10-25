variable "image_tag" {
  description = "Imagen inmutable publicada al cerrar el TP7."
  type        = string
  default     = "sha-7e74c5393b12667a8fdb95c82dc779f47d5333cf"
  validation {
    condition     = can(regex("^sha-[0-9a-f]{40}$", var.image_tag))
    error_message = "Usá sha- seguido de los 40 caracteres del commit publicado."
  }
}

variable "db_password" {
  type      = string
  sensitive = true
}

variable "app_user" {
  type    = string
  default = "preprod"
}

variable "app_password" {
  type      = string
  sensitive = true
}

variable "port" {
  type    = number
  default = 3200
}
