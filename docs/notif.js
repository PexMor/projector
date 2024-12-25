let clickSet = false;
let timeoutHandle = null;
export const showNotification = (msg, color) => {
  const elNotif = document.getElementById("notif");
  if (!clickSet) {
    elNotif.addEventListener("click", () => {
      clearTimeout(timeoutHandle);
      elNotif.style.display = "none";
    });
    clickSet = true;
  }
  elNotif.innerHTML = msg;
  elNotif.style.backgroundColor = color;
  elNotif.style.display = "block";
  timeoutHandle = setTimeout(() => {
    elNotif.style.display = "none";
  }, 5000);
};
