var messenger;

$(function() {
    messenger = new Messenger();
    let game = new Game(messenger);

    window.requestAnimationFrame(step);

    function step () {
        messenger.update();
        window.requestAnimationFrame(step);
    }
});
