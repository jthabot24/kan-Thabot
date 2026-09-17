<?php

namespace Kanboard\Controller;

use JsonRPC\Server;
use Kanboard\Api\Middleware\SessionAuthenticationMiddleware;
use Kanboard\ServiceProvider\ApiProvider;

/**
 * React shell controller
 *
 * Serves the React single page application (assets/react) and exposes the
 * JSON-RPC API to it using the browser session + CSRF token instead of
 * HTTP Basic credentials.
 *
 * @package Kanboard\Controller
 */
class ReactAppController extends BaseController
{
    const CSRF_HEADER = 'X-CSRF-Token';

    /**
     * Render the React shell (client-side routing takes over from here)
     *
     * @access public
     */
    public function show()
    {
        $this->response->html($this->template->render('react/shell', array(
            'title' => 'Kanboard',
            'bootstrap' => $this->getBootstrapData(),
        )));
    }

    /**
     * Describe the current browser session to the React shell
     *
     * Returns 401 when the session is not authenticated so the client can
     * redirect to the login page.
     *
     * @access public
     */
    public function session()
    {
        $this->response->json($this->getBootstrapData());
    }

    /**
     * Execute a JSON-RPC 2.0 request authorized by the browser session
     *
     * Requests must be POSTed with the reusable CSRF token from the bootstrap
     * payload in the X-CSRF-Token header.
     *
     * @access public
     */
    public function api()
    {
        if (! $this->request->isPost()) {
            $this->response->json(array(
                'jsonrpc' => '2.0',
                'error' => array('code' => -32600, 'message' => 'Invalid Request', 'data' => 'POST required'),
                'id' => null,
            ), 405);
            return;
        }

        if (! $this->token->validateReusableCSRFToken($this->request->getHeader(self::CSRF_HEADER))) {
            $this->response->json(array(
                'jsonrpc' => '2.0',
                'error' => array('code' => 403, 'message' => 'Forbidden', 'data' => 'Invalid CSRF token'),
                'id' => null,
            ), 403);
            return;
        }

        $server = new Server($this->request->getBody());
        $server->getMiddlewareHandler()->withMiddleware(new SessionAuthenticationMiddleware($this->container));
        ApiProvider::registerProcedures($server, $this->container);

        $this->response
            ->withContentType('application/json')
            ->withBody($server->execute())
            ->send();
    }

    /**
     * Data embedded in the shell and returned by session()
     *
     * @access protected
     * @return array
     */
    protected function getBootstrapData()
    {
        $user = $this->userSession->getAll();
        $userId = $this->userSession->getId();

        return array(
            'baseUrl' => $this->helper->url->dir(),
            'urlRewrite' => (bool) ENABLE_URL_REWRITE,
            'apiUrl' => $this->helper->url->to('ReactAppController', 'api'),
            'sessionUrl' => $this->helper->url->to('ReactAppController', 'session'),
            'loginUrl' => $this->helper->url->to('AuthController', 'login'),
            'logoutUrl' => DISABLE_LOGOUT ? null : $this->helper->url->to('AuthController', 'logout', array('csrf_token' => $this->token->getCSRFToken())),
            'documentationUrl' => sprintf(DOCUMENTATION_URL_PATTERN, ''),
            'csrfToken' => $this->token->getReusableCSRFToken(),
            'language' => $this->languageModel->getJsLanguageCode(),
            'timezone' => $this->timezoneModel->getCurrentTimezone(),
            'dateFormat' => $this->dateParser->getUserDateFormat(),
            'user' => array(
                'id' => $userId,
                'username' => $this->userSession->getUsername(),
                'name' => isset($user['name']) ? $user['name'] : '',
                'email' => isset($user['email']) ? $user['email'] : '',
                'role' => $this->userSession->getRole(),
                'avatar_path' => isset($user['avatar_path']) ? $user['avatar_path'] : '',
                'theme' => $this->userSession->getTheme(),
                'is_admin' => $this->userSession->isAdmin(),
                'has_notifications' => $this->helper->user->hasNotifications(),
            ),
            'permissions' => array(
                'create_project' => $this->helper->user->hasAccess('ProjectCreationController', 'create'),
                'create_private_project' => $this->configModel->get('disable_private_project', 0) == 0,
                'manage_users' => $this->helper->user->hasAccess('UserListController', 'show'),
                'manage_settings' => $this->helper->user->hasAccess('ConfigController', 'index'),
                'manage_plugins' => $this->helper->user->hasAccess('PluginController', 'show'),
            ),
            'flash' => $this->getFlashMessages(),
        );
    }

    /**
     * Consume pending flash messages
     *
     * @access protected
     * @return array
     */
    protected function getFlashMessages()
    {
        $messages = array();

        foreach (array('success', 'failure') as $type) {
            $message = $this->flash->getMessage($type);

            if (! empty($message)) {
                $messages[] = array('type' => $type, 'message' => $message);
            }
        }

        return $messages;
    }
}
