# Websocket messaging

**TL;DR** Open <https://pexmor.github.io/projector/> and scan the QR with your phone.

> Note:The **github.io** current version does not pair the projector with any backend. But that is an optional feature, which can be done with little to no effort.

## static html serving

```bash
python -mhttp.server -d docs 8088
```

```bash
php -S 8088
```

## With Mosquitto is a MQTT friend

```bash
# you might add '-d' for demonizing it
mosquitto -c mosquitto.conf
```

```bash
mosquitto_pub -h localhost -t test -m abc
```

```bash
#
mosquitto_pub -h localhost -t to-projector -m '{"txt":"Pokus dnes '"`date`"'"}'
#
mosquitto_pub -h localhost -t to-projector -m '{"txt":"<span style=\"font-size:200%\">😀😆🥹😅😂🤣</span>"}'
```

## With PHP Websocket server

```bash
websocat ws://127.0.0.1:1884/chat
```
