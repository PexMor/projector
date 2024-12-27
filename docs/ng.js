import { config } from "./config.js";
import {
  msgSrvMqtt,
  mqtt_app_prefix_by_uuid,
  mqtt_app_prefix_group,
} from "./mqtt.js";
import { showQr, showInit } from "./qr.js";
import { showCC, setSendMsg, execCommand } from "./commands.js";
import { showNotification } from "./notif.js";

let mqttIface = null;
let cmdState = 0;

const mySendMsg = (value) => {
  if (mqttIface !== null && mqttIface !== undefined) {
    const topics = config.getTopics();
    for (const topic of topics) {
      console.log("sendMsg:", topic, value);
      mqttIface.send(topic, JSON.stringify({ val: value }));
    }
  } else {
    console.error("mqttIface not defined");
  }
};
setSendMsg(mySendMsg);

const onMessage = (topic, msg) => {
  // check from where did the message arrived
  console.log(topic, msg);
  if (topic.startsWith(mqtt_app_prefix_by_uuid)) {
    // we accept the config message here only
    // {"op":"pair-reponse","rc_uuid":"e4bacf88-8e96-4d5a-ae15-b958d51686b3","secCode":"1234"}
    if (config.getMode() === "projector") {
      if (
        config.getMode() === "projector" &&
        msg !== undefined &&
        msg.op &&
        msg.op === "pair-reponse" &&
        msg.secCode !== undefined &&
        msg.rc_uuid !== undefined
      ) {
        if (config.getSecCode() !== msg.secCode) {
          showNotification("Invalid pairing response", "#fee");
          return;
        }
        showNotification("Valid pairing response", "#efe");
        const allTopics = config.addKnownUUID(msg.rc_uuid);
        console.log("allTopics:", allTopics);
        config.setTopics(allTopics);
        const elMain = document.getElementById("main");
        elMain.innerHTML = "...commands...";
        cmdState = 0;
        const elStatus = document.getElementById("status");
        elStatus.setAttribute("class", "paired");
        // Subscribe to the remote projector
        mqttIface.subscribe(`${mqtt_app_prefix_group}/${msg.rc_uuid}`);
      } else {
        showNotification("Invalid message received", "#fee");
      }
    } else {
      console.error("Invalid mode");
    }
  } else if (topic.startsWith(mqtt_app_prefix_group)) {
    if (config.getMode() === "projector") {
      if (cmdState === 0) {
        cmdState = 1;
        const elMain = document.getElementById("main");
        elMain.innerHTML = "";
      }
      execCommand(msg.val);
    } else {
      console.error("Invalid mode");
    }
  } else {
    console.error("Unknown topic prefix:", topic);
  }
};

const onConnect = () => {
  const elStatus = document.getElementById("status");
  elStatus.setAttribute("class", "connected");
  if (config.getMode() === "projector") {
    const topics = config.getTopics();
    topics.forEach((topic, ii) => {
      console.log(`topic#${ii}: ${topic}`);
    });
    if (topics.length === 0) {
      showQr();
    } else {
      for (let ii = 0; ii < topics.length; ii++) {
        mqttIface.subscribe(topics[ii]);
      }
      let elMain = document.getElementById("main");
      elMain.innerHTML = "...commands...";
      console.log("We know the topics already");
    }
  } else {
    const hash = window.location.hash;
    let remoteUuid = "";
    if (hash.startsWith("#pair://")) {
      let alaUrl = hash.substring(1);
      let url = new URL(alaUrl);
      const mqtt = config.getMqtt();
      // ssl is forced
      console.log(mqtt, url.hostname, url.port);
      if (url.hostname == mqtt.host && url.port == mqtt.port && mqtt.useSSL) {
        console.log("We have correct mqtt settings");
      } else {
        // reconfigure mqtt
        config.setMqtt(url.hostname, parseInt(url.port), true);
        console.log("Reconfiguring mqtt:", url.hostname, url.port, "SSL");
        window.location.reload();
        return;
      }
      remoteUuid = url.pathname.substring(1);
      config.setTopics([remoteUuid]);
    } else if (hash.startsWith("#pair=")) {
      remoteUuid = hash.substring(6);
    }
    config.setTopics([remoteUuid]);
    mqttIface.confRemoteProjector(remoteUuid);
    console.log("remoteUuid:", remoteUuid);
    showCC();
  }
};

const onDisconnect = () => {
  const elStatus = document.getElementById("status");
  elStatus.setAttribute("class", "disconnected");
  let elMain = document.getElementById("main");
  elMain.innerHTML = "Disconnected from MQTT server";
};

let lastHash = window.location.hash;

const checkHash = (win, e) => {
  if (e) e.preventDefault();
  const hash = window.location.hash;
  if (hash.startsWith("#pair=")) {
    config.setMode("rc");
    if (lastHash !== hash) {
      lastHash = hash;
      window.location.reload();
    }
  } else if (hash.startsWith("#pair://")) {
    config.setMode("rc");
    if (lastHash !== hash) {
      lastHash = hash;
      window.location.reload();
    }
  } else if (hash.startsWith("#reset")) {
    config.clearConfig();
    window.location.hash = "";
    window.location.reload();
  } else if (hash.startsWith("#mqttCfgUrl=")) {
    // ie. #mqttCfgUrl=config.json
    const url = new URL(hash.substring(12), window.location.href).href;
    console.log("#mqttCfgUrl:", url);
    fetch(url)
      .then((response) => response.json())
      .then((data) => {
        console.log("config.json:", data);
        config.setMqttAll(
          data.host,
          data.port,
          data.useSSL,
          data.user,
          data.pass
        );
      })
      .catch(console.error)
      .finally(() => {
        window.location.hash = "";
        window.location.reload();
      });
  } else {
    config.setMode("projector");
    if (lastHash !== hash) {
      lastHash = hash;
      window.location.reload();
    }
  }
};

const showDebug = () => {
  if (elDebug.style.display === "none" || elDebug.style.display === "") {
    elDebug.style.display = "block";
  } else {
    elDebug.style.display = "none";
  }
  elDebug.innerHTML = "";
  // items to show:
  // uuid
  // mqtt.host mqtt.port mqtt.useSSL
  // connection state
  // mode
  // connect count
  // disconnect count
  // message count
  // screens ~ localStorage.keys()
  // localStorage.clear()
  // reload()
  // reset()
  let elDiv = document.createElement("div");
  elDiv.innerHTML = "uuid: " + config.getUUID();
  elDebug.appendChild(elDiv);
  elDiv = document.createElement("div");
  const mqtt = config.getMqtt();
  elDiv.innerHTML = `mqtt: ${mqtt.host}:${mqtt.port} ${
    mqtt.useSSL ? "SSL" : "noSSL"
  }`;
  elDebug.appendChild(elDiv);
  // alternative mqttCfgUrl
  let elInput = document.createElement("input");
  elInput.setAttribute("id", "mqttCfgUrl");
  elInput.setAttribute("type", "text");
  elInput.setAttribute("size", "40");
  elInput.setAttribute("style", "field-sizing: content;");
  elInput.setAttribute(
    "placeholder",
    "mqttCfgUrl like config.json or http://srv.lan/mqtt.json"
  );
  elDebug.appendChild(elInput);
  let elButton = document.createElement("button");
  elButton.innerHTML = "set mqttCfgUrl";
  elButton.addEventListener("click", () => {
    const url = document.getElementById("mqttCfgUrl").value;
    window.location.hash = `#mqttCfgUrl=${url}`;
    window.location.reload();
  });
  elDebug.appendChild(elButton);
  elDiv = document.createElement("div");
  elDiv.innerHTML = "mode: " + config.getMode();
  elDebug.appendChild(elDiv);
  if (mqttIface !== null && mqttIface !== undefined) {
    elDiv = document.createElement("div");
    elDiv.innerHTML = "connection state: " + mqttIface.getState();
    elDebug.appendChild(elDiv);
    elDiv = document.createElement("div");
    elDiv.innerHTML = "connect count: " + mqttIface.getConnectionCount();
    elDebug.appendChild(elDiv);
    elDiv = document.createElement("div");
    elDiv.innerHTML = "disconnect count: " + mqttIface.getDisconnectCount();
    elDebug.appendChild(elDiv);
    elDiv = document.createElement("div");
    elDiv.innerHTML = "message count: " + mqttIface.getMessageCount();
    elDebug.appendChild(elDiv);
  }
  elDiv = document.createElement("div");
  // get all keys starting with "config-"
  let cfgKeys = [];
  for (let ii = 0; ii < localStorage.length; ii++) {
    const key = localStorage.key(ii);
    if (key.startsWith("config-")) {
      const subkey = key.substring(7);
      cfgKeys.push(`<a href="#${subkey}">${key}</a>`);
    }
  }
  elDiv.innerHTML = "screens: " + cfgKeys.join(", ");
  elDebug.appendChild(elDiv);
  elButton = document.createElement("button");
  elButton.innerHTML = "localStorage.clear()";
  elButton.addEventListener("click", () => {
    localStorage.clear();
  });
  elDebug.appendChild(elButton);
  elButton = document.createElement("button");
  elButton.innerHTML = "reload()";
  elButton.addEventListener("click", () => {
    window.location.reload();
  });
  elDebug.appendChild(elButton);
  elButton = document.createElement("button");
  elButton.innerHTML = "reset()";
  elButton.addEventListener("click", () => {
    config.clearConfig();
    window.location.reload();
  });
  elDebug.appendChild(elButton);
  elDebug.appendChild(document.createElement("hr"));
  // input for screen name
  elDiv = document.createElement("input");
  elDiv.setAttribute("id", "screenName");
  elDiv.setAttribute("type", "text");
  elDiv.setAttribute("placeholder", "screen name");
  elDebug.appendChild(elDiv);
  // button for adding screen
  elButton = document.createElement("button");
  elButton.innerHTML = "add screen";
  elButton.addEventListener("click", () => {
    const screenName = document.getElementById("screenName").value;
    if (screenName !== "") {
      window.location.hash = `#${screenName}`;
      window.location.reload();
    }
  });
  elDebug.appendChild(elButton);
  elDebug.appendChild(document.createElement("hr"));
};

let elDebug = document.getElementById("debug");

const onLoad = () => {
  showInit();
  checkHash();
  elDebug = document.getElementById("debug");
  if (elDebug !== undefined && elDebug !== null) {
    elDebug.addEventListener("click", (e) => {
      e.stopPropagation();
    });
    elDebug.style.display = "none";
  } else {
    console.error("elDebug not found");
  }
  document.body.addEventListener("click", showDebug);
  const mqtt = config.getMqtt();
  mqttIface = msgSrvMqtt(
    mqtt.host,
    mqtt.port,
    mqtt.useSSL,
    "projector" + Math.random().toString(16).substring(2, 8),
    config.getOwnTopic(),
    onMessage,
    onConnect,
    onDisconnect
  );
};

window.addEventListener("hashchange", checkHash);
window.addEventListener("load", onLoad);
