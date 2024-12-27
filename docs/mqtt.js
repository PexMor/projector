import { config } from "./config.js";
import { showNotification } from "./notif.js";

let client;
export const mqtt_app_prefix = "pexmor/projector";
export const mqtt_app_prefix_group = `${mqtt_app_prefix}/group-topics`;
export const mqtt_app_prefix_by_uuid = `${mqtt_app_prefix}/by-uuid`;

export const msgSrvMqtt = (
  host,
  port,
  useSSL,
  clientId,
  subscribe_own_topic,
  onMessage,
  onConnect,
  onDisconnect
) => {
  let connectionCount = 0;
  let disconnectCount = 0;
  let messageCount = 0;

  const onConnectLocal = () => {
    connectionCount++;
    // console.log("onConnect");
    // console.log("Subscribe own topic:", subscribe_own_topic);
    client.subscribe(subscribe_own_topic);
    onConnect();
  };
  const onConnectionLost = (reconnect) => (responseObject) => {
    if (responseObject.errorCode !== 0) {
      disconnectCount++;
      console.log("onConnectionLost:" + responseObject.errorMessage);
      onDisconnect();
      setTimeout(reconnect, 2000);
    }
  };
  const onMessageArrived = (message) => {
    messageCount++;
    console.log(
      "onMessageArrived:",
      message.payloadString,
      message.destinationName
    );
    try {
      const payload = JSON.parse(message.payloadString);
      onMessage(message.destinationName, payload);
    } catch (error) {
      console.error(error);
    }
  };
  const iface = {
    getConnectionCount: () => connectionCount,
    getDisconnectCount: () => disconnectCount,
    getMessageCount: () => messageCount,
    getState: () => {
      if (client) {
        return client.isConnected();
      }
      return false;
    },
    subscribe: (topic) => {
      console.log("subscribe:", topic);
      client.subscribe(topic);
    },
    unsubscribe: (topic) => {
      console.log("unsubscribe:", topic);
      client.unsubscribe(topic);
    },
    disconnect: () => {
      client.disconnect();
    },
    send: (dest, value) => {
      let message = new Paho.MQTT.Message(value);
      message.destinationName = dest;
      if (client && client.isConnected()) {
        client.send(message);
      } else {
        console.error("Client not connected");
      }
      return false;
    },
    confRemoteProjector: (remoteUUID) => {
      console.log("confRemoteProjector:", remoteUUID);
      const remoteOwnTopic = `${mqtt_app_prefix}/by-uuid/${remoteUUID}`;
      const remoteSecCode = "1234"; // Math.random().toString(16).substring(2, 8);
      let message = new Paho.MQTT.Message(
        JSON.stringify({
          op: "pair-reponse",
          rc_uuid: config.getUUID(),
          secCode: remoteSecCode,
        })
      );
      message.destinationName = remoteOwnTopic;
      if (client && client.isConnected()) {
        console.log(
          "Sending message to:",
          remoteOwnTopic,
          message.payloadString
        );
        client.send(message);
      } else {
        console.error("Client not connected");
        showNotification("MQTT not connected", "#fee");
      }
      config.setTopics([config.getUUID()]);
      // might not be needed, the other party should subscribe to the group topic
      // const groupTopic = `${mqtt_app_prefix_group}/${config.getUUID()}`;
      // client.subscribe(groupTopic);
    },
  };
  // client is a module level variable
  const connect = () => {
    client = new Paho.MQTT.Client(host, Number(port), clientId);
    // set callback handlers and provide reconnect function
    client.onConnectionLost = onConnectionLost(connect);
    client.onMessageArrived = onMessageArrived;
    client.connect({ useSSL, onSuccess: onConnectLocal });
  };
  connect();
  return iface;
};
