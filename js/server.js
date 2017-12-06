/* List of functions that are actually going to be running in the server side (node) */

class Server {
    constructor(data) {
        this.mapData = data;
        this.players = {};
    }


    /* Public methods */

    // add new player to game
    addNewPlayer(playerId) {
        if (this._isPlayerIdInvalid(playerId)) {
            return;
        }

        // initialize new player and move it to position 0
        this.players[playerId] = new Player();
        this.players[playerId].moveToPositionBy(0);

        console.log(this);
    }

    // roll dice; move player; execute card details
    triggerTurn(playerId) {
        // exit if player is invalid
        if (this._isInvalidPlayer(playerId)) {
            return;
        }

        let spaces = this._rollDice();
        this.players[playerId].moveToPositionBy(spaces);
    }


    /* Private methods */

    // check if player ID is invalid
    _isPlayerIdInvalid(playerId) {
        if (!playerId) {
            return true;
        }

        return false;
    }

    // check if player exists and is logged in
    _isInvalidPlayer(playerId) {
        if (!this.players[playerId]) {
            return true;
        }

        return false;
    }

    // get random integer between 2 & 12
    _rollDice(playerId) {
        let dice1 = this._getRandomInt(1, 6),
            dice2 = this._getRandomInt(1, 6);

        return dice1 + dice2;
    }

    // generate random integer between "min" & "max" limits (inclusive)
    _getRandomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
}
