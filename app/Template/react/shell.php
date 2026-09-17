<!DOCTYPE html>
<html lang="<?= $this->app->jsLang() ?>"<?php if ($this->app->isRtlLanguage()): ?> dir="rtl"<?php endif; ?>>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
        <meta name="mobile-web-app-capable" content="yes">
        <meta name="apple-mobile-web-app-capable" content="yes">
        <meta name="robots" content="noindex,nofollow">
        <meta name="referrer" content="no-referrer">

        <?= $this->asset->colorCss() ?>
        <?= $this->asset->css('assets/css/vendor.min.css') ?>
        <?= $this->asset->css('assets/css/'.$this->user->getTheme().'.min.css') ?>
        <?= $this->asset->css('assets/css/print.min.css', true, 'print') ?>
        <?php if (file_exists(dirname(__DIR__, 3).'/assets/react/app.css')): ?>
            <?= $this->asset->css('assets/react/app.css') ?>
        <?php endif ?>
        <?= $this->asset->customCss() ?>

        <link rel="icon" href="<?= $this->url->dir() ?>assets/img/adaptive-favicon.svg" type="image/svg+xml">
        <link rel="icon" type="image/png" href="<?= $this->url->dir() ?>assets/img/favicon.png">
        <link rel="apple-touch-icon" href="<?= $this->url->dir() ?>assets/img/touch-icon-iphone.png">

        <title><?= $this->text->e($title) ?></title>
    </head>
    <body data-timezone="<?= $this->app->getTimezone() ?>"
          data-js-date-format="<?= $this->app->getJsDateFormat() ?>"
          data-js-time-format="<?= $this->app->getJsTimeFormat() ?>"
    >
        <div id="react-root"></div>
        <script id="kanboard-bootstrap" type="application/json"><?= json_encode($bootstrap, JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_APOS | JSON_HEX_QUOT | JSON_UNESCAPED_SLASHES) ?></script>
        <?php if (file_exists(dirname(__DIR__, 3).'/assets/react/app.js')): ?>
            <script type="module" src="<?= $this->url->dir() ?>assets/react/app.js?<?= filemtime(dirname(__DIR__, 3).'/assets/react/app.js') ?>"></script>
        <?php else: ?>
            <section class="page">
                <div class="alert alert-error">
                    React bundle not found: run <code>npm install &amp;&amp; npm run build</code> inside <code>frontend/</code> to generate <code>assets/react/</code>.
                </div>
            </section>
        <?php endif ?>
    </body>
</html>
