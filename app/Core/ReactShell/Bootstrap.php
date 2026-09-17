<?php

namespace Kanboard\Core\ReactShell;

use Kanboard\Core\Base;

class Bootstrap extends Base
{
    public function toArray()
    {
        $user = $this->userSession->getAll();

        if (! is_array($user)) {
            $user = array();
        }

        foreach (array('credentials_fingerprint', 'password', 'twofactor_secret', 'api_access_token', 'token') as $key) {
            unset($user[$key]);
        }

        return array(
            'user' => $user,
            'csrf_token' => $this->token->getReusableCSRFToken(),
            'base_url' => $this->helper->url->dir(),
            'app' => array(
                'timezone' => $this->helper->app->getTimezone(),
                'js_date_format' => $this->helper->app->getJsDateFormat(),
                'js_time_format' => $this->helper->app->getJsTimeFormat(),
                'language' => $this->helper->app->jsLang(),
            ),
            'flash' => array(
                'success' => $this->flash->getMessage('success') ?: null,
                'failure' => $this->flash->getMessage('failure') ?: null,
            ),
            'links' => array(
                'login' => $this->helper->url->to('AuthController', 'login'),
                'logout' => $this->helper->url->to('AuthController', 'logout', array('csrf_token' => $this->token->getCSRFToken())),
                'legacy_dashboard' => $this->helper->url->to('DashboardController', 'show'),
            ),
        );
    }

    public function getManifest()
    {
        $filename = ROOT_DIR.DIRECTORY_SEPARATOR.'assets'.DIRECTORY_SEPARATOR.'react'.DIRECTORY_SEPARATOR.'.vite'.DIRECTORY_SEPARATOR.'manifest.json';

        if (! is_file($filename)) {
            return null;
        }

        $manifest = json_decode(file_get_contents($filename), true);
        return is_array($manifest) ? $manifest : null;
    }

    public function getReactAssets()
    {
        $manifest = $this->getManifest();

        if (! isset($manifest['src/main.tsx'])) {
            return null;
        }

        $entry = $manifest['src/main.tsx'];
        $base = $this->helper->url->dir().'assets/react/';
        $assets = array('css' => array(), 'js' => '');

        foreach ($entry['css'] ?? array() as $css) {
            $assets['css'][] = $base.$css;
        }

        if (isset($entry['file'])) {
            $assets['js'] = $base.$entry['file'];
        }

        return $assets;
    }
}
