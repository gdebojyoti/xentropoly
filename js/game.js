import UiService from "./services/uiService.js";
import SocketService from "./services/socketService.js";
import Player from "./models/player.js";
import MESSAGES from "./enums/messages.js";

class Game {
    constructor(messenger) {
        this.messenger = messenger;
        this.socketService = new SocketService(messenger);
        this.uiService = new UiService(this.messenger, this.socketService);

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
        this._initPlayer();
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
        this.messenger.observe(MESSAGES.POPULATE_MAP_DATA, data => {
            this._initializeUi(data.mapData);
        });

        this.messenger.observe(MESSAGES.JOINED_SESSION, data => {
            this._updatePlayerList(data.players);
            this._updatePlayerDetails(data);
        });
        this.messenger.observe(MESSAGES.INVALID_TURN, () => {
            alert("Wait for you turn, bitch!");
        });
        this.messenger.observe(MESSAGES.OFFER_BUY_PROPERTY, data => {
            this._offerBuyProperty(data);
        });
        this.messenger.observe(MESSAGES.PROPERTY_PURCHASED, data => {
            this._propertyPurchased(data);
        });
        this.messenger.observe(MESSAGES.RENT_PAID, data => {
            this._rentPaid(data);
        });

        this.messenger.observe(MESSAGES.TRADE_PROPOSAL_RECEIVED, data => {
            this._tradeProposalReceived(data);
        });
        this.messenger.observe(MESSAGES.TRADE_SUCCESSFUL, data => {
            this._tradeSuccessful(data);
        });

        this.messenger.observe(MESSAGES.MOVE_TO_POSITION, data => {
            this._movePlayerToPosition(data);
        });

        this.messenger.observe(MESSAGES.UI_OPEN_TRADE_MODAL, () => {
            this._uiOpenTradeModal();
        });
        this.messenger.observe(MESSAGES.UI_OPEN_MORTGAGE_MODAL, () => {
            this._uiOpenMortgageModal();
        });
        this.messenger.observe(MESSAGES.UI_OPEN_UNMORTGAGE_MODAL, () => {
            this._uiOpenUnmortgageModal();
        });
        this.messenger.observe(MESSAGES.UI_OPEN_CONSTRUCT_HOUSE_MODAL, () => {
            this._uiOpenConstructHouseModal();
        });
        this.messenger.observe(MESSAGES.UI_TRIGGER_STRUCTURE_CONSTRUCTION, data => {
            this._uiStructureConstruction(data);
        });
        this.messenger.observe(MESSAGES.PROPERTY_MORTGAGED, data => {
            this._uiPropertyMortgaged(data);
        });
        this.messenger.observe(MESSAGES.PROPERTY_UNMORTGAGED, data => {
            this._uiPropertyUnmortgaged(data);
        });
    }

    _initPlayer() {
        if (this.hostName) {
            // join game of another player if host is available
            this.socketService.joinGame(this.playerName, this.hostName);
        } else {
            // host a new game if no host name is provided
            this.socketService.hostGame(this.playerName);
        }
    }

    // construct map
    _initializeUi(data) {
        this.mapData = data;

        this.uiService.initialize(this.mapData, this.playerName);
    }

    // update player list; triggered when a new player joins the session
    _updatePlayerList (players) {
        // add all new players, including host, to playersData
        Object.keys(players).forEach(playerId => {
            if (!this.playersData[playerId]) {
                players[playerId].name = playerId;
                players[playerId].color = this.playerColorCodes.shift();

                let playerDetails = new Player(players[playerId]);
                this.playersData[playerId] = playerDetails;

                this.uiService.updatePlayerList(playerDetails);
            }
        });
    }

    _updatePlayerDetails (data) {
        // assign owners of applicable squares
        for (let square of data.room.squares) {
            if (square.owner && this.playersData[square.owner]) {
                this.playersData[square.owner].assignSquare(square.id);
            }
        }
    }

    // move a player to position
    _movePlayerToPosition (data) {
        if (this.playersData[data.player]) {
            this.playersData[data.player].moveToPosition(data.position);
        } else {
            console.log("Player not found", data.player);
        }
    }

    // offer current player the chance to buy property at data.squareId
    _offerBuyProperty (data) {
        let propertyName = this.mapData.squares[data.squareId].propertyName;
        let propertyPrice = this.mapData.squares[data.squareId].price;

        this.uiService.offerBuyProperty(propertyName, propertyPrice);
    }

    // assign property square to player
    _propertyPurchased (data) {
        // exit if player not found in player list
        if (!this.playersData[data.playerId]) {
            return;
        }

        // deduct price of property from playerId
        let price = this.mapData.squares[data.squareId].price;
        this.playersData[data.playerId].removeFunds(price);

        // assign square to player
        this.playersData[data.playerId].assignSquare(data.squareId);

        this.uiService.updatePlayerList({
            name: data.playerId,
            cash: this.playersData[data.playerId].getCurrentCash(),
            squares: this.playersData[data.playerId].getCurrentSquares()
        });

        let color = this.playersData[data.playerId].getColor();

        this.uiService.updateSquareOwner(data.squareId, color);
    }

    // rent paid by payee to owner
    _rentPaid (data) {
        const { owner, payee, rent } = data;
        
        this.playersData[owner].addFunds(rent);
        this.playersData[payee].removeFunds(rent);

        this.uiService.updatePlayerList({
            name: owner,
            cash: this.playersData[owner].getCurrentCash(),
            squares: this.playersData[owner].getCurrentSquares()
        });

        this.uiService.updatePlayerList({
            name: payee,
            cash: this.playersData[payee].getCurrentCash(),
            squares: this.playersData[payee].getCurrentSquares()
        });
    }

    _tradeProposalReceived (data) {
        // ignore if proposal is not meant for current player
        if (data.proposedTo !== this.playerName) {
            return;
        }

        this.uiService.tradeProposalReceived(data.proposedBy);
    }

    _tradeSuccessful (data) {
        if (!this.playersData[data.proposedBy] || !this.playersData[data.proposedTo]) {
			console.error ("Missing player data", this.playersData[data.proposedBy], this.playersData[data.proposedTo]);
			return;
		}

		// assign requested squares to "proposedBy" player; unassign from "proposedTo"; update mark color on squares
		data.requested.squares.forEach(squareId => {
			this.playersData[data.proposedBy].assignSquare(squareId);
			this.playersData[data.proposedTo].unassignSquare(squareId);

			let color = this.playersData[data.proposedBy].getColor();
			this.uiService.updateSquareOwner(squareId, color);
		});

		// add net requested funds to "proposedBy" player
		this.playersData[data.proposedBy].addFunds(data.requested.cash - data.offered.cash);

		// assign offered squares to "proposedTo" player; unassign from "proposedBy"; update mark color on squares
		data.offered.squares.forEach(squareId => {
			this.playersData[data.proposedTo].assignSquare(squareId);
			this.playersData[data.proposedBy].unassignSquare(squareId);

			let color = this.playersData[data.proposedTo].getColor();
			this.uiService.updateSquareOwner(squareId, color);
		});

		// add net offered funds to "proposedTo" player
		this.playersData[data.proposedTo].addFunds(data.offered.cash - data.requested.cash);

        this.uiService.updatePlayerList({
            name: data.proposedBy,
            cash: this.playersData[data.proposedBy].getCurrentCash(),
            squares: this.playersData[data.proposedBy].getCurrentSquares()
        });

        this.uiService.updatePlayerList({
            name: data.proposedTo,
            cash: this.playersData[data.proposedTo].getCurrentCash(),
            squares: this.playersData[data.proposedTo].getCurrentSquares()
        });
    }

    // open trade modal, showing available players
    _uiOpenTradeModal () {
        this.uiService.openTradeModal(this.mapData, this.playersData);
    }

    // open mortgage modal, showing current player's properties
    _uiOpenMortgageModal () {
        this.uiService.openMortgageModal(this.mapData, this.playersData[this.playerName]);
    }

    // open unmortgage modal, showing current player's properties
    _uiOpenUnmortgageModal () {
        this.uiService.openUnmortgageModal(this.mapData, this.playersData[this.playerName]);
    }

    // open unmortgage modal, showing current player's properties
    _uiOpenConstructHouseModal () {
        this.uiService.openConstructHouseModal(this.mapData, this.playersData[this.playerName]);
    }

    // determine if structure can be constructed; if yes, send data to server & update UI
    _uiStructureConstruction (data) {
        const { structureId, structureParentId } = data;
        console.log(structureId, structureParentId);

        let newStructures = {}

        // check if canNewStructureBeBuilt
        const check = canNewStructureBeBuilt.call(this, structureParentId, structureId)
        // if true, add to builtStructures, newStructures & update UI
        // send newStructures to server
    }

    // mark properties as mortgaged, add funds to player, update bottom list
    _uiPropertyMortgaged (data) {
        this.uiService.propertyMortgaged(data.squares);

        // mark each square as mortgaged
        data.squares.forEach(squareId => {
            this.mapData.squares[squareId].isMortgaged = true
        })

        // add funds from mortgaging to player
		this.playersData[data.playerId].addFunds(data.cash);

        this.uiService.updatePlayerList({
            name: data.playerId,
            cash: this.playersData[data.playerId].getCurrentCash(),
            squares: this.playersData[data.playerId].getCurrentSquares()
        });
    }

    // unmark properties as mortgaged, remove funds from player, update bottom list
    _uiPropertyUnmortgaged (data) {
        this.uiService.propertyUnmortgaged(data.squares);

        // mark each square as unmortgaged
        data.squares.forEach(squareId => {
            this.mapData.squares[squareId].isMortgaged = false
        })

        // remove funds for paying off mortgage from player
        this.playersData[data.playerId].removeFunds(data.cash);

        this.uiService.updatePlayerList({
            name: data.playerId,
            cash: this.playersData[data.playerId].getCurrentCash(),
            squares: this.playersData[data.playerId].getCurrentSquares()
        });
    }
}

function canNewStructureBeBuilt (structureParentId, newStructureId) {
    // get type & structureParentId from newStructureId
    console.log(this.mapData)
    const propertyGroupId = this.mapData.squares[structureParentId].propertyGroupId
    if (!propertyGroupId) {
        return false;
    }

    // check if player owns all properties of same type
    const check = this.playersData[this.playerName].checkIfOwnsAllPropertiesOfSameType(this.mapData, propertyGroupId);
    console.log(check);
    if (!check) {
        return false;
    }
    
    // if true, check if doPreviousStructuresExist
    const check2 = doPreviousStructuresExist.call(this, structureParentId, newStructureId, propertyGroupId)
    // if both are true, return true; else return false
    
    return true;
}

function doPreviousStructuresExist (structureParentId, newStructureId, type) {
    // fetch all squares of same type from player
    const squares = this.playersData[this.playerName].getSquaresOfSameType(this.mapData.squares, type);
    
    // check if each of those squares have structures built up to newStructureId
    if (newStructureId > 1) {
        for (let square of squares) {
            for (let i = 1; i < newStructureId; i++) {
                if (!this.builtStructures[square] || this.builtStructures[square].indexOf(i) === -1) {
                    return false;
                }
            }
        }
    }

    return true;
}

export default Game;