class SocketService {
    constructor(messenger) {
        this.messenger = messenger;

        this.socket = io.connect(ENV.BACKEND_URL);

        var el = document.getElementById('server-time');
        this.socket.on('time', function(timeString) {
            el.innerHTML = 'Server time: ' + timeString;
        });

        this.socket.on("GAME_CREATED", data => this._gameCreated(data));
        this.socket.on("GAME_JOINED", data => this._gameJoined(data));
        this.socket.on("JOINED_SESSION", data => this._joinedSession(data));

        this.socket.on("SESSION_NOT_FOUND", data => console.log(data));
        this.socket.on("HOST_NOT_FOUND", data => console.log(data));

        this.socket.on("CHAT_MESSAGE_RECEIVED", data => this._chatMessageReceived(data));

        this.socket.on("PLAYER_MOVED", data => this._playerMoved(data));
        this.socket.on("INVALID_TURN", () => this._invalidTurn());
        this.socket.on("OFFER_BUY_PROPERTY", data => this._offerBuyProperty(data));
        this.socket.on("PROPERTY_PURCHASED", data => this._propertyPurchased(data));
        this.socket.on("RENT_PAID", data => this._rentPaid(data));

        this.socket.on("TRADE_PROPOSAL_RECEIVED", data => this._tradeProposalReceived(data));
        this.socket.on("TRADE_SUCCESSFUL", data => this._tradeSuccessful(data));

        this.socket.on("PROPERTY_MORTGAGED", data => this._propertyMortgaged(data));
        this.socket.on("PROPERTY_UNMORTGAGED", data => this._propertyUnmortgaged(data));
    }


    /* Public methods */

    hostGame(playerId) {
        this.socket.emit("HOST_GAME", {
            playerId: playerId
        });
    }

    joinGame(playerId, hostPlayerId) {
        this.socket.emit("JOIN_GAME", {
            playerId: playerId,
            hostPlayerId: hostPlayerId
        });
    }

    triggerTurn() {
        this.socket.emit("TRIGGER_TURN");
    }

    propertyBuyOfferResponded(isPropertyPurchased) {
        this.socket.emit("PROPERTY_PURCHASED", {
            response: isPropertyPurchased
        });
    }

    // propose a trade with tradeWithPlayerId
    proposeTrade(tradeWithPlayerId, offered, requested) {
        this.socket.emit("TRADE_PROPOSAL_INITIATED", {
            tradeWithPlayerId: tradeWithPlayerId,
            offered: offered,
            requested: requested
        });
    }

    // proposal accepted or declined
    tradeProposalResponded(isProposalAccepted) {
        this.socket.emit("TRADE_PROPOSAL_RESPONDED", {
            response: isProposalAccepted
        });
    }

    // request for a property to be mortgaged
    requestMortgage(squares) {
        this.socket.emit("REQUEST_MORTGAGE", {
            squares: squares
        });
    }

    // request for a property mortgage to be paid off
    requestUnmortgage(squareId) {
        this.socket.emit("REQUEST_UNMORTGAGE", {
            squareId: squareId
        });
    }

    // send chat message
    sendChatMessage(msg) {
        this.socket.emit("CHAT_MESSAGE_SENT", {
            msg: msg
        });
    }


    /* Priate methods */

    _gameCreated(data) {
        console.log(data);

        // trigger message to generate map
        this.messenger.send(MESSAGES.POPULATE_MAP_DATA, {
            mapData: data.mapData
        });
    }

    _gameJoined(data) {
        console.log(data);

        // trigger message to generate map
        this.messenger.send(MESSAGES.POPULATE_MAP_DATA, {
            mapData: data.mapData
        });
    }

    _joinedSession(data) {
        console.log(data);

        // trigger message to move player
        this.messenger.send(MESSAGES.JOINED_SESSION, {
            playerId: data.playerId,
            players: data.players,
            room: data.room
        });
    }

    _chatMessageReceived(data) {
        this.messenger.send(MESSAGES.UI_CHAT_MESSAGE_RECEIVED, {
            sender: data.sender,
            msg: data.msg
        });
    }

    _playerMoved(data) {
        console.log(data);

        // trigger message to move player
        this.messenger.send(MESSAGES.MOVE_TO_POSITION, {
            player: data.player,
            position: data.position
        });
    }

    _invalidTurn() {
        this.messenger.send(MESSAGES.INVALID_TURN);
    }

    _offerBuyProperty(data) {
        this.messenger.send(MESSAGES.OFFER_BUY_PROPERTY, {
            squareId: data.squareId
        });
    }

    _propertyPurchased(data) {
        console.info(data.msg);

        this.messenger.send(MESSAGES.PROPERTY_PURCHASED, {
            playerId: data.buyer,
            squareId: data.squareId
        });
    }

    _rentPaid(data) {
        console.info(data.msg);

        this.messenger.send(MESSAGES.RENT_PAID, {
            owner: data.owner,
            payee: data.payee,
            rent: data.rent
        });
    }

    _tradeProposalReceived(data) {
        console.info(data.msg);
        console.log(data);

        this.messenger.send(MESSAGES.TRADE_PROPOSAL_RECEIVED, {
            proposedBy: data.proposedBy,
            proposedTo: data.proposedTo,
            offered: data.offered,
            requested: data.requested
        });
    }

    _tradeSuccessful(data) {
        console.info(data.msg);

        this.messenger.send(MESSAGES.TRADE_SUCCESSFUL, {
            proposedBy: data.tradeData.proposedBy,
            proposedTo: data.tradeData.proposedTo,
            offered: data.tradeData.offered,
            requested: data.tradeData.requested
        });
    }

    _propertyMortgaged(data) {
        console.log(data.msg);

        this.messenger.send(MESSAGES.PROPERTY_MORTGAGED, {
            playerId: data.playerId,
            squares: data.squares,
            cash: data.cash
        });
    }

    _propertyUnmortgaged(data) {
        console.log(data.msg);

        this.messenger.send(MESSAGES.PROPERTY_UNMORTGAGED, {
            playerId: data.playerId,
            squareId: data.squareId
        });
    }
}
