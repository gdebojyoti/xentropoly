class SocketService {
    constructor(messenger) {
        this.messenger = messenger;

        this.socket = io.connect(ENV.BACKEND_URL);

        var el = document.getElementById('server-time');
        this.socket.on('time', function(timeString) {
            el.innerHTML = 'Server time: ' + timeString;
        });

        this.socket.on("GAME_CREATED", this._gameCreated);
        this.socket.on("GAME_JOINED", this._gameJoined);
        this.socket.on("JOINED_SESSION", data => this._joinedSession(data));

        this.socket.on("PLAYER_MOVED", data => this._playerMoved(data));
        this.socket.on("INVALID_TURN", () => this._invalidTurn());
        this.socket.on("OFFER_BUY_PROPERTY", data => this._offerBuyProperty(data));
        this.socket.on("PROPERTY_PURCHASED", data => this._propertyPurchased(data));
        this.socket.on("RENT_PAID", data => this._rentPaid(data));

        this.socket.on("TRADE_PROPOSAL_RECEIVED", data => this._tradeProposalReceived(data));
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
    proposeTrade(tradeWithPlayerId, offer, receive) {
        this.socket.emit("TRADE_PROPOSAL_INITIATED", {
            tradeWithPlayerId: tradeWithPlayerId,
            offer: offer,
            receive: receive
        });
    }

    // proposal accepted or declined
    tradeProposalResponded(isProposalAccepted) {
        this.socket.emit("TRADE_PROPOSAL_RESPONDED", {
            response: isProposalAccepted
        });
    }


    /* Priate methods */

    _gameCreated(data) {
        console.log(data);
    }

    _gameJoined(data) {
        console.log(data);
    }

    _joinedSession(data) {
        console.log(data);

        // trigger message to move player
        this.messenger.send(MESSAGES.JOINED_SESSION, {
            playerId: data.playerId,
            players: data.players
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
            offer: data.offer,
            receive: data.receive
        });
    }
}
