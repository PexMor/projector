import { mqtt_app_prefix_by_uuid, mqtt_app_prefix_group } from "./mqtt.js";

const uuidv4 = () => {
  return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, (c) =>
    (
      c ^
      (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))
    ).toString(16)
  );
};

const zero_uuid = "00000000-0000-0000-0000-000000000000";

export const defBroker = {
  host: "broker.emqx.io",
  port: 8084,
  useSSL: true,
  user: null,
  pass: null,
};

const defConfig = {
  mode: "projector",
  mqtt: {
    host: defBroker.host,
    port: defBroker.port,
    useSSL: defBroker.useSSL,
    user: defBroker.user,
    pass: defBroker.pass,
  },
  state: "pairing",
  uuid: uuidv4(),
  created: new Date().toISOString(),
  secCode: "1234",
  topics: [],
  knownUUIDs: [],
};

const Config = () => {
  let config = defConfig;
  const tmpScreenId = window.location.hash.substring(1) || "";
  if (!tmpScreenId.includes("=")) {
    // force screenId
    var forceScreenId = tmpScreenId;
    // console.log("forceScreenId:", forceScreenId);
  }
  const screenId = forceScreenId || "def";
  // console.log("screenId:", screenId);
  const confId = `config-${screenId}`;
  const clearConfig = () => {
    // console.log("clearConfig: confId", confId);
    window.localStorage.setItem(confId, JSON.stringify(defConfig));
    config = defConfig;
    // console.log("config:", JSON.stringify(config));
  };
  const loadConfig = () => {
    let x_config = window.localStorage.getItem(confId);
    if (typeof x_config === "undefined" || x_config === null) {
      clearConfig();
    }
    // console.log("loadConfig: confId = ", confId);
    config = JSON.parse(window.localStorage.getItem(confId));
  };
  const saveConfig = () => {
    window.localStorage.setItem(confId, JSON.stringify(config));
  };
  const fixAndSaveCfg = (item) => {
    if (config[item] === null || config[item] === undefined) {
      config[item] = defConfig[item];
    }
    saveConfig();
  };
  const iface = {
    clearConfig,
    loadConfig,
    saveConfig,
    getConfig: () => {
      return config;
    },
    getMode: () => {
      return config.mode;
    },
    setMode: (mode) => {
      config.mode = mode;
      fixAndSaveCfg("mode");
    },
    getMqtt: () => {
      return config.mqtt;
    },
    setMqtt: (host, port, useSSL) => {
      config.mqtt.host = host;
      config.mqtt.port = port;
      config.mqtt.useSSL = useSSL;
      fixAndSaveCfg("mqtt");
    },
    setMqttAll: (host, port, useSSL, user, pass) => {
      config.mqtt.host = host;
      config.mqtt.port = port;
      config.mqtt.useSSL = useSSL;
      config.mqtt.user = user;
      config.mqtt.pass = pass;
      fixAndSaveCfg("mqtt");
    },
    getState: () => {
      return config.state;
    },
    setState: (state) => {
      config.state = state;
      fixAndSaveCfg("state");
    },
    getUUID: () => {
      return config.uuid;
    },
    setUUID: (uuid) => {
      config.uuid = uuid;
      fixAndSaveCfg("uuid");
    },
    getCreated: () => {
      return config.created;
    },
    setCreated: (created) => {
      config.created = created;
      fixAndSaveCfg("created");
    },
    getSecCode: () => {
      return config.secCode;
    },
    setSecCode: (secCode) => {
      config.secCode = secCode;
      fixAndSaveCfg("secCode");
    },
    checkSecCode: (secCode) => {
      return config.secCode === secCode;
    },
    getTopics: () => {
      // check whether it is array
      if (!Array.isArray(config.topics)) {
        config.topics = defConfig.topics;
        saveConfig();
      }
      return config.topics.map((topic) => {
        return `${mqtt_app_prefix_group}/${topic}`;
      });
    },
    setTopics: (topics) => {
      config.topics = topics;
      fixAndSaveCfg("topics");
    },
    getOwnTopic: () => {
      return `${mqtt_app_prefix_by_uuid}/${config.uuid}`;
    },
    getKnownUUIDs: () => {
      return config.knownUUIDs;
    },
    setKnownUUIDs: (knownUUIDs) => {
      config.knownUUIDs = knownUUIDs;
      fixAndSaveCfg("knownUUIDs");
    },
    addKnownUUID: (uuid) => {
      config.knownUUIDs.push(uuid);
      // deduplicate
      config.knownUUIDs = [...new Set(config.knownUUIDs)];
      saveConfig();
      return config.knownUUIDs;
    },
    remKnownUUID: (uuid) => {
      config.knownUUIDs = config.knownUUIDs.filter((item) => item !== uuid);
      saveConfig();
    },
    getScreenId: () => {
      return screenId;
    },
    setScreenId: (screenId) => {
      window.location.hash = `#${screenId}`;
      window.location.reload();
    },
  };
  loadConfig();
  // console.log("config-l:", JSON.stringify(config));
  return iface;
};

// prepare config, and initialize it
export const config = Config();
// make it global - for debug purposes
window.config = config;
