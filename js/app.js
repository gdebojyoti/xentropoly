$(function() {
    // var socket = io.connect('https://monopoly-backend.herokuapp.com/');
    // var socket = io.connect('http://localhost:3000/');

    // var el = document.getElementById('server-time');
    // socket.on('time', function(timeString) {
    //     el.innerHTML = 'Server time: ' + timeString;
    // });

    var playerName = "dexter",
        mapData,
        server;

    $.getJSON(
        'data/international.json',
        function (data) {
            mapData = data;

            if (isDataInvalid(data)) {
                return;
            }

            // design all squares
            constructSquares(data.squares, data.propertyCodes);

            // initialize server
            server = new Server(data);
            server.addNewPlayer(playerName);

            $("[data-square-id=0]").on("click", function() {
                server.triggerTurn(playerName);
            });

            // ready to play
            $("#loader").fadeOut(200);
            console.log("Ready to play!");
        }
    );
});

function isDataInvalid (data) {
    if (data.squares.length !== 40) {
        alert("Incorrect configuration: Number of squares should be exactly 40.\nExiting...");
        return true;
    }

    return false;
}

function constructSquares (squares, propertyCodes) {
    for (var i = 0, noOfSquares = 40; i < noOfSquares; i++) {
        switch (squares[i].type) {
            case "PROPERTY":
                constructPropertySquare(i, squares[i].propertyName, propertyCodes[squares[i].propertyGroupId].color, squares[i].price, squares[i].rent);
                break;
            case "TREASURE":
                constructTreasureSquare(i);
                break;
            default:
                $("[data-square-id=" + i + "]").html(squares[i].type);
        }
    }
}

function constructPropertySquare (id, name, color, price, rent) {
    // determine exact square from "id"
    var elm = $("[data-square-id=" + id + "]");

    var contents = `
    <div class='property-band' style='background-color: ` + color + `'></div>
    <div class='property-name'>` + name + `</div>
    <div class='property-price'>$` + price + ` / $` + rent + `</div>
    `;

    elm.html(contents);
}

function constructTreasureSquare (id) {
    // determine exact square from "id"
    var elm = $("[data-square-id=" + id + "]");

    elm.css({
        "background-color": "#ecf0f1"
    });

    // elm.html(contents);
}

function constructInfrastructureSquare (id) {
    // determine exact square from "id"
    var elm = $("[data-square-id=" + id + "]");
}

function constructUtilitySquare (id) {
    // determine exact square from "id"
    var elm = $("[data-square-id=" + id + "]");
}
