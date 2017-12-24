class UiService {
    constructor(messengerService, socketService) {
        this.messengerService = messengerService;
        this.socketService = socketService;

        this.playerName = "";
        this.isChatWindowOpen = true;

        this._observe();
        this._initUiElements();
    }

    updateInfo(playerName) {
        this.playerName = playerName;
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

        // request mortgage on clicking "Mortgage" button
        $("[data-control=mortgage]").on("click", () => {
            this.socketService.requestMortgage(6);
        });

        // request to pay off mortgage on clicking #3
        $("[data-square-id=3]").on("click", () => {
            this.socketService.requestUnmortgage(6);
        });
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
