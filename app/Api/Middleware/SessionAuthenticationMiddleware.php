<?php

namespace Kanboard\Api\Middleware;

use JsonRPC\Exception\AuthenticationFailureException;
use JsonRPC\MiddlewareInterface;
use Kanboard\Core\Base;

/**
 * Class SessionAuthenticationMiddleware
 *
 * Authorizes JSON-RPC calls with the already opened browser session
 * (Kanboard\Core\User\UserSession) instead of HTTP Basic credentials.
 * Used by ReactAppController::api() so the React shell never needs a
 * personal API token.
 *
 * @package Kanboard\Api\Middleware
 */
class SessionAuthenticationMiddleware extends Base implements MiddlewareInterface
{
    /**
     * Execute Middleware
     *
     * @access public
     * @param  string $username
     * @param  string $password
     * @param  string $procedureName
     * @throws AuthenticationFailureException
     */
    public function execute($username, $password, $procedureName)
    {
        if (! $this->userSession->isLogged()) {
            throw new AuthenticationFailureException('Not logged in');
        }
    }
}
