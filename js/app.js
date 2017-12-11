var messenger;

$(function() {
    messenger = new MessengerService();
    let game = new Game(messenger);

    window.requestAnimationFrame(step);

    function step () {
        messenger.update();
        window.requestAnimationFrame(step);
    }
});
