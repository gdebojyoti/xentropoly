<!doctype html>

<html>
    <head>
        <title>Xentropoly</title>

        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">

        <link href="css/base.css" rel="stylesheet">
        <link href="css/board.css" rel="stylesheet">
        <link href="css/chat.css" rel="stylesheet">
        <link href="css/modals.css" rel="stylesheet">
    </head>

    <body>
        <div id="loader" class="loader">Loading..</div>

        <section class="controls">
            <button class="control-button" data-control="roll" title="Click me to roll dice">Roll dice</button>
            <button class="control-button" data-control="trade">Trade</button>
            <button class="control-button" data-control="mortgage">Mortgage</button>
            <button class="control-button" data-control="unmortgage">Unmortgage</button>
        </section>

        <div id="players"></div>

        <section class="board-and-chat">
            <div class="board">
                <div id="server-time" data-square-id="0" class="square go-block">#0 GO</div>

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

            <div id="chat" class="chat chat-inactive">
                <div class="chat-header">Game Chat</div>
                <div class="chat-window">
                    <div id="chat-messages" class="chat-messages"></div>
                    <input id="chat-player-message" class="chat-player-message" placeholder="Type a message and press enter.."></div>
                </div>
            </div>
        </section>

        <player-details></player-details>

        <dx-modals></dx-modals>

        <script src="js/libs/jquery-3.2.1.min.js"></script>
        <script src="js/libs/webcomponents-lite.js"></script>
        <script src="js/libs/socket.io-2.0.4.min.js"></script>

        <script src="js/_env.js"></script>

        <script src="js/enums/messages.js"></script>

        <script src="js/services/socketService.js"></script>
        <script src="js/services/messengerService.js"></script>
        <script src="js/services/uiService.js"></script>

        <script src="js/models/player.js"></script>

        <script src="js/app.js"></script>
        <script src="js/game.js"></script>

        <script src="js/uicomponents/playerDetails.js"></script>
        <script src="js/uicomponents/modals.js"></script>
    </body>
</html>
