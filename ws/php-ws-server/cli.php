<?php

// require necessary files here
require __DIR__ . '/vendor/autoload.php';

$pushClient = new \Bloatless\WebSocket\PushClient('//tmp/phpwss.sock');
$pushClient->sendToApplication('chat', [
    'txt' => 'Hello from the PushClient!',
]);
