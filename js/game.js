class Game {
    constructor(messenger) {
        this.messenger = messenger;
        this.socketService = new SocketService(messenger);

        this.playerName = ""; // username of player
        this.hostName = ""; // username of host player to join, if any

        this.server = null;

        this.mapData = null;

        this._getClientDetails();

        this._observe();
        this._loadData();
    }


    /* Private methods */

    // fetch client name (or create name from current timestamp) and host name from URL
    _getClientDetails() {
        // parse search parameters in URL
        let query = location.search.substr(location.search.indexOf("?") + 1).split("&"),
            queries = {};

        for (let i = 0; i < query.length; i++) {
            queries[query[i].substr(0, query[i].indexOf("="))] = query[i].substr(query[i].indexOf("=") + 1);
        }

        this.playerName = queries.name || "p" + Date.now();
        this.hostName = queries.join;
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
                    this.socketService.triggerTurn();
                });

                // ready to play
                $("#loader").fadeOut(200);
                console.log("Ready to play!");

                if (this.hostName) {
                    // join game of another player if host is available
                    this.socketService.joinGame(this.playerName, this.hostName);
                } else {
                    // host a new game if no host name is provided
                    this.socketService.hostGame(this.playerName);
                }
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
