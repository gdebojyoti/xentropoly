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
        this.cash += amount;
    }

    // remove funds from player
    removeFunds(amount) {
        this.cash -= amount;
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
