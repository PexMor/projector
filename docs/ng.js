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
    showQr();
    const topics = config.getTopics();
    topics.forEach((topic, ii) => {
      console.log(`topic#${ii}: ${topic}`);
    });
  } else {
    const hash = window.location.hash;
    const remoteUuid = hash.substring(6);
    config.setTopics([remoteUuid]);
    mqttIface.confRemoteProjector(remoteUuid);
    console.log("remoteUuid:", remoteUuid);
    showCC();
    // sendMsg({ op: "connected" });
  }
};

const onDisconnect = () => {
  const elStatus = document.getElementById("status");
  elStatus.setAttribute("class", "disconnected");
  let elMain = document.getElementById("main");
  elMain.innerHTML = "Disconnected from MQTT server";
};

const checkHash = () => {
  const hash = window.location.hash;
  if (hash.startsWith("#pair=")) {
    config.setMode("rc");
  } else if (hash.startsWith("#reset")) {
    config.clearConfig();
    window.location.hash = "";
  } else {
    config.setMode("projector");
  }
};

const onLoad = () => {
  showInit();
  checkHash();
  const mqtt = config.getMqtt();
  mqttIface = msgSrvMqtt(
    mqtt.host,
    mqtt.port,
    "projector" + Math.random().toString(16).substring(2, 8),
    config.getOwnTopic(),
    onMessage,
    onConnect,
    onDisconnect
  );
};

window.addEventListener("hashchange", checkHash);
window.addEventListener("load", onLoad);
