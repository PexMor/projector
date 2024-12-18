const msgSrvPlain = (host, port, onMessage, onConnect) => {
  let socket = null;
  let serverUrl = `ws://${host}:${port}/chat`;
  if (window.MozWebSocket) {
    socket = new MozWebSocket(serverUrl);
  } else if (window.WebSocket) {
    socket = new WebSocket(serverUrl);
  }
  socket.binaryType = "blob";

  /**
   * Called when connected to websocket server.
   * @param {Object} msg
   */
  socket.onopen = (msg) => {
    onConnect();
  };

  /**
   * Called when receiving a message from websocket server.
   * @param {Object} msg
   */
  socket.onmessage = (msg) => {
    let response = JSON.parse(msg.data);
    onMessage(response);
  };

  /**
   * Called when disconnected from websocket server.
   * @param {Object} msg
   */
  socket.onclose = (msg) => {};

  function send(dest, value) {
    let message = JSON.stringify({ txt: value, dest: dest });
    socket.send(message);
    return false;
  }
  return send;
};
