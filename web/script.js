// Create a client instance
const mqtt_host = "localhost"; //location.hostname
const mqtt_port = 1884; //location.port
const clientId = "projector" + Math.random().toString(16).substring(2, 8);
client = new Paho.MQTT.Client(mqtt_host, Number(mqtt_port), clientId);

// set callback handlers
client.onConnectionLost = onConnectionLost;
client.onMessageArrived = onMessageArrived;

// connect the client
client.connect({ onSuccess: onConnect });

// called when the client connects
function onConnect() {
  // Once a connection has been made, make a subscription and send a message.
  console.log("onConnect");
  client.subscribe("to-projector");
  message = new Paho.MQTT.Message(JSON.stringify({ message: "Hello" }));
  message.destinationName = "from-projector";
  client.send(message);
}

// called when the client loses its connection
function onConnectionLost(responseObject) {
  if (responseObject.errorCode !== 0) {
    console.log("onConnectionLost:" + responseObject.errorMessage);
  }
}

const elCenter = document.getElementById("cont-center");
const elTR = document.getElementById("cont-tr");
const elTL = document.getElementById("cont-tl");
const elBT = document.getElementById("cont-bt");
// called when a message arrives
function onMessageArrived(message) {
  console.log("onMessageArrived:" + message.payloadString);
  try {
    const payload = JSON.parse(message.payloadString);
    if (payload.txt) {
      elCenter.innerHTML = payload.txt;
      elTR.innerHTML = payload.txt;
      elTL.innerHTML = payload.txt;
      elBT.innerHTML = payload.txt;
    }
  } catch (error) {
    console.error(error);
  }
}
