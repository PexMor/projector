import QrCode from "https://danielgjackson.github.io/qrcodejs/qrcode.mjs";

let mode = "projector";
const zero_uuid = "00000000-0000-0000-0000-000000000000";
let ls_uuid = "no-storage";
let talkTo = zero_uuid;
let client;
const butCommands = [
  { showVideo: { label: "Show Video #1", meta: { id: "id1" } } },
  { showVideo: { label: "Show Video #2", meta: { id: "id2" } } },
  { showLogo: { label: "Show Logo #1", meta: { id: "id1" } } },
  { showLogo: { label: "Show Logo #2", meta: { id: "id2" } } },
  { showLogo: { label: "Show Logo #3", meta: { id: "id3" } } },
  { showTable: { label: "Show Table", meta: { id: "id1" } } },
];
const commands = Object.keys(butCommands);
let cmdState = 0;

function uuidv4() {
  return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, (c) =>
    (
      c ^
      (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))
    ).toString(16)
  );
}

const refreshStorage = () => {
  let x_ls_uuid = window.localStorage.getItem("uuid");
  console.log(x_ls_uuid);
  if (typeof x_ls_uuid === "undefined" || x_ls_uuid === null) {
    ls_uuid = uuidv4();
    window.localStorage.setItem("uuid", ls_uuid);
  } else {
    ls_uuid = x_ls_uuid;
  }
};
refreshStorage();

const getUUID = function () {
  return ls_uuid;
};
window.getMyUUID = getUUID;

const getTopic = (theUUID) => {
  if (theUUID === undefined) {
    theUUID = getUUID();
  }
  return "projector-world/" + theUUID;
};

const makeQRSVG = (data) => {
  const matrix = QrCode.generate(data);
  const svg = QrCode.render("svg", matrix);
  let svgLines = svg.split(/\r?\n/);
  // remove comment line from generated svg, ugly hack
  svgLines = svgLines.slice(1);
  const svgPatched = svgLines.join("\n");
  return svgPatched;
};
window.makeQRSVG = makeQRSVG;
const msgSrvMqtt = (
  host,
  port,
  clientId,
  subscribe_topic,
  onMessage,
  onConnect
) => {
  client = new Paho.MQTT.Client(host, Number(port), clientId);
  client.onConnectionLost = onConnectionLost;
  client.onMessageArrived = onMessageArrived;
  client.connect({ useSSL: true, onSuccess: onConnectLocal });
  function onConnectLocal() {
    console.log("onConnect");
    console.log("Subscribe topic:", subscribe_topic);
    client.subscribe(subscribe_topic);
    onConnect();
  }
  function onConnectionLost(responseObject) {
    if (responseObject.errorCode !== 0) {
      console.log("onConnectionLost:" + responseObject.errorMessage);
    }
  }
  function onMessageArrived(message) {
    console.log("onMessageArrived:" + message.payloadString);
    try {
      const payload = JSON.parse(message.payloadString);
      onMessage(payload);
    } catch (error) {
      console.error(error);
    }
  }
  function send(dest, value) {
    message = new Paho.MQTT.Message(value);
    message.destinationName = dest;
    client.send(message);
    return false;
  }
  return send;
};

const showQr = () => {
  const url = new URL(window.location.href);
  let op = "#pair=" + getMyUUID();
  console.log(op);
  url.hash = op;
  const qr = makeQRSVG(url.href);
  const elMain = document.getElementById("main");
  elMain.innerHTML = "";
  const elContainer = document.createElement("div");
  elContainer.setAttribute("id", "container");
  const qrEl = document.createElement("div");
  qrEl.setAttribute("id", "qr");
  qrEl.innerHTML = qr;
  elContainer.appendChild(qrEl);
  const urlEl = document.createElement("div");
  urlEl.setAttribute("id", "url");
  urlEl.innerHTML = url.href;
  elContainer.appendChild(urlEl);
  elMain.appendChild(elContainer);
};

const sendMsg = (value) => {
  client.send(getTopic(talkTo), JSON.stringify({ val: value }));
};

const video = {
  id1: `<video autoplay muted loop id="background-video">
        <source src="https://assets.mixkit.co/videos/677/677-720.mp4" type="video/mp4">Your browser does not support the video tag.</video>`,
  id2: `<video autoplay muted loop id="background-video">
    <source src="https://assets.mixkit.co/videos/4643/4643-720.mp4" type="video/mp4">Your browser does not support the video tag.</video>`,
};
const logo = {
  id1: `<img src="imgs/airline-passenger-care-svgrepo-com.svg" class="logo"/>`,
  id2: `<img src="imgs/dancer-svgrepo-com.svg" class="logo"/>`,
  id3: `<img src="imgs/winner-cup-illustration-svgrepo-com.svg" class="logo"/>`,
};
const table = {
  id1: `<table>
    <tr>
        <th>Firstname</th>
        <th>Lastname</th>
        <th>Age</th>
    </tr>
    <tr>
        <td>Jill</td>
        <td>Smith</td>
        <td>50</td>
    </tr>
    </table>`,
};

const showCC = () => {
  const elStatus = document.getElementById("status");
  elStatus.setAttribute("class", "paired");
  const elMain = document.getElementById("main");
  elMain.innerHTML = "";
  const elContainer = document.createElement("div");
  elContainer.setAttribute("id", "container");
  const elInput = document.createElement("input");
  elInput.setAttribute("id", "input");
  elInput.setAttribute("type", "text");
  elInput.setAttribute("placeholder", "Enter your message here");
  elContainer.appendChild(elInput);
  const elButton = document.createElement("button");
  elButton.setAttribute("id", "send");
  elButton.innerHTML = "Send";
  elButton.addEventListener("click", () => {
    const value = document.getElementById("input").value;
    sendMsg(value);
  });
  elContainer.appendChild(elButton);
  elContainer.appendChild(document.createElement("br"));
  butCommands.forEach((command) => {
    const elButton = document.createElement("button");
    let cmdId = Object.keys(command)[0];
    let cmdVal = command[cmdId];
    elButton.innerHTML = cmdVal.label;
    elButton.addEventListener("click", () => {
      sendMsg({ op: cmdId, meta: { ...cmdVal.meta } });
    });
    elContainer.appendChild(elButton);
    elContainer.appendChild(document.createElement("br"));
  });
  elMain.appendChild(elContainer);
};

const execCommand = (cmd) => {
  console.log("cmd:", cmd);
  if (cmd.op && cmd.op === "showVideo") {
    const elVid = document.getElementById("pro-vid");
    console.log("cmd.meta:", cmd.meta, cmd.meta.id, Object.keys(video));
    if (typeof cmd.meta !== "undefined" && typeof cmd.meta.id !== "undefined") {
      console.log(
        "cmd.meta.id:",
        cmd.meta.id,
        cmd.meta.id in Object.keys(video)
      );
      if (Object.keys(video).includes(cmd.meta.id)) {
        elVid.innerHTML = video[cmd.meta.id];
      } else {
        console.error("Unknown video meta:", cmd.meta);
      }
    } else {
      console.error("Unknown video meta:", cmd.meta);
    }
  } else if (cmd.op && cmd.op === "showLogo") {
    const elLogo = document.getElementById("pro-logo");
    console.log("cmd.meta:", cmd.meta, cmd.meta.id, Object.keys(logo));
    if (typeof cmd.meta !== "undefined" && typeof cmd.meta.id !== "undefined") {
      console.log(
        "cmd.meta.id:",
        cmd.meta.id,
        cmd.meta.id in Object.keys(logo)
      );
      if (Object.keys(logo).includes(cmd.meta.id)) {
        elLogo.innerHTML = logo[cmd.meta.id];
      } else {
        console.error("Unknown logo meta:", cmd.meta);
      }
    } else {
      console.error("Unknown logo meta:", cmd.meta);
    }
  } else if (cmd.op && cmd.op === "showTable") {
    if (typeof cmd.meta !== "undefined" && typeof cmd.meta.id !== "undefined") {
      if (Object.keys(table).includes(cmd.meta.id)) {
        const elMain = document.getElementById("main");
        elMain.innerHTML = "";
        const elContainer = document.createElement("div");
        elContainer.setAttribute("id", "container");
        const elProTable = document.createElement("div");
        elProTable.setAttribute("id", "pro-table");
        elProTable.innerHTML = table[cmd.meta.id];
        elContainer.appendChild(elProTable);
        elMain.appendChild(elContainer);
      } else {
        console.error("Unknown logo meta:", cmd.meta);
      }
    } else {
      console.error("Unknown logo meta:", cmd.meta);
    }
  } else {
    console.log("Unknown command:", cmd);
  }
};

const onMessage = (msg) => {
  console.log(msg);
  if (mode === "projector") {
    // document.getElementById("msgs").innerHTML = JSON.stringify(msg);
    const elStatus = document.getElementById("status");
    elStatus.setAttribute("class", "paired");
    let elMain = document.getElementById("main");
    if (cmdState === 0) {
      elMain.innerHTML = "Connected, waiting for commands";
      cmdState = 1;
    } else if (cmdState === 1) {
      elMain.innerHTML = "";
      cmdState = 2;
    }
    execCommand(msg.val);
  } else {
    console.log("msg:", msg);
  }
};

const onConnect = () => {
  const elStatus = document.getElementById("status");
  elStatus.setAttribute("class", "connected");
  let elMain = document.getElementById("main");
  elMain.innerHTML = "Waiting for MQTT server connection";
  if (mode === "projector") {
    showQr();
  } else {
    showCC();
    sendMsg({ op: "connected" });
  }
};

const checkHash = () => {
  const hash = window.location.hash;
  if (hash.startsWith("#pair=")) {
    mode = "cc";
    talkTo = hash.substring(6);
    console.log("talkTo:", talkTo);
  }
  console.log(mode);
};

window.addEventListener("hashchange", checkHash);
window.addEventListener("load", () => {
  checkHash();
  msgSrvMqtt(
    "broker.emqx.io",
    8084,
    "projector" + Math.random().toString(16).substring(2, 8),
    getTopic(),
    onMessage,
    onConnect
  );
});
