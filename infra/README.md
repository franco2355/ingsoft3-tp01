# Preprod — TP8

Estado: validado en el VPS el 25/10/2026: `apply → destroy → apply`, health,
login y alta/búsqueda/baja de un expediente. El segundo plan no propone cambios.
Alcance: un entorno nuevo en Docker, con MySQL, backend y frontend del TP7.
Fuente de verdad: los archivos `.tf` de esta carpeta y el estado local de Terraform.

Requisitos: Terraform >= 1.5 y Docker funcionando. Desde la raíz del repo:

```bash
mkdir -p "$HOME/.local/state/expedientes-preprod"
terraform -chdir=infra init -backend-config="path=$HOME/.local/state/expedientes-preprod/terraform.tfstate"
read -rsp 'Contraseña MySQL de preprod: ' TF_VAR_db_password; echo
read -rsp 'Contraseña de ingreso de preprod: ' TF_VAR_app_password; echo
export TF_VAR_db_password TF_VAR_app_password
terraform -chdir=infra apply
curl -f http://localhost:3200/healthz
```

Abrí <http://localhost:3200> e ingresá como `preprod` con la segunda contraseña.
El health atraviesa el frontend y la API y ejecuta `SELECT 1` en su MySQL.
Comprobá también que podés listar y crear un expediente desde la pantalla.

```bash
terraform -chdir=infra plan       # Debe decir: No changes.
terraform -chdir=infra destroy    # Borra sólo preprod, incluida su base de prueba.
terraform -chdir=infra apply      # Lo recrea; comprobá health y la pantalla otra vez.
```

QA y PROD conservan sus redes, volúmenes y puertos. Preprod usa nombres propios,
el puerto local 3200 y la imagen `sha-7e74c53…` del TP7. Las URLs internas se
derivan de los contenedores declarados. El provider Docker está fijado en 4.6.0.
El estado contiene contraseñas: queda fuera del checkout y no se sube a Git.

## Copia operativa en el VPS

Está en `lopez@209.126.4.187:~/ingsoft3-preprod/infra`. Terraform está instalado
en `~/.local/bin/terraform`; las variables están en
`~/.config/expedientes-preprod/terraform.tfvars`, con permisos 600.
El estado está en `~/.local/state/expedientes-preprod/terraform.tfstate`.

Dentro del VPS:

```bash
cd ~/ingsoft3-preprod
~/.local/bin/terraform -chdir=infra plan -var-file="$HOME/.config/expedientes-preprod/terraform.tfvars"
~/.local/bin/terraform -chdir=infra destroy -var-file="$HOME/.config/expedientes-preprod/terraform.tfvars"
~/.local/bin/terraform -chdir=infra apply -var-file="$HOME/.config/expedientes-preprod/terraform.tfvars"
```

Para abrir la pantalla desde tu equipo:

```bash
ssh -N -L 3200:localhost:3200 lopez@209.126.4.187
```
