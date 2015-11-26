var audio = new window.Audio;

self.port.on('play', function(url) {
    audio.src = url;
    audio.play();

    audio.addEventListener('ended', function () {
        self.port.emit('ended');
    });
});

self.port.on('stop', function() {
    audio.pause();
});
