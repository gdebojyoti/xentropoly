/*jshint loopfunc:true */

class UiService {
    constructor(messengerService, socketService) {
        this.messengerService = messengerService;
        this.socketService = socketService;

        this.playerName = "";
        this.tradeWithPlayerId = ""; // id of player to whom trade is to be proposed

        this.isChatWindowOpen = true;

        this.propertiesOfferedForTrade = [];
        this.propertiesRequestedForTrade = [];
        this.cashOfferedForTrade = [];
        this.cashRequestedForTrade = [];
        this.propertiesForMortgage = [];
        this.propertiesForUnmortgage = [];

        this._observe();
        this._initUiElements();
    }

    initialize(mapData, playerName) {
        console.log(mapData);
        this.playerName = playerName;

        // design all squares
        this._constructSquares(mapData.squares, mapData.propertyCodes);

        // ready to play
        $("#loader").fadeOut(200);
    }

    // update details of a single player in the bottom panel
    updatePlayerList(playerDetails) {
        let elm = $("#all-player-details [data-player-details=" + playerDetails.name + "]");
        if (elm[0]) {
            if (playerDetails.cash) {
                elm.children(".player-funds").html("Cash: $" + playerDetails.cash);
            }
            elm.children(".player-squares").html("Owns: " + playerDetails.squares && playerDetails.squares.length ? playerDetails.squares.join(", ") : "N/A");
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

    // open mortgage modal, showing current player's list of properties that can be mortgaged
    openTradeModal(mapData, allPlayersData) {
        // display modal
        $("[data-modal-type=initiate-trade]").addClass("show-modal");

        // empty & show player list
        $("[data-modal-type=initiate-trade] [data-player-list]").empty().show();

        // empty & hide self & opponent property lists
        $("[data-modal-type=initiate-trade] [data-my-properties]").empty().hide();
        $("[data-modal-type=initiate-trade] [data-opponent-properties]").empty().hide();

        this._resetTradeProposal();

        // populate list of properties belonging to current player
        $("[data-modal-type=initiate-trade] [data-my-properties]").append('<input class="mortgage-modal--property" id="cashOfferedForTrade" placeholder="Cash from ' + this.playerName + '">');
        for (let square of allPlayersData[this.playerName].squares) {
            $("[data-modal-type=initiate-trade] [data-my-properties]")
                    .append('<div class="mortgage-modal--property" data-property-id=' + square + '>' + mapData.squares[square].propertyName + '</div>');
        }

        // populate list of opponent players
        for (let playerName in allPlayersData) {
            // ignore self (this.playerName should not appear in opponent players' list)
            if (allPlayersData.hasOwnProperty(playerName) && playerName !== this.playerName) {
                let playerElm = $('<div class="mortgage-modal--property" data-property-id=' + playerName + '>' + playerName + '</div>');

                // add player to list
                $("[data-modal-type=initiate-trade] [data-player-list]").append(playerElm);

                // on clicking a particular player: hide players list, show self & opponent properties, reset trade proposal
                playerElm.on("click", () => {
                    this.tradeWithPlayerId = playerName;

                    this._resetTradeProposal();

                    // hide player list
                    $("[data-modal-type=initiate-trade] [data-player-list]").hide();

                    // clear existing list of opponent properties
                    $("[data-modal-type=initiate-trade] [data-opponent-properties]").empty();

                    // populate opponent property list
                    $("[data-modal-type=initiate-trade] [data-opponent-properties]").append('<input class="mortgage-modal--property" id="cashRequestedForTrade" placeholder="Cash from ' + playerName + '">');
                    for (let square of allPlayersData[playerName].squares) {
                        $("[data-modal-type=initiate-trade] [data-opponent-properties]")
                                .append('<div class="mortgage-modal--property" data-property-id=' + square + '>' + mapData.squares[square].propertyName + '</div>');
                    }

                    // display self & opponent property lists
                    $("[data-modal-type=initiate-trade] [data-my-properties]").show();
                    $("[data-modal-type=initiate-trade] [data-opponent-properties]").show();

                });
            }
        }
    }

    // open mortgage modal, showing current player's list of properties that can be mortgaged
    openMortgageModal(mapData, playerDetails) {
        $("[data-modal-type=mortgage-properties]").addClass("show-modal");

        this.propertiesForMortgage = [];

        // populate list of unmortgaged properties
        for (let square of playerDetails.squares) {
            // ignore if property is already mortgaged
            if (mapData.squares[square].isMortgaged) {
                continue;
            }
            $("[data-modal-type=mortgage-properties] [data-my-properties]")
                    .append('<div class="mortgage-modal--property" data-property-id=' + square + '>' + mapData.squares[square].propertyName + '</div>');
        }
    }
    
    // open unmortgage modal, showing current player's list of properties that are mortgaged
    openUnmortgageModal(mapData, playerDetails) {
        $("[data-modal-type=unmortgage-properties]").addClass("show-modal");

        this.propertiesForUnmortgage = [];

        // populate list of mortgaged properties
        for (let square of playerDetails.squares) {
            // ignore if property is not mortgaged
            if (!mapData.squares[square].isMortgaged) {
                continue;
            }
            $("[data-modal-type=unmortgage-properties] [data-my-properties]")
                    .append('<div class="mortgage-modal--property property-mortgaged" data-property-id=' + square + '>' + mapData.squares[square].propertyName + '</div>');
        }
    }

    // trade proposal offered to current player
    tradeProposalReceived(proposedBy) {
        let isProposalAccepted = confirm("Accept trade offer from " + proposedBy + "?");

        // dispatch above decision via socket to server (and other players)
        this.socketService.tradeProposalResponded(isProposalAccepted);
    }

    // offer current player the chance to buy property at data.squareId
    offerBuyProperty(propertyName, propertyPrice) {
        let isPropertyPurchased = confirm("Buy " + propertyName + " for " + propertyPrice + "?");

        // dispatch above decision via socket to server (and other players)
        this.socketService.propertyBuyOfferResponded(isPropertyPurchased);
    }

    updateSquareOwner(squareId, color) {
        // determine exact square from "id"
        let elm = $("[data-square-id=" + squareId + "]");
        // remove previous owner mark, if any
        elm.children(".property-owner").remove();
        // add mark of new owner
        elm.append("<div class='property-owner' style='background-color: " + color + "'></div>");
    }

    propertyMortgaged(squares) {
        for (let squareId of squares) {
            // determine exact square from "id"
            let elm = $("[data-square-id=" + squareId + "]");
            elm.addClass("mortgaged");
        }
    }

    propertyUnmortgaged(squares) {
        for (let squareId of squares) {
            // determine exact square from "id"
            let elm = $("[data-square-id=" + squareId + "]");
            elm.removeClass("mortgaged");
        }
    }


    /* Private methods */

    // observe messages
    _observe() {
        this.messengerService.observe(MESSAGES.UI_CHAT_MESSAGE_RECEIVED, data => {
            this._showReceivedMessages(data);
        });
    }

    _initUiElements() {
        // initialize roll dice audio
        let rollDiceAudio = new Audio("assets/audio/rolldice.mp3");

        // roll dice on clicking "Roll dice" button and play sound
        $("[data-control=roll]").on("click", () => {
            // rollDiceAudio.play();
            this.socketService.triggerTurn();
        });

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

        // trigger bankruptcy
        $("[data-control=bankruptcy]").on("click", () => {
            this.socketService.declareBankruptcy();
        });

        this._initMortage();
        this._initUnmortage();
        this._initTradeModal();
    }


    // Modals

    // define mortgage modal behaviour and content
    _initMortage () {

        let _this = this; // use in "_closeMortgageModal" method

        // open mortgage modal on clicking "Mortgage" button
        $("[data-control=mortgage]").on("click", () => {
            this.messengerService.send(MESSAGES.UI_OPEN_MORTGAGE_MODAL);
        });

        // select/ deselect property to be mortgaged
        $("[data-modal-type=mortgage-properties] [data-my-properties]").on("click", ".mortgage-modal--property", e => {
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

    // define unmortgage modal behaviour and content
    _initUnmortage () {

        let _this = this; // use in "_closeUnmortgageModal" method

        // open unmortgage modal on clicking "Mortgage" button
        $("[data-control=unmortgage]").on("click", () => {
            this.messengerService.send(MESSAGES.UI_OPEN_UNMORTGAGE_MODAL);
        });

        // select/ deselect property to be unmortgaged
        $("[data-modal-type=unmortgage-properties] [data-my-properties]").on("click", ".mortgage-modal--property", e => {
            let prop = $(e.target),
                propId = prop.attr("data-property-id");

            let index = this.propertiesForUnmortgage.indexOf(propId);

            if (index < 0) {
                this.propertiesForUnmortgage.push(propId);
                $(prop).removeClass("property-mortgaged");
            } else {
                this.propertiesForUnmortgage.splice(index, 1);
                $(prop).addClass("property-mortgaged");
            }
        });

        // request unmortgage on clicking "Unmortgage" button in modal
        $("[data-modal-type=unmortgage-properties] [data-modal-button=unmortgage]").on("click", () => {
            if (this.propertiesForUnmortgage.length) {
                this.socketService.requestUnmortgage(this.propertiesForUnmortgage);
            }
            _closeUnmortgageModal();
        });

        // cancel & close unmortgage modal
        $("[data-modal-type=unmortgage-properties] [data-modal-button=cancel]").on("click", () => {
            _closeUnmortgageModal();
        });

        function _closeUnmortgageModal () {
            // hide modal
            $("[data-modal-type=unmortgage-properties]").removeClass("show-modal");
            // empty array
            _this.propertiesForUnmortgage = [];
            // empty property list
            $("[data-modal-type=unmortgage-properties] [data-my-properties]").empty();
        }

    }

    _initTradeModal () {

        let _this = this; // use in "_closeTradeModal" method

        // open trade modal on clicking "Trade" button
        $("[data-control=trade]").on("click", () => {
            this.messengerService.send(MESSAGES.UI_OPEN_TRADE_MODAL);
        });

        // propose trade on clicking "Offer" button
        $("[data-modal-type=initiate-trade] [data-modal-button=offer]").on("click", () => {

            // can trade only with an opponent player
            if (!this.tradeWithPlayerId || this.tradeWithPlayerId === this.playerName) {
                alert("Select a player to trade with, dumbass!");
                return;
            }

            let offered = {
                squares: this.propertiesOfferedForTrade,
                cash: this.cashOfferedForTrade
            };
            let requested = {
                squares: this.propertiesRequestedForTrade,
                cash: this.cashRequestedForTrade
            };

            this.socketService.proposeTrade(this.tradeWithPlayerId, offered, requested);

            _closeTradeModal();

        });

        // close trade modal on clicking "Cancel" button
        $("[data-modal-type=initiate-trade] [data-modal-button=cancel]").on("click", () => {
            _closeTradeModal();
        });

        // display player list on clicking "Trade with different player" button
        $("[data-modal-type=initiate-trade] [data-modal-button=back]").on("click", () => {
            // reset tradeWithPlayerId
            this.tradeWithPlayerId = "";
            // show player list
            $("[data-modal-type=initiate-trade] [data-player-list]").show();
            // hide self & opponent property lists
            $("[data-modal-type=initiate-trade] [data-my-properties]").hide();
            $("[data-modal-type=initiate-trade] [data-opponent-properties]").hide();
        });

        // select/ deselect property to be offered
        $("[data-modal-type=initiate-trade] [data-my-properties]").on("click", "[data-property-id]", e => {
            let prop = $(e.target),
                propId = parseInt(prop.attr("data-property-id"));

            let index = this.propertiesOfferedForTrade.indexOf(propId);

            if (index < 0) {
                this.propertiesOfferedForTrade.push(propId);
                $(prop).addClass("property-mortgaged");
            } else {
                this.propertiesOfferedForTrade.splice(index, 1);
                $(prop).removeClass("property-mortgaged");
            }
        });

        // select/ deselect property to be requested
        $("[data-modal-type=initiate-trade] [data-opponent-properties]").on("click", "[data-property-id]", e => {
            let prop = $(e.target),
                propId = parseInt(prop.attr("data-property-id"));

            let index = this.propertiesRequestedForTrade.indexOf(propId);

            if (index < 0) {
                this.propertiesRequestedForTrade.push(propId);
                $(prop).addClass("property-mortgaged");
            } else {
                this.propertiesRequestedForTrade.splice(index, 1);
                $(prop).removeClass("property-mortgaged");
            }
        });

        // cash to be offered
        $("[data-modal-type=initiate-trade] [data-my-properties]").on("keyup", "#cashOfferedForTrade", e => {
            let cash = $("#cashOfferedForTrade").val();
            $("#cashOfferedForTrade").val(cash >= 0 ? cash : 0);
            this.cashOfferedForTrade = parseInt(cash) || 0;
        });

        // cash to be requested
        $("[data-modal-type=initiate-trade] [data-opponent-properties]").on("keyup", "#cashRequestedForTrade", e => {
            let cash = $("#cashRequestedForTrade").val();
            $("#cashRequestedForTrade").val(cash >= 0 ? cash : 0);
            this.cashRequestedForTrade = parseInt(cash) || 0;
        });

        function _closeTradeModal () {
            // hide modal
            $("[data-modal-type=initiate-trade]").removeClass("show-modal");
            // reset tradeWithPlayerId
            _this.tradeWithPlayerId = "";
            // empty array
            _this._resetTradeProposal();
            // empty property list
            $("[data-modal-type=initiate-trade] [data-my-properties]").empty();
        }

    }

    // reset properties & cash to be traded
    _resetTradeProposal() {
        this.propertiesOfferedForTrade = [];
        this.propertiesRequestedForTrade = [];
        this.cashOfferedForTrade = 0;
        this.cashRequestedForTrade = 0;
    }


    // Chat

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


    // Game grid

    // construct all squares in grid
    _constructSquares (squares, propertyCodes) {
        for (let i = 0, noOfSquares = 40; i < noOfSquares; i++) {
            switch (squares[i].type) {
                case "PROPERTY":
                    this._constructPropertySquare(i, squares[i].propertyName, propertyCodes[squares[i].propertyGroupId].color, squares[i].price, squares[i].rent, squares[i].mortgage);
                    break;
                case "TREASURE":
                    this._constructTreasureSquare(i);
                    break;
                default:
                    $("[data-square-id=" + i + "]").html(squares[i].type);
            }
        }
    }

    _constructPropertySquare (id, name, color, price, rent, mortgage) {
        // determine exact square from "id"
        let elm = $("[data-square-id=" + id + "]");

        let contents = `
        <div class='property-band' style='background-color: ` + color + `'></div>
        <div class='property-name'>` + name + `</div>
        <div class='property-price'>$` + price + ` / $` + rent + `</div>
        <div class='mortgaged-view'>
            <div>` + name + `</div>
            <div>$ ` + mortgage + `</div>
        </div>
        `;

        elm.html(contents);
    }

    _constructTreasureSquare (id) {
        // determine exact square from "id"
        let elm = $("[data-square-id=" + id + "]");

        elm.css({
            "background-color": "#ecf0f1"
        });

        // elm.html(contents);
    }

    _constructInfrastructureSquare (id) {
        // determine exact square from "id"
        let elm = $("[data-square-id=" + id + "]");
    }

    _constructUtilitySquare (id) {
        // determine exact square from "id"
        let elm = $("[data-square-id=" + id + "]");
    }
}
