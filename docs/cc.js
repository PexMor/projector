// Create a client instance
const mqtt_host = "localhost"; //location.hostname
const mqtt_port = 1884; //location.port
const clientId = "cc-" + Math.random().toString(16).substring(2, 8);
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
  client.subscribe("from-projector");
  message = new Paho.MQTT.Message(JSON.stringify({ message: "Hello" }));
  message.destinationName = "to-projector";
  client.send(message);
}

// called when the client loses its connection
function onConnectionLost(responseObject) {
  if (responseObject.errorCode !== 0) {
    console.log("onConnectionLost:" + responseObject.errorMessage);
  }
}

// called when a message arrives
function onMessageArrived(message) {
  console.log("onMessageArrived:" + message.payloadString);
}

const elInput = document.getElementById("input");

function send() {
  message = new Paho.MQTT.Message(JSON.stringify({ txt: elInput.value }));
  message.destinationName = "to-projector";
  client.send(message);
  return false;
}
