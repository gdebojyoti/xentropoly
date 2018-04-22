import Game from "./game.js";
import MessengerService from "./services/messengerService.js";


var messenger;

$(function() {
    messenger = new MessengerService();
    new Game(messenger);

    window.requestAnimationFrame(step);

    function step () {
        messenger.update();
        window.requestAnimationFrame(step);
    }
});
