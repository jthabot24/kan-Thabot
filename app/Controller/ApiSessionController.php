<?php

namespace Kanboard\Controller;

use JsonRPC\Server;
use Kanboard\Api\Middleware\SessionAuthenticationMiddleware;
use Kanboard\Core\ReactShell\Bootstrap;
use Kanboard\ServiceProvider\ApiProvider;

class ApiSessionController extends BaseController
{
    public function bootstrap()
    {
        $this->response->json((new Bootstrap($this->container))->toArray());
    }

    public function execute()
    {
        $body = $this->request->getBody();

        if (! $this->token->validateReusableCSRFToken($this->request->getHeader('X-CSRF-Token'))) {
            $this->response->json(array(
                'jsonrpc' => '2.0',
                'error' => array(
                    'code' => -32000,
                    'message' => 'Invalid CSRF token',
                ),
                'id' => null,
            ), 403);
            return;
        }

        if ($body === '') {
            $this->response->json(array(
                'jsonrpc' => '2.0',
                'error' => array(
                    'code' => -32700,
                    'message' => 'Parse error',
                ),
                'id' => null,
            ), 400);
            return;
        }

        $server = new Server($body);
        $server->getMiddlewareHandler()->withMiddleware(new SessionAuthenticationMiddleware($this->container));
        ApiProvider::registerProcedures($server, $this->container);
        $this->response->withBody($server->execute())->withContentType('application/json')->send();
    }
}
