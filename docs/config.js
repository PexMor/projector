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

const Config = () => {
  const defConfig = {
    mode: "projector",
    mqtt: {
      host: "broker.emqx.io",
      port: 8084,
    },
    state: "pairing",
    uuid: uuidv4(),
    created: new Date().toISOString(),
    secCode: "1234",
    topics: ["projector-world"],
    knownUUIDs: [],
  };
  let config = defConfig;
  const clearConfig = () => {
    window.localStorage.setItem("config", JSON.stringify(defConfig));
    config = JSON.parse(window.localStorage.getItem("config"));
  };
  const loadConfig = () => {
    let x_config = window.localStorage.getItem("config");
    if (typeof x_config === "undefined" || x_config === null) {
      clearConfig();
    }
    config = JSON.parse(window.localStorage.getItem("config"));
  };
  const saveConfig = () => {
    window.localStorage.setItem("config", JSON.stringify(config));
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
    setMqtt: (host, port) => {
      config.mqtt.host = host;
      config.mqtt.port = port;
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
  };
  iface.loadConfig();
  console.log("config:", JSON.stringify(config));
  return iface;
};

// prepare config, and initialize it
export const config = Config();
// make it global - for debug purposes
window.config = config;
