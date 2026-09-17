<!DOCTYPE html>
<html lang="<?= $this->app->jsLang() ?>">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
        <meta name="mobile-web-app-capable" content="yes">
        <meta name="apple-mobile-web-app-capable" content="yes">
        <meta name="robots" content="noindex,nofollow">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta name="referrer" content="no-referrer">
        <?= $this->asset->colorCss() ?>
        <?= $this->asset->customCss() ?>
        <link rel="icon" href="<?= $this->url->dir() ?>assets/img/adaptive-favicon.svg" type="image/svg+xml">
        <link rel="icon" type="image/png" href="<?= $this->url->dir() ?>assets/img/favicon.png">
        <link rel="apple-touch-icon" href="<?= $this->url->dir() ?>assets/img/touch-icon-iphone.png">
        <link rel="apple-touch-icon" sizes="72x72" href="<?= $this->url->dir() ?>assets/img/touch-icon-ipad.png">
        <link rel="apple-touch-icon" sizes="114x114" href="<?= $this->url->dir() ?>assets/img/touch-icon-iphone-retina.png">
        <link rel="apple-touch-icon" sizes="144x144" href="<?= $this->url->dir() ?>assets/img/touch-icon-ipad-retina.png">
        <title>Kanboard</title>
        <?php if (REACT_DEV_SERVER !== ''): ?>
            <script type="module" src="<?= rtrim(REACT_DEV_SERVER, '/') ?>/@vite/client"></script>
            <script type="module" src="<?= rtrim(REACT_DEV_SERVER, '/') ?>/src/main.tsx"></script>
        <?php elseif ($assets !== null): ?>
            <?php foreach ($assets['css'] as $css): ?>
                <link rel="stylesheet" href="<?= $css ?>">
            <?php endforeach ?>
            <script type="module" src="<?= $assets['js'] ?>"></script>
        <?php else: ?>
            <style>#react-build-error { margin: 2rem; font: 1rem sans-serif; }</style>
        <?php endif ?>
    </head>
    <body>
        <div id="root"></div>
        <script>window.__KANBOARD__ = <?= json_encode($bootstrap, JSON_HEX_TAG|JSON_HEX_AMP|JSON_HEX_APOS|JSON_HEX_QUOT) ?>;</script>
        <?php if (REACT_DEV_SERVER === '' && $assets === null): ?>
            <div id="react-build-error">React bundle not built. Run <code>make react</code> (or <code>cd frontend &amp;&amp; npm install &amp;&amp; npm run build</code>).</div>
        <?php endif ?>
    </body>
</html>
