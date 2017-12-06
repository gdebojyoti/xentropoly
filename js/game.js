class Game {
    constructor() {
        this.playerName = "dexter";
        this.server = null;

        this._loadData();
    }


    /* Private methods */

    // load json data
    _loadData() {
        $.getJSON(
            'data/international.json',
            data => {
                // mapData = data;

                if (this._isDataInvalid(data)) {
                    return;
                }

                // design all squares
                this._constructSquares(data.squares, data.propertyCodes);

                // initialize server
                this.server = new Server(data);
                this.server.addNewPlayer(this.playerName);

                let rollDiceAudio = new Audio("assets/audio/rollDice.mp3");

                $("[data-square-id=0]").on("click", () => {
                    rollDiceAudio.play();
                    this.server.triggerTurn(this.playerName);
                });

                // ready to play
                $("#loader").fadeOut(200);
                console.log("Ready to play!");
            }
        );
    }

    // check if data is invalid
    _isDataInvalid (data) {
        if (data.squares.length !== 40) {
            alert("Incorrect configuration: Number of squares should be exactly 40.\nExiting...");
            return true;
        }

        return false;
    }

    // construct all squares in grid
    _constructSquares (squares, propertyCodes) {
        for (var i = 0, noOfSquares = 40; i < noOfSquares; i++) {
            switch (squares[i].type) {
                case "PROPERTY":
                    this._constructPropertySquare(i, squares[i].propertyName, propertyCodes[squares[i].propertyGroupId].color, squares[i].price, squares[i].rent);
                    break;
                case "TREASURE":
                    this._constructTreasureSquare(i);
                    break;
                default:
                    $("[data-square-id=" + i + "]").html(squares[i].type);
            }
        }
    }

    _constructPropertySquare (id, name, color, price, rent) {
        // determine exact square from "id"
        var elm = $("[data-square-id=" + id + "]");

        var contents = `
        <div class='property-band' style='background-color: ` + color + `'></div>
        <div class='property-name'>` + name + `</div>
        <div class='property-price'>$` + price + ` / $` + rent + `</div>
        `;

        elm.html(contents);
    }

    _constructTreasureSquare (id) {
        // determine exact square from "id"
        var elm = $("[data-square-id=" + id + "]");

        elm.css({
            "background-color": "#ecf0f1"
        });

        // elm.html(contents);
    }

    _constructInfrastructureSquare (id) {
        // determine exact square from "id"
        var elm = $("[data-square-id=" + id + "]");
    }

    _constructUtilitySquare (id) {
        // determine exact square from "id"
        var elm = $("[data-square-id=" + id + "]");
    }
}
