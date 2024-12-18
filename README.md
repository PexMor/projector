# Mosquitto is a MQTT friend

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
