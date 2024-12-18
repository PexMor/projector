<?php

// require necessary files here
require __DIR__ . '/vendor/autoload.php';
require __DIR__ . '/Apps/Chat.php';

// create new server instance
$server = new \Bloatless\WebSocket\Server('127.0.0.1', 1884, '/tmp/phpwss.sock');

print("Server started at ws://127.0.0.1:1884/chat\n");
print("Server started at ws://127.0.0.1:1884/status\n");

// server settings
$server->setMaxClients(100);
$server->setCheckOrigin(false);
$server->setAllowedOrigin('example.com');
$server->setMaxConnectionsPerIp(20);

// add your applications
$server->registerApplication('status', \Bloatless\WebSocket\Application\StatusApplication::getInstance());
$server->registerApplication('chat', \Apps\Chat::getInstance());

// start the server
$server->run();
