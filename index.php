<!doctype html>

<html>
    <head>
        <title>Xentropoly</title>

        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-width=1">

        <link href="style.css" rel="stylesheet">
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

        <section id="all-player-details" class="all-player-details">
            <h2>List of in-game players -</h2>
            <!-- <div class="player-details" data-player-details="D3XT3R">
                <span class="player-name">D3XT3R</span>
                <span class="player-funds">1500</span>
                <span class="player-squares">0, 1, 3</span>
            </div> -->
        </section>

        <section id="modal" data-modal-type="mortgage-properties" class="modal-wrapper">
            <div class="modal">
                <h3>Mortgage your properties</h3>
                <div data-my-properties class="mortgage-modal__property_list"></div>
                <button data-modal-button="mortgage" class="modal-button modal-save">Mortgage</button>
                <button data-modal-button="cancel" class="modal-button modal-cancel">Cancel</button>
            </div>
        </section>

        <section id="modal" data-modal-type="unmortgage-properties" class="modal-wrapper show-modal_">
            <div class="modal">
                <h3>Payoff your mortgages</h3>
                <div data-my-properties class="mortgage-modal__property_list">
                    <div class="mortgage-modal__property property-mortgaged" data-property-id=3>Dhaka</div>
                    <div class="mortgage-modal__property property-mortgaged" data-property-id=10>Helsinki</div>
                </div>
                <button data-modal-button="unmortgage" class="modal-button modal-save">Unmortgage</button>
                <button data-modal-button="cancel" class="modal-button modal-cancel">Cancel</button>
            </div>
        </section>

        <script src="js/libs/jquery-3.2.1.min.js"></script>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/socket.io/2.0.4/socket.io.js"></script>

        <script src="js/_env.js"></script>

        <script src="js/enums/messages.js"></script>

        <script src="js/services/socketService.js"></script>
        <script src="js/services/messengerService.js"></script>
        <script src="js/services/uiService.js"></script>

        <script src="js/app.js"></script>
        <script src="js/game.js"></script>
        <script src="js/player.js"></script>
    </body>
</html>
