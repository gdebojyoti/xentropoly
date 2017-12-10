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
        this.socket.on("JOINED_SESSION", this._joinedSession);

        this.socket.on("PLAYER_MOVED", data => this._playerMoved(data));
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
    }

    _playerMoved(data) {
        console.log(data);

        // trigger message to move player
        this.messenger.send(MESSAGES.MOVE_TO_POSITION, {
            position: data.position
        });
    }
}
