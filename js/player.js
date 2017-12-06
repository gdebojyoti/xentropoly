class Player {
    constructor() {
        this.position = 0;
        this.cash = 1500;
    }

    // get current position of player
    getCurrentPosition() {
        return this.position;
    }

    // move the player by certain number of "spaces"
    moveToPosition(squareId) {
        this.position = squareId;

        let coods = this._fetchSquareCenterCoordinates(this.position);

        $("#player").css({
            "left": coods[0] + "px",
            "top": coods[1] + "px"
        });
    }

    // will the user buy property
    buyProperty(name, price) {
        return confirm("Buy " + name + " for $" + price + "?");
    }

    // remove funds from player
    removeFunds(amount) {
        this.cash -= amount;
    }


    /* Private methods */

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
