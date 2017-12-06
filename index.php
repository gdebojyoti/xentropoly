<!doctype html>

<html>
    <head>
        <title>Xentropoly</title>

        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-width=1">

        <link href="style.css" rel="stylesheet">
    </head>

    <body>
        <!-- <h1>Xentropoly</h1> -->

        <div id="loader" class="loader">Loading..</div>

        <div id="player" class="player"></div>

        <div class="board">
            <div id="server-time" data-square-id="0" class="square go-block" title="Click me to roll dice (temporary)">#0 GO</div>

            <?php
            for ($i = 1; $i <= 10; $i++) {
            ?>
            <div data-square-id="<?= $i ?>" class="square">#<?= $i ?></div>
            <?php
            }
            ?>

            <div data-square-id="20" class="square peril-block">#20 MORTAL PERIL</div>

            <?php
            for ($i = 11; $i <= 19; $i++) {
            ?>
            <div data-square-id="<?= $i ?>" class="square reverse-order">#<?= $i ?></div>
            <?php
            }
            ?>

            <?php
            for ($i = 21; $i <= 29; $i++) {
            ?>
            <div data-square-id="<?= $i ?>" class="square">#<?= $i ?></div>
            <?php
            }
            ?>

            <?php
            for ($i = 30; $i <= 39; $i++) {
            ?>
            <div data-square-id="<?= $i ?>" class="square reverse-order">#<?= $i ?></div>
            <?php
            }
            ?>
        </div>

        <script src="js/jquery-3.2.1.min.js"></script>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/socket.io/2.0.4/socket.io.js"></script>

        <script src="js/app.js"></script>
        <script src="js/player.js"></script>
        <script src="js/server.js"></script>
    </body>
</html>
