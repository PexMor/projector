<?php

require __DIR__ . '/vendor/autoload.php';

$server = 'broker.emqx.io';
$port = 1883;
// $port = 8883;
$clientId = 'pobuda-iot-pub';

$mqtt = new \PhpMqtt\Client\MqttClient($server, $port, $clientId);
// $connectionSettings = (new \PhpMqtt\Client\ConnectionSettings)
//     ->setConnectTimeout(3)
//     ->setUseTls(true)
//     ->setTlsSelfSignedAllowed(true);
// $mqtt->connect($connectionSettings, true);
$mqtt->connect();
print("Connected - publishing\n");
$mqtt->publish('php-mqtt/client/test', json_encode(["abc" => "cde", "txt" => 123]), 0);
print("Published - disconnecting\n");
$mqtt->disconnect();
