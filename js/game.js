class Game {
    constructor(messenger) {
        this.messenger = messenger;
        this.socketService = new SocketService();

        this.playerName = "";
        this.server = null;

        this.mapData = null;

        this._getClientDetails();

        this._observe();
        this._loadData();
    }


    /* Private methods */

    // fetch client name from URL, or create name from current timestamp
    _getClientDetails() {
        let query = location.search;
        query = query.substr(query.indexOf("=") + 1);

        this.playerName = query || "p" + Date.now();
    }

    // observe messages
    _observe() {
        this.messenger.observe(MESSAGES.PROPERTY_PURCHASED, data => {
            let square = this.mapData.squares[data.propertyId];
            console.log(data.playerId, "purchased", square.propertyName, "for $" + square.price);
        });
    }

    // load json data
    _loadData() {
        $.getJSON(
            'data/international.json',
            data => {
                this.mapData = data;

                // exit if data is invalid
                if (this._isDataInvalid(data)) {
                    return;
                }

                // design all squares
                this._constructSquares(data.squares, data.propertyCodes);

                // initialize server
                this.server = new Server(data, this.messenger);
                this.server.addNewPlayer(this.playerName);

                // initialize roll dice audio
                let rollDiceAudio = new Audio("assets/audio/rolldice.mp3");

                // roll dice on clicking #0 and play sound
                $("[data-square-id=0]").on("click", () => {
                    rollDiceAudio.play();
                    this.server.triggerTurn(this.playerName);
                });

                // ready to play
                $("#loader").fadeOut(200);
                console.log("Ready to play!");

                // host a new game
                this.socketService.hostGame(this.playerName);
                // // join game of another player
                // this.socketService.joinGame(this.playerName, "D3XT3R");
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
