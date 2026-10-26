# Preprod — TP8

Terraform, con el provider de Docker, crea en el VPS un entorno preprod con MySQL,
backend y frontend, usando la imagen `sha-7e74c53…` del TP7 en `127.0.0.1:3200`.
QA y PROD no se tocan, porque preprod usa sus propios nombres, red, volumen y puerto.

Las contraseñas están en `~/.config/expedientes-preprod/terraform.tfvars` (permisos 600)
y el estado en `~/.local/state/expedientes-preprod/terraform.tfstate`, y ninguno de
los dos se sube a Git.

Dentro del VPS:

```bash
cd ~/ingsoft3-preprod
VARS="$HOME/.config/expedientes-preprod/terraform.tfvars"
~/.local/bin/terraform -chdir=infra plan -var-file="$VARS"     # muestra qué va a crear o cambiar
~/.local/bin/terraform -chdir=infra apply -var-file="$VARS"    # crea preprod
curl -f http://localhost:3200/healthz                          # frontend → API → MySQL
~/.local/bin/terraform -chdir=infra destroy -var-file="$VARS"  # borra solo preprod
```

Para ver la pantalla desde mi computadora:

```bash
ssh -N -L 3200:localhost:3200 lopez@209.126.4.187
```
