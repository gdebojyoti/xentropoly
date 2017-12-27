class UiService {
    constructor(game, messengerService, socketService) {
        this.game = game;
        this.messengerService = messengerService;
        this.socketService = socketService;

        this.playerName = "";
        this.isChatWindowOpen = true;

        this.propertiesForMortgage = [];

        this._observe();
        this._initUiElements();
    }

    updateInfo(playerName) {
        this.playerName = playerName;
    }

    // update details of a single player in the bottom panel
    updatePlayerList(playerDetails) {
        let elm = $("#all-player-details [data-player-details=" + playerDetails.name + "]");
        if (elm[0]) {
            if (playerDetails.cash) {
                elm.children(".player-funds").html("Cash: $" + playerDetails.cash);
            }
            if (playerDetails.squares && playerDetails.squares.length) {
                elm.children(".player-squares").html("Owns: " + playerDetails.squares.join(", "));
            }
        } else {
            $("#all-player-details").append(`
                <div class="player-details" data-player-details=` + playerDetails.name + `>
                    <span class="player-name">` + playerDetails.name + `</span>
                    ||
                    <span class="player-funds">Cash: $` + playerDetails.cash + `</span>
                    ||
                    <span class="player-squares">Owns: ` + (playerDetails.squares && playerDetails.squares.length ? playerDetails.squares.join(", ") : "N/A") + `</span>
                </div>
            `);
        }
    }


    /* Private methods */

    // observe messages
    _observe() {
        this.messengerService.observe(MESSAGES.CHAT_MESSAGE_RECEIVED, data => {
            this._showReceivedMessages(data);
        });
    }

    _initUiElements() {
        $("#chat .chat-header").on("click", () => {
            $("#chat").toggleClass("chat-inactive");
        });

        let chatBox = $("#chat-player-message");
        chatBox.on("keyup", e => {
            if (e.keyCode === 13) {
                // show entered msg in chat window; send msg to server; clear msg from input box
                let msg = chatBox.val();
                chatBox.val("");
                this._showSentMessages(msg);
                this.socketService.sendChatMessage(msg);
                return false;
            }
        });

        this._initMortage();

        // open unmortgage modal on clicking "Unmortgage" button
        $("[data-control=unmortgage]").on("click", () => {
            $("[data-modal-type=unmortgage-properties]").addClass("show-modal");
        });

        // request to pay off mortgage on clicking "Unmortgage" button in modal
        $("[data-modal-type=unmortgage-properties] [data-modal-button=unmortgage]").on("click", () => {
            console.log("Paying off mortgages...");
            this.socketService.requestUnmortgage(6);
        });

        // close unmortgage modal
        $("[data-modal-type=unmortgage-properties] [data-modal-button=cancel]").on("click", () => {
            $("[data-modal-type=unmortgage-properties]").removeClass("show-modal");
        });
    }

    // define mortgage modal behaviour and content
    _initMortage() {

        let _this = this; // use in "_closeMortgageModal" method

        // open mortgage modal on clicking "Mortgage" button
        $("[data-control=mortgage]").on("click", () => {
            $("[data-modal-type=mortgage-properties]").addClass("show-modal");

            this.propertiesForMortgage = [];

            let playerDetails = this.game.getPlayerDetails(),
                mapData = this.game.getMapData();

            console.log(playerDetails, mapData);

            // populate list of properties
            for (let square of playerDetails.squares) {
                $("[data-modal-type=mortgage-properties] [data-my-properties]")
                        .append('<div class="mortgage-modal__property" data-property-id=' + square + '>' + mapData.squares[square].propertyName + '</div>');
            }
        });

        // select/ deselect property to be mortgaged
        $("[data-modal-type=mortgage-properties] [data-my-properties]").on("click", ".mortgage-modal__property", e => {
            let prop = $(e.target),
                propId = prop.attr("data-property-id");

            let index = this.propertiesForMortgage.indexOf(propId);

            if (index < 0) {
                this.propertiesForMortgage.push(propId);
                $(prop).addClass("property-mortgaged");
            } else {
                this.propertiesForMortgage.splice(index, 1);
                $(prop).removeClass("property-mortgaged");
            }
        });

        // request mortgage on clicking "Mortgage" button in modal
        $("[data-modal-type=mortgage-properties] [data-modal-button=mortgage]").on("click", () => {
            if (this.propertiesForMortgage.length) {
                console.log("Mortgaging properties...", this.propertiesForMortgage);
                this.socketService.requestMortgage(this.propertiesForMortgage);
            }
            _closeMortgageModal();
        });

        // cancel & close mortgage modal
        $("[data-modal-type=mortgage-properties] [data-modal-button=cancel]").on("click", () => {
            _closeMortgageModal();
        });

        function _closeMortgageModal () {
            // hide modal
            $("[data-modal-type=mortgage-properties]").removeClass("show-modal");
            // empty array
            _this.propertiesForMortgage = [];
            // empty property list
            $("[data-modal-type=mortgage-properties] [data-my-properties]").empty();
        }

    }

    // show sent messages in chat window
    _showSentMessages(msg) {
        let chatMessages = $("#chat-messages");
        let lastChatMessageGroup = $("#chat-messages .chat-message-group:last");
        let lastChatMessageSender = $("#chat-messages .chat-message-group:last .chat-message-sender");
        if (lastChatMessageSender.attr("data-chat-sender-id") === this.playerName) {
            lastChatMessageGroup.append(`
                <div class="chat-message">` + msg + `</div>
            `);
        } else {
            chatMessages.append(`
                <div class="chat-message-group chat-from-self">
                    <div data-chat-sender-id="` + this.playerName + `" class="chat-message-sender">` + this.playerName + `</div>
                    <div class="chat-message">` + msg + `</div>
                </div>
            `);
        }
    }

    // show received messages in chat window
    _showReceivedMessages(data) {
        let chatMessages = $("#chat-messages");
        let lastChatMessageGroup = $("#chat-messages .chat-message-group:last");
        let lastChatMessageSender = $("#chat-messages .chat-message-group:last .chat-message-sender");
        if (lastChatMessageSender.attr("data-chat-sender-id") === data.sender) {
            lastChatMessageGroup.append(`
                <div class="chat-message">` + data.msg + `</div>
            `);
        } else {
            chatMessages.append(`
                <div class="chat-message-group">
                    <div data-chat-sender-id="` + data.sender + `" class="chat-message-sender">` + data.sender + `</div>
                    <div class="chat-message">` + data.msg + `</div>
                </div>
            `);
        }
    }
}
