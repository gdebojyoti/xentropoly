class Game {
    constructor(messenger) {
        this.messenger = messenger;
        this.socketService = new SocketService(messenger);

        this.playerName = ""; // username of player
        this.hostName = ""; // username of host player to join, if any

        this.mapData = null;

        // store required details of all players
        this.playersData = {};
        this.samplePlayerDetails = {
            name: "",
            color: "",
            cash: 0,
            currentPosition: 0,
            squares: []
        };
        this.playerColorCodes = ["red", "blue", "yellow", "green", "brown"];

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
        this.messenger.observe(MESSAGES.JOINED_SESSION, data => {
            this._updatePlayerList(data.players);
        });
        this.messenger.observe(MESSAGES.INVALID_TURN, () => {
            alert("Wait for you turn, bitch!");
        });
        this.messenger.observe(MESSAGES.PROPERTY_PURCHASED, data => {
            this._propertyPurchased(data);
        });

        this.messenger.observe(MESSAGES.MOVE_TO_POSITION, data => {
            this._movePlayerToPosition(data);
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

    // update player list; triggered when a new player joins the session
    _updatePlayerList (players) {
        // add all new players, including host, to playersData
        Object.keys(players).forEach(playerId => {
            if (!this.playersData[playerId]) {
                players[playerId].name = playerId;
                players[playerId].color = this.playerColorCodes.shift();

                let playerDetails = new Player(players[playerId], this.messenger);
                this.playersData[playerId] = playerDetails;
            }
        });
    }

    // move a player to position
    _movePlayerToPosition (data) {
        if (this.playersData[data.player]) {
            this.playersData[data.player].moveToPosition(data.position);
        } else {
            console.log("Player not found", data.player);
        }
    }

    // assign property square to player
    _propertyPurchased (data) {
        // exit if player not found in player list
        if (!this.playersData[data.playerId]) {
            return;
        }

        let color = this.playersData[data.playerId].color;
        // determine exact square from "id"
        var elm = $("[data-square-id=" + data.squareId + "]");
        elm.append("<div class='property-owner' style='background-color: " + color + "'></div>");
    }
}
