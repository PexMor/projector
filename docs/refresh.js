// =========================================================
let client;
const reconnectInMillis = 2 * 1000;
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
    let timeoutHandle = null;

    const onConnectLocal = () => {
        connectionCount++;
        client.subscribe(subscribe_own_topic);
        if (onConnect) {
            onConnect();
        } else {
            console.log("onConnect");
        }
    };
    const onConnectionLost = (reconnect) => (responseObject) => {
        console.log("onConnectionLost:", reconnect, responseObject);
        if (responseObject.errorCode !== 0) {
            disconnectCount++;
            if (onDisconnect) {
                onDisconnect();
            } else {
                console.log("onDisconnect");
            }
            timeoutHandle = setTimeout(reconnect, reconnectInMillis);
        }
    };
    const onMessageArrived = (message) => {
        messageCount++;
        try {
            const payload = JSON.parse(message.payloadString);
            if (onMessage) {
                onMessage(message.destinationName, payload);
            } else {
                console.log(
                    "onMessageArrived:",
                    message.payloadString,
                    message.destinationName
                );
            }
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
            client.subscribe(topic);
        },
        unsubscribe: (topic) => {
            client.unsubscribe(topic);
        },
        disconnect: () => {
            if (client && client.isConnected()) {
                client.disconnect();
            }
            if (timeoutHandle) {
                clearTimeout(timeoutHandle);
                timeoutHandle = null;
            }
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
    };
    const connect = () => {
        client = new Paho.MQTT.Client(host, Number(port), clientId);
        client.onConnectionLost = onConnectionLost(connect);
        client.onMessageArrived = onMessageArrived;
        client.connect({ useSSL, onSuccess: onConnectLocal });
    };
    connect();
    return iface;
};
// =========================================================
// a global variable for the mqtt client
let mqttIface = null;
// a message sender function
const sendMsg = (topics, value) => {
    if (mqttIface !== null && mqttIface !== undefined) {
        if (topics.length === 0) {
            console.error("No topics defined");
            return;
        }
        for (const topic of topics) {
            mqttIface.send(topic, JSON.stringify({ val: value }));
        }
    } else {
        console.error("mqttIface not defined");
    }
};
// a message receiver function
const onMessage = (topic, message) => {
    const elMqtt = document.getElementById("mqtt-box");
    console.log("onMessage:", topic, message);
    elMqtt.innerHTML = "";
    try {
        const msg = JSON.parse(message);
        let pre = document.createElement("pre");
        pre.innerText = json.stringify(msg, null, 2);
        elMqtt.appendChild(pre);
    } catch (e) {
        let pre = document.createElement("pre");
        pre.innerText = JSON.stringify(message, null, 2);
        elMqtt.appendChild(pre);
    };
};
// a function to handle the connection
const onConnect = () => {
    const elMqtt = document.getElementById("mqtt-box");
    elMqtt.innerHTML = "";
    let pre = document.createElement("pre");
    pre.innerText = "Connected to MQTT broker";
    elMqtt.appendChild(pre);
};
// a function to handle the disconnection
const onDisconnect = () => {
    const elMqtt = document.getElementById("mqtt-box");
    elMqtt.innerHTML = "";
    let pre = document.createElement("pre");
    pre.innerText = "Disconnected from MQTT broker";
    elMqtt.appendChild(pre);
};
// ========================================================
// a function to poll the server url
let pollHandle = null;
const pollServer = () => {
    const pollUrl = '/ping';
    const pollInterval = 5 * 1000;
    pollHandle = setInterval(() => {
        fetch(pollUrl)
            .then(response => response.json())
            .then(msg => {
                const elMqtt = document.getElementById("poll-box");
                elMqtt.innerHTML = "";
                let pre = document.createElement("pre");
                pre.innerText = "Disconnected from MQTT broker";
                elMqtt.appendChild(pre);
            })
            .catch(error => {
                const elMqtt = document.getElementById("poll-box");
                elMqtt.innerHTML = "";
                let pre = document.createElement("pre");
                pre.innerText = `Error: ${error}`;
                elMqtt.appendChild(pre);
            });
    }, pollInterval);
};
// ========================================================
// a function to handle the load event
const onLoad = () => {
    const mqtt = {
        host: "broker.emqx.io",
        port: 8084,
        useSSL: true,
        clientId: "pinger" + Math.random().toString(16).substring(2, 8),
        topics: ["/pexmor/pinger"],
        own_topic: "pexmor/unique-id/like/42"
    };
    const butStartMqtt = document.getElementById("start-mqtt");
    const butStopMqtt = document.getElementById("stop-mqtt");
    const butStartPoll = document.getElementById("start-poll");
    const butStopPoll = document.getElementById("stop-poll");
    const butSendMqtt = document.getElementById("send-mqtt");
    butStartMqtt.addEventListener("click", () => {
        butStartMqtt.style.display = "none";
        butStopMqtt.style.display = "inline-block";
        console.log(`mqtt(${mqtt.clientId}): ${mqtt.host}:${mqtt.port} TLS:${mqtt.useSSL} topics: ${mqtt.topics}`);
        mqttIface = msgSrvMqtt(
            mqtt.host,
            mqtt.port,
            mqtt.useSSL,
            mqtt.clientId,
            mqtt.own_topic,
            onMessage,
            onConnect,
            onDisconnect
        );
    });
    butStopMqtt.addEventListener("click", () => {
        butStartMqtt.style.display = "inline-block";
        butStopMqtt.style.display = "none";
        if (mqttIface !== null) {
            mqttIface.disconnect();
            mqttIface = null;
        }
    });
    butStartPoll.addEventListener("click", () => {
        butStartPoll.style.display = "none";
        butStopPoll.style.display = "inline-block";
        pollServer();
    });
    butStopPoll.addEventListener("click", () => {
        butStartPoll.style.display = "inline-block";
        butStopPoll.style.display = "none";
        if (pollHandle !== null) {
            clearInterval(pollHandle);
            pollHandle = null;
        }
    });
    butSendMqtt.addEventListener("click", () => {
        sendMsg([mqtt.own_topic], "Ping @ " + new Date().toISOString());
    });
};
window.addEventListener("load", onLoad);
