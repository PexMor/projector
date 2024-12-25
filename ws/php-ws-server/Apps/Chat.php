<?php

declare(strict_types=1);

namespace Apps;

use Bloatless\WebSocket\Application\Application;
use Bloatless\WebSocket\Connection;

class Chat extends Application
{
    /**
     * @var array $clients
     */
    private array $clients = [];

    /**
     * @var array $nicknames
     */
    private array $nicknames = [];

    /**
     * Handles new connections to the application.
     *
     * @param Connection $connection
     * @return void
     */
    public function onConnect(Connection $connection): void
    {
        $id = $connection->getClientId();
        $this->clients[$id] = $connection;
        $this->nicknames[$id] = 'Guest' . rand(10, 999);
    }

    /**
     * Handles client disconnects.
     *
     * @param Connection $connection
     * @return void
     */
    public function onDisconnect(Connection $connection): void
    {
        $id = $connection->getClientId();
        print("Client disconnected: " . $id . PHP_EOL);
        unset($this->clients[$id], $this->nicknames[$id]);
    }

    /**
     * Handles incomming data/requests.
     * If valid action is given the according method will be called.
     *
     * @param string $data
     * @param Connection $client
     * @return void
     */
    public function onData(string $data, Connection $client): void
    {
        try {
            $decodedData = json_decode($data, true);
            $this->onIPCData($decodedData);
        } catch (\RuntimeException $e) {
            // @todo Handle/Log error
        }
    }

    /**
     * Handles data pushed into the websocket server using the push-client.
     *
     * @param array $data
     */
    public function onIPCData(array $data): void
    {
        $encodedData = json_encode($data);
        foreach ($this->clients as $sendto) {
            $sendto->send($encodedData);
        }
    }
}
