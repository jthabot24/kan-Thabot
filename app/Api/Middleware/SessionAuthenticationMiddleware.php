<?php

namespace Kanboard\Api\Middleware;

use JsonRPC\Exception\AuthenticationFailureException;
use JsonRPC\MiddlewareInterface;
use Kanboard\Core\Base;

class SessionAuthenticationMiddleware extends Base implements MiddlewareInterface
{
    public function execute($username, $password, $procedureName)
    {
        if (! $this->userSession->isLogged()) {
            throw new AuthenticationFailureException('Not authenticated');
        }
    }
}
