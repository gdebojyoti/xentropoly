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
            playerId: data.playerId
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
        let propertyBought = confirm("Buy " + data.name + " for " + data.price + "?");
        this.socket.emit("PROPERTY_PURCHASED", {
            response: propertyBought
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
        console.log(data.msg);
    }
}
