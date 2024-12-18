const msgSrvMqtt = (
  host,
  port,
  clientId,
  subscribe_topic,
  onMessage,
  onConnect
) => {
  // Create a client instance
  // const mqtt_host = "localhost"; //location.hostname
  // const mqtt_port = 1884; //location.port
  // const clientId = "projector" + Math.random().toString(16).substring(2, 8);
  client = new Paho.MQTT.Client(host, Number(port), clientId);

  // set callback handlers
  client.onConnectionLost = onConnectionLost;
  client.onMessageArrived = onMessageArrived;

  // connect the client
  client.connect({ onSuccess: onConnectLocal });

  // called when the client connects
  function onConnectLocal() {
    // Once a connection has been made, make a subscription and send a message.
    console.log("onConnect");
    client.subscribe(subscribe_topic);
    // message = new Paho.MQTT.Message(JSON.stringify({ message: "Hello" }));
    // message.destinationName = "from-projector";
    // client.send(message);
    onConnect();
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
    try {
      const payload = JSON.parse(message.payloadString);
      onMessage(payload);
    } catch (error) {
      console.error(error);
    }
  }
  function send(dest, value) {
    message = new Paho.MQTT.Message(JSON.stringify({ txt: value }));
    message.destinationName = dest;
    client.send(message);
    return false;
  }
  return send;
};
