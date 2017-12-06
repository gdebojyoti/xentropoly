var messenger;

$(function() {
    // var socket = io.connect('https://monopoly-backend.herokuapp.com/');
    // var socket = io.connect('http://localhost:3000/');

    // var el = document.getElementById('server-time');
    // socket.on('time', function(timeString) {
    //     el.innerHTML = 'Server time: ' + timeString;
    // });

    messenger = new Messenger();
    let game = new Game(messenger);

    window.requestAnimationFrame(step);

    function step () {
        messenger.update();
        window.requestAnimationFrame(step);
    }
});
