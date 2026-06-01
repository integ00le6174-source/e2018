const form = document.getElementById("loginForm");
const status = document.getElementById("loginStatus");

if (location.protocol === "file:") {
  status.innerHTML = 'この画面はサーバー経由で開く必要があります。<br>http://127.0.0.1:3000/login.html を開いてください。';
  form.querySelector("button").disabled = true;
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const button = form.querySelector("button");
  button.disabled = true;
  status.textContent = "確認しています...";

  try {
    const response = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: form.elements.password.value }),
    });
    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || "ログインできませんでした。");
    }

    location.href = "/";
  } catch (error) {
    status.textContent = error.message;
  } finally {
    button.disabled = false;
  }
});
