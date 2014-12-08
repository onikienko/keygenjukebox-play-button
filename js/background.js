(function () {
    var playlist = (function () {
            if (!localStorage.playlist || (Date.now() - 1000 * 60 * 60 * 24 * 2 > parseInt(localStorage.playlist_date_check, 10))) {
                getPlaylistInJSON(function () {

                });
            }
            return localStorage.playlist ? JSON.parse(localStorage.playlist) : [];
        })(),
        is_playing = false,
        audio = new Audio();

    function checkPlaylist() {
        if (!localStorage.playlist || (Date.now() - 1000 * 60 * 60 * 24 * 2 > parseInt(localStorage.playlist_date_check, 10))) {
            getPlaylistInJSON(function () {

            });
        }
    }

    function getPlaylistInJSON(cb) {
        var xhr = new XMLHttpRequest(),
            playlist_url = 'http://keygenjukebox.com/playlist.xspf',
            xspf;

        xhr.open('GET', 'http://xspfy.com/json?url=' + playlist_url, true);
        xhr.onreadystatechange = function () {
            if (xhr.readyState == 4) {
                xspf = JSON.parse(xhr.responseText);
                if (xspf) {
                    playlist = xspf.playlist.track;
                    if (playlist && playlist.length > 1) {
                        localStorage.playlist_date_check = Date.now();
                        localStorage.playlist = JSON.stringify(playlist);
                    }
                    return playlist;
                }
            }
        };
        xhr.send();
    }

    function shufflePlaylist() {
        for (var j, x, i = playlist.length; i; j = Math.floor(Math.random() * i), x = playlist[--i], playlist[i] = playlist[j], playlist[j] = x);
    }

    chrome.runtime.onInstalled.addListener(function (details) {
        switch (details) {
            case 'installed':
                getPlaylistInJSON();
                break;
        }

    });

    chrome.browserAction.onClicked.addListener(function () {
        var track_no = 0;

        function play() {
            audio.src = playlist[track_no].location;
            audio.play();
            chrome.browserAction.setTitle({title: playlist[track_no].title})
        }

        if (!is_playing) {
            shufflePlaylist();
            play();
            audio.addEventListener('ended', function () {
                if (track_no < playlist.length) {
                    ++track_no;
                    play();
                }
            });
            is_playing = true;
        } else {
            audio.pause();
            is_playing = false;
        }
    });

})();