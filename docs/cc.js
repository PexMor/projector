// Create a client instance
const mqtt_host = "localhost"; //location.hostname
const mqtt_port = 1884; //location.port
const clientId = "cc" + Math.random().toString(16).substring(2, 8);

const elMsgs = document.getElementById("msgs");

const onMessage = (payload) => {
  if (payload.txt) {
    elMsgs.innerHTML += `${payload.txt}<br/>`;
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
//   onMessage
// );
// window.sendInner = sendInner;

window.send = () => {
  const value = document.getElementById("input").value;
  sendInner("from-projector", value);
  return false;
};
