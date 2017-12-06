class Player {
    constructor() {
        this.position = 0;
        this.cash = 1500;
    }

    // move the player by certain number of "spaces"
    moveToPositionBy(spaces) {
        this.position += spaces;

        if (this.position > 39) {
            this.position -= 40;
        }

        let coods = this._fetchSquareCenterCoordinates(this.position);

        $("#player").css({
            "left": coods[0] + "px",
            "top": coods[1] + "px"
        });

        console.log(spaces, this.position);
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
