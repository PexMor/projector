<?php

require __DIR__ . '/vendor/autoload.php';

$server = 'broker.emqx.io';
$port = 1883;
// $port = 8883;
$clientId = 'pobuda-iot';

$mqtt = new \PhpMqtt\Client\MqttClient($server, $port, $clientId);
// $connectionSettings = (new \PhpMqtt\Client\ConnectionSettings)
//     ->setConnectTimeout(3)
//     ->setUseTls(true)
//     ->setTlsSelfSignedAllowed(true);
// $mqtt->connect($connectionSettings, true);
$mqtt->connect();
$mqtt->subscribe('php-mqtt/client/test', function ($topic, $message, $retained, $matchedWildcards) {
    echo sprintf("Received message on topic [%s]: %s\n", $topic, $message);
}, 0);
$mqtt->loop(true);
$mqtt->disconnect();
