/* List of functions that are actually going to be running in the server side (node) */

class Server {
    constructor(data, messenger) {
        this.mapData = data;
        this.messenger = messenger;

        this.players = {};
    }


    /* Public methods */

    // add new player to game
    addNewPlayer(playerId) {
        if (this._isPlayerIdInvalid(playerId)) {
            return;
        }

        // initialize new player and move it to position 0
        this.players[playerId] = new Player(this.messenger);
        this.players[playerId].moveToPosition(0);

        console.log(this);
    }

    // roll dice; move player; execute card details
    triggerTurn(playerId) {
        // exit if player is invalid
        if (this._isInvalidPlayer(playerId)) {
            return;
        }

        // get sum of 2 dice rolls
        let spaces = this._rollDice();

        // add "spaces" to player's current position; after crossing 39, player goes to 0
        let newPosition = this.players[playerId].getCurrentPosition() + spaces;
        if (newPosition > 39) {
            newPosition -= 40;
        }

        // move player to computed position
        this.players[playerId].moveToPosition(newPosition);

        this._executeSquare(newPosition, playerId);
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
    _rollDice() {
        let dice1 = this._getRandomInt(1, 6),
            dice2 = this._getRandomInt(1, 6);

        return dice1 + dice2;
    }

    // generate random integer between "min" & "max" limits (inclusive)
    _getRandomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    // execute whatever is on square
    _executeSquare(squareId, playerId) {
        // get details of square
        let squareDetails = this.mapData.squares[squareId];
        switch (squareDetails.type) {
            // for property square: if unowned, opt to buy; if owned by others, pay rent
            case "PROPERTY":
                if (!squareDetails.owner) {
                    // offer player to buy property
                    let propertyBought = this.players[playerId].buyProperty(squareDetails.propertyName, squareDetails.price);
                    if (propertyBought) {
                        // assign property to player
                        squareDetails.owner = playerId;
                        // deduct funds from player
                        this.players[playerId].removeFunds(squareDetails.price);

                        this.messenger.send(MESSAGES.PROPERTY_PURCHASED, {
                            playerId: playerId,
                            propertyId: squareId
                        });
                    }
                } else if (squareDetails.owner !== playerId) {
                    let rent = squareDetails.rent;
                    console.log("Pay rent:", rent);
                    this.players[playerId].removeFunds(rent);
                }

                console.log(this.players[playerId]);
                break;
            default:
                console.log(squareDetails);
        }
    }
}
