(() => {
  const token = localStorage.getItem("token");

  if (!token) {
    location.replace("/signin?reason=session");
    return;
  }

  try {
    const payload = JSON.parse(
      atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")),
    );
    if (payload.exp && payload.exp * 1000 <= Date.now()) {
      localStorage.removeItem("token");
      location.replace("/signin?reason=session");
      return;
    }
  } catch {
    localStorage.removeItem("token");
    location.replace("/signin?reason=session");
    return;
  }

  axios.interceptors.response.use(
    (response) => response,
    (error) => {
      const status = error.response?.status;
      if (status === 401 || status === 403) {
        localStorage.removeItem("token");
        location.replace("/signin?reason=session");
      }
      return Promise.reject(error);
    },
  );

  const style = document.createElement("style");
  style.textContent = `
    .confirm-overlay { position: fixed; inset: 0; display: grid; place-items: center; z-index: 1000; padding: 20px; background: #091e4280; }
    .confirm-dialog { width: min(100%, 390px); background: #fff; border-radius: 14px; padding: 24px; box-shadow: 0 12px 32px #091e4266; color: #172b4d; }
    .confirm-dialog h2 { margin: 0 0 9px; font-size: 21px; }
    .confirm-dialog p { margin: 0; color: #5e6c84; line-height: 1.45; }
    .confirm-actions { display: flex; justify-content: flex-end; gap: 10px; margin-top: 22px; }
    .confirm-actions button { min-height: 40px; border: 0; border-radius: 8px; padding: 0 14px; font: 700 14px Inter, Arial, sans-serif; cursor: pointer; }
    .confirm-cancel { background: #f1f2f4; color: #172b4d; }
    .confirm-accept { background: #c9372c; color: #fff; }
    .confirm-accept:hover { background: #ae2a19; }
  `;
  document.head.appendChild(style);

  window.confirmAction = (title, message, confirmLabel = "Confirm") =>
    new Promise((resolve) => {
      const overlay = document.createElement("div");
      overlay.className = "confirm-overlay";
      overlay.innerHTML = `<section class="confirm-dialog" role="dialog" aria-modal="true" aria-labelledby="confirm-title"><h2 id="confirm-title"></h2><p></p><div class="confirm-actions"><button class="confirm-cancel" type="button">Cancel</button><button class="confirm-accept" type="button"></button></div></section>`;
      overlay.querySelector("h2").textContent = title;
      overlay.querySelector("p").textContent = message;
      overlay.querySelector(".confirm-accept").textContent = confirmLabel;
      const finish = (accepted) => {
        overlay.remove();
        resolve(accepted);
      };
      overlay.querySelector(".confirm-cancel").onclick = () => finish(false);
      overlay.querySelector(".confirm-accept").onclick = () => finish(true);
      overlay.onclick = (event) => {
        if (event.target === overlay) finish(false);
      };
      document.body.appendChild(overlay);
      overlay.querySelector(".confirm-cancel").focus();
    });
})();
