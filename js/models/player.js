class Player {
    constructor(player) {
        this.name = player.name;
        this.color = player.color;
        this.cash = player.cash || 1500;
        this.position = -1;
        this.squares = [];

        this._initializePlayerMarker();
        this.moveToPosition(player.position);
    }

    // get current position of player
    getCurrentPosition() {
        return this.position;
    }

    getCurrentCash() {
        return this.cash;
    }

    getCurrentSquares() {
        return this.squares;
    }

    getSquaresOfSameType(allSquares, type) {
        let squares = [];
        for (let squareId of this.squares) {
            if (allSquares[squareId].propertyGroupId === type) {
                squares.push(squareId);
            }
        }
        return squares;
    }

    getColor() {
        return this.color;
    }

    // move the player by certain number of "spaces"
    moveToPosition(squareId) {
        let oldPosition = this.position,
            newPosition = squareId,
            diff = (newPosition - oldPosition >= 0) ? (newPosition - oldPosition) : (40 + newPosition - oldPosition);

        let moveTimer = setInterval(() => {
            if (diff > 0) {
                this._moveBySingleSquare();
                diff--;
            } else {
                clearInterval(moveTimer);
                moveTimer = null;
            }
        }, 400);
    }

    // will the user buy property
    buyProperty(name, price) {
        return confirm("Buy " + name + " for $" + price + "?");
    }

    // add funds to player
    addFunds(amount) {
        amount = parseInt(amount) || 0;
        this.cash += amount;
    }

    // remove funds from player
    removeFunds(amount) {
        amount = parseInt(amount) || 0;
        this.cash -= amount;
    }

    // assign square to player
    assignSquare(squareId) {
        if (this.squares.indexOf(squareId) < 0) {
            this.squares.push(squareId);
        }
    }

    // unassign square from player
    unassignSquare(squareId) {
        let index = this.squares.indexOf(squareId);
        if (index >= 0) {
            this.squares.splice(index, 1);
        }
    }

    // check if player owns all properties of same type
    checkIfOwnsAllPropertiesOfSameType (mapData, type) {
        for (let square of mapData.squares) {
            if (square.propertyGroupId === type) {
                if (this.squares.indexOf(square.id) === -1) {
                    console.log(square.id)
                    return false;
                }
            }
        }
        return true;
    }


    /* Private methods */

    // create DOM element for player marker, store it inside #players
    _initializePlayerMarker() {
        let playerDomElm = "<div data-player='" + this.name + "' class='player' style='box-shadow: 0 0 0 2px #000, inset 0 0 0 2px " + this.color + ";'></div>";
        $("#players").append(playerDomElm);
    }

    // move player by one step at a time
    _moveBySingleSquare() {
        this.position = (this.position === 39) ? 0 : this.position + 1;

        let coods = this._fetchSquareCenterCoordinates(this.position);

        $("[data-player=" + this.name + "]").css({
            "left": coods[0] + "px",
            "top": coods[1] + "px"
        });
    }

    // fetch coordinates of center of square
    _fetchSquareCenterCoordinates(squareId) {
        // determine exact square from "squareId"
        let elm = $("[data-square-id=" + squareId + "]");

        // check for invalid square
        if (!elm.length) {
            return;
        }

        let offset = elm.offset(),
            width = elm.width(),
            height = elm.height(),

            centerX = offset.left + width / 2,
            centerY = offset.top + height / 2;

        return [centerX, centerY];
    }
}

export default Player;