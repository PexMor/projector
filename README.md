# The Projector

**TL;DR** Open <https://pexmor.github.io/projector/> and scan the QR with your phone.

The code is located in [docs](docs) folder here in this repo.

It uses `broker.emqx.io` provided for free but without any guaranties, thus you might need to
setup own server (either with <www.emqx.io> or as sketched in [mosquitto](mosquitto)).
To override the default **MQTT** broker config add `#mqttCfgUrl=config.json` which points to the alternative config
see example in [docs/config_example.json](docs/config_example.json).

This project was create in order to make a proof of concept that can demonstrate modern web technologies.

The keywords or technologies include, but are not limited to:

- MQTT over websocket
- MQTT server
- QR 2-D barcodes codes

Inspired by:

- Digital Living Network Alliance (DLNA)
- UPnP aka mHTTP
- Bonjour aka mDNS
- WebRTC
- Websockets

## Development

Start local web server (in docs folder):

```bash
# start server at http://localhost:8088 (with CORS)
python -mpysrv
```

and the open <http://localhost:8088>
