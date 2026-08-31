const form = document.querySelector("#loginForm");
const errorBox = document.querySelector("#authError");
const button = document.querySelector("#loginButton");

if (sessionStorage.getItem("authToken")) {
  window.location.replace("/");
} else {
  form.reset();
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  errorBox.hidden = true;
  button.disabled = true;
  button.textContent = "Ingresando...";

  try {
    const response = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user: document.querySelector("#usuario").value,
        password: document.querySelector("#clave").value,
      }),
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || "No se pudo iniciar sesión.");

    sessionStorage.setItem("authToken", result.token);
    sessionStorage.setItem("authUser", result.user);
    window.location.replace("/");
  } catch (error) {
    errorBox.textContent = error.message;
    errorBox.hidden = false;
  } finally {
    button.disabled = false;
    button.textContent = "Ingresar";
  }
});
