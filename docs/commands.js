import { timeStrToMs } from "./utils.js";

let timeoutHandles = {};
let sendMsg = undefined;
export const setSendMsg = (fn) => {
  sendMsg = fn;
};

const butCommands = [
  { showVideo: { label: "Show Video #1", meta: { id: "id1" } } },
  { showVideo: { label: "Show Video #2", meta: { id: "id2" } } },
  { showLogo: { label: "Show Logo #1", meta: { id: "id1", timeout: "5s" } } },
  { showLogo: { label: "Show Logo #2", meta: { id: "id2", timeout: "5s" } } },
  { showLogo: { label: "Show Logo #3", meta: { id: "id3", timeout: "5s" } } },
  { showLogo: { label: "Show Logo #3", meta: { id: "id3" } } },
  { showTable: { label: "Show Table", meta: { id: "id1", timeout: "5s" } } },
  { showTable: { label: "Show Table", meta: { id: "id1" } } },
  { showGrid: { label: "Show Grid" } },
  { hideLogo: { label: "Hide Logo" } },
  { hideTable: { label: "Hide Table" } },
  { hideVideo: { label: "Hide Video" } },
  { hideGrid: { label: "Hide Grid" } },
];
export const cmdToColor = {
  showVideo: "#fcc",
  showLogo: "#cfc",
  showTable: "#ccf",
  showGrid: "#ffc",
  hideLogo: "#fcf",
  hideTable: "#cff",
  hideVideo: "#ffc",
  hideGrid: "#cff",
};
const commands = Object.keys(butCommands);
let cmdState = 0;

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

export const showCC = () => {
  const elStatus = document.getElementById("status");
  elStatus.setAttribute("class", "paired");
  const elMain = document.getElementById("main");
  elMain.innerHTML = "";
  const elContainer = document.createElement("div");
  elContainer.setAttribute("id", "container");
  butCommands.forEach((command) => {
    const elButton = document.createElement("button");
    elButton.setAttribute("class", "btn");
    elButton.style.backgroundColor =
      cmdToColor[Object.keys(command)[0]] || "#fff";
    let cmdId = Object.keys(command)[0];
    let cmdVal = command[cmdId];
    if (
      typeof cmdVal.meta !== "undefined" &&
      typeof cmdVal.meta.timeout !== "undefined"
    ) {
      elButton.innerHTML = `${cmdVal.label} (timeout=${cmdVal.meta.timeout})`;
    } else {
      elButton.innerHTML = cmdVal.label;
    }
    elButton.addEventListener("click", () => {
      if (sendMsg !== undefined) {
        sendMsg({ op: cmdId, meta: { ...cmdVal.meta } });
      } else {
        console.error("sendMsg not defined");
      }
    });
    elContainer.appendChild(elButton);
    elContainer.appendChild(document.createElement("br"));
  });
  elMain.appendChild(elContainer);
};

export const execCommand = (cmd) => {
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
        const idPosition = "showLogo";
        if (cmd.meta.timeout) {
          if (
            timeoutHandles !== undefined &&
            timeoutHandles[idPosition] !== undefined
          ) {
            // clear previous timeout
            clearTimeout(timeoutHandles[idPosition]);
            // remove reference
            timeoutHandles[idPosition] = undefined;
          }
          timeoutHandles[idPosition] = setTimeout(() => {
            elLogo.innerHTML = "";
            timeoutHandles[idPosition] = undefined;
            console.log("timeout cleared");
          }, timeStrToMs(cmd.meta.timeout));
        }
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
        if (cmd.meta.timeout) {
          setTimeout(() => {
            elMain.innerHTML = "";
          }, timeStrToMs(cmd.meta.timeout));
        }
      } else {
        console.error("Unknown logo meta:", cmd.meta);
      }
    } else {
      console.error("Unknown logo meta:", cmd.meta);
    }
  } else if (cmd.op && cmd.op === "showGrid") {
    const elMain = document.getElementById("main");
    elMain.innerHTML = "";
    const elProGrid = document.createElement("div");
    elProGrid.setAttribute("id", "pro-grid");
    for (let row = 0; row < 5; row++) {
      for (let col = 0; col < 3; col++) {
        const elCell = document.createElement("div");
        elCell.setAttribute("class", "cell");
        elCell.innerHTML = `${row},${col}`;
        elProGrid.appendChild(elCell);
      }
    }
    // elProGrid.innerHTML = "Grid goes here";
    elMain.appendChild(elProGrid);
  } else if (cmd.op && cmd.op === "hideLogo") {
    const elLogo = document.getElementById("pro-logo");
    elLogo.innerHTML = "";
  } else if (cmd.op && (cmd.op === "hideTable" || cmd.op === "hideGrid")) {
    const elMain = document.getElementById("main");
    elMain.innerHTML = "";
  } else if (cmd.op && cmd.op === "hideVideo") {
    const elVid = document.getElementById("pro-vid");
    elVid.innerHTML = "";
  } else {
    console.log("Unknown command:", cmd);
  }
};
