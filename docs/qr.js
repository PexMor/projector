import QrCode from "https://danielgjackson.github.io/qrcodejs/qrcode.mjs";
import { config } from "./config.js";
import { showNotification } from "./notif.js";

export const makeQRSVG = (data) => {
  const matrix = QrCode.generate(data);
  const svg = QrCode.render("svg", matrix);
  let svgLines = svg.split(/\r?\n/);
  // remove comment line from generated svg, ugly hack
  svgLines = svgLines.slice(1);
  const svgPatched = svgLines.join("\n");
  console.log(svgPatched);
  return svgPatched;
};
window.makeQRSVG = makeQRSVG;

const copyToClipboard = (event) => {
  const el = event.target;
  const text = el.innerHTML;
  navigator.clipboard.writeText(text);
  showNotification("URL copied to clipboard", "#efe");
};

export const showQr = () => {
  const url = new URL(window.location.href);
  let op = "#pair=" + config.getUUID();
  console.log("showQr:op=" + op);
  url.hash = op;
  let qr = makeQRSVG(url.href);
  const elMain = document.getElementById("main");
  elMain.innerHTML = "";

  const elContainer = document.createElement("div");
  elContainer.setAttribute("id", "container");

  const elContainerSub = document.createElement("div");
  elContainerSub.setAttribute("id", "containerSub");

  // inner divs for qr and url
  const qrEl = document.createElement("div");
  qrEl.setAttribute("id", "qr");
  qrEl.innerHTML = qr;
  elContainerSub.appendChild(qrEl);
  const urlEl = document.createElement("div");
  urlEl.setAttribute("id", "url");
  urlEl.innerHTML = url.href;
  urlEl.addEventListener("click", copyToClipboard);
  elContainerSub.appendChild(urlEl);
  // -- end inner divs

  elContainer.appendChild(elContainerSub);

  elMain.appendChild(elContainer);
};

export const showInit = () => {
  const elMain = document.getElementById("main");
  elMain.innerHTML = "";
  const elContainer = document.createElement("div");
  elContainer.setAttribute("id", "container");
  elContainer.innerHTML =
    "Waiting for MQTT server connection<br/>Consider setting mqttCfgUrl in URL like <b>#mqttCfgUrl=config.json</b>";
  elMain.appendChild(elContainer);
};
