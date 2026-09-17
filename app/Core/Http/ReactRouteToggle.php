<?php

namespace Kanboard\Core\Http;

use Kanboard\Core\Base;

/**
 * React Route Toggle
 *
 * Decides, per dispatched route, whether the request is served by the React
 * shell (ReactAppController::show) or by the legacy PHP controller.
 *
 * Configuration:
 *  - REACT_UI_ENABLED (bool)   global switch, default false
 *  - REACT_UI_AREAS (csv)      feature areas served by React when enabled,
 *                              default: every area listed in self::AREAS
 *  - ?ui=react / ?ui=legacy    per-request override (useful during migration)
 *
 * This class is the single owner of the "React vs legacy" decision; feature
 * streams add new areas here and nowhere else.
 *
 * @package Kanboard\Core\Http
 */
class ReactRouteToggle extends Base
{
    const CONTROLLER = 'ReactAppController';
    const ACTION = 'show';
    const QUERY_PARAM = 'ui';

    /**
     * Feature area => legacy routes (Controller:action, '*' = any action) it replaces
     *
     * @var array
     */
    const AREAS = array(
        'dashboard' => array('DashboardController:show'),
        'board' => array('BoardViewController:show'),
        'task' => array('TaskViewController:show'),
        'project' => array('ProjectViewController:show'),
        'projects' => array('ProjectListController:show'),
        'settings' => array('ConfigController:*'),
        'analytics' => array('AnalyticController:*'),
    );

    /**
     * Whether the route resolved by the router should be served by the React shell
     *
     * @access public
     * @param  string $plugin
     * @param  string $controller
     * @param  string $action
     * @return bool
     */
    public function shouldServeReactShell($plugin, $controller, $action)
    {
        if ($plugin !== '' || $controller === self::CONTROLLER || $this->request->isAjax()) {
            return false;
        }

        $area = $this->getArea($controller, $action);

        if ($area === null) {
            return false;
        }

        $override = strtolower($this->request->getStringParam(self::QUERY_PARAM));

        if ($override === 'legacy') {
            return false;
        }

        if ($override === 'react') {
            return true;
        }

        return REACT_UI_ENABLED && in_array($area, $this->getEnabledAreas(), true);
    }

    /**
     * Get the feature area a legacy route belongs to
     *
     * @access public
     * @param  string $controller
     * @param  string $action
     * @return string|null
     */
    public function getArea($controller, $action)
    {
        foreach (self::AREAS as $area => $routes) {
            foreach ($routes as $route) {
                list($routeController, $routeAction) = explode(':', $route);

                if (strcasecmp($routeController, $controller) === 0 && ($routeAction === '*' || strcasecmp($routeAction, $action) === 0)) {
                    return $area;
                }
            }
        }

        return null;
    }

    /**
     * Feature areas enabled by configuration
     *
     * @access public
     * @return string[]
     */
    public function getEnabledAreas()
    {
        $areas = array_filter(array_map('trim', explode(',', strtolower((string) REACT_UI_AREAS))));
        return array_values(array_intersect($areas, array_keys(self::AREAS)));
    }
}
