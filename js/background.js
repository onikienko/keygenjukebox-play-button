(function () {
    var playlist = localStorage.playlist ? JSON.parse(localStorage.playlist) : [],
        is_playing = false,
        audio = new Audio();

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
                    cb && cb();
                }
            }
        };
        xhr.send();
    }

    function checkPlaylist(cb) {
        if (!localStorage.playlist || (Date.now() - 1000 * 60 * 60 * 24 * 7 > parseInt(localStorage.playlist_date_check, 10))) {
            getPlaylistInJSON(function () {
                cb && cb();
            });
        } else {
            cb && cb();
        }
    }

    function shufflePlaylist() {
        for (var j, x, i = playlist.length; i; j = Math.floor(Math.random() * i), x = playlist[--i], playlist[i] = playlist[j], playlist[j] = x);
    }

    chrome.browserAction.onClicked.addListener(function () {
        var track_no = 0;

        function play() {
            audio.src = playlist[track_no].location;
            audio.play();
            chrome.browserAction.setTitle({title: playlist[track_no].title});
        }

        if (!is_playing) {
            chrome.browserAction.setIcon({path: 'img/ext_icons/19.png'});
            checkPlaylist(function () {
                shufflePlaylist();
                play();
                audio.addEventListener('ended', function () {
                    if (track_no < playlist.length) {
                        ++track_no;
                        play();
                    }
                });
                is_playing = true;
            })
        } else {
            chrome.browserAction.setIcon({path: 'img/ext_icons/19_stop.png'});
            chrome.browserAction.setTitle({title: chrome.i18n.getMessage('p_defaultTitle')});
            audio.pause();
            is_playing = false;
        }
    });

    checkPlaylist();
})();