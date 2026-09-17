<?php

namespace Kanboard\Core\Http;

use Kanboard\Core\Base;

class ReactShellToggle extends Base
{
    const AREAS = array(
        'BoardViewController' => array('show' => 'board'),
        'TaskViewController' => array('show' => 'task'),
        'ProjectViewController' => array('show' => 'project'),
        'ProjectListController' => array('show' => 'projects'),
        'DashboardController' => array('show' => 'dashboard'),
        'ConfigController' => array('index' => 'settings'),
        'AnalyticController' => array('*' => 'analytics'),
    );

    public function apply(): void
    {
        $controller = $this->router->getController();
        $action = $this->router->getAction();
        $area = '';

        if (isset(self::AREAS[$controller])) {
            if (isset(self::AREAS[$controller][$action])) {
                $area = self::AREAS[$controller][$action];
            } elseif (isset(self::AREAS[$controller]['*'])) {
                $area = self::AREAS[$controller]['*'];
            }
        }

        if ($area === '' || $this->request->getStringParam('legacy') === '1') {
            return;
        }

        $react = $this->request->getStringParam('react') === '1';
        $enabled = array_filter(array_map('trim', explode(',', REACT_SHELL_AREAS)));

        if ($react || in_array('all', $enabled, true) || in_array($area, $enabled, true)) {
            $this->router->override('ReactShellController', 'show');
        }
    }
}
