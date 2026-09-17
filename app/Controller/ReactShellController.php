<?php

namespace Kanboard\Controller;

use Kanboard\Core\ReactShell\Bootstrap;

class ReactShellController extends BaseController
{
    public function show()
    {
        $bootstrap = new Bootstrap($this->container);
        $this->response->html($this->template->render('react_shell', array(
            'bootstrap' => $bootstrap->toArray(),
            'assets' => $bootstrap->getReactAssets(),
        )));
    }
}
