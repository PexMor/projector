// Create a client instance
const mqtt_host = "localhost"; //location.hostname
const mqtt_port = 1884; //location.port
const clientId = "projector" + Math.random().toString(16).substring(2, 8);

const elCenter = document.getElementById("cont-center");
const elTR = document.getElementById("cont-tr");
const elTL = document.getElementById("cont-tl");
const elBT = document.getElementById("cont-bt");

const onMessage = (payload) => {
  if (payload.txt) {
    elCenter.innerHTML = payload.txt;
    elTR.innerHTML = payload.txt;
    elTL.innerHTML = payload.txt;
    elBT.innerHTML = payload.txt;
  } else {
    console.log("onMessage", payload);
  }
};

const sendInner = msgSrvPlain(mqtt_host, mqtt_port, onMessage, () => {
  console.log("Connected");
});
window.sendInner = sendInner;

// const sendInner = msgSrvMqtt(
//   mqtt_host,
//   mqtt_port,
//   clientId,
//   "to-projector",
//   onMessage,
//   () => {
//     console.log("Connected");
//   }
// );
// window.sendInner = sendInner;
