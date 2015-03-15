(function () {
    var playlist = localStorage.playlist ? JSON.parse(localStorage.playlist) : [],
        is_playing = false,
        audio = new Audio(),
        start_time = 0;

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

    function storeStatistics() {
        var stored_time = localStorage.total_played || 0,
            played_this_session = start_time ? Date.now() - start_time : 0;

        localStorage.total_played = parseInt(stored_time, 10) + played_this_session;
        start_time = 0;
    }

    function showStopTitle () {
        var title = chrome.i18n.getMessage('p_totalPlayed'),
            stored_time = localStorage.total_played;

        function convertMS(ms) {
            var d, h, m, s;
            s = Math.floor(ms / 1000);
            m = Math.floor(s / 60);
            s = s % 60;
            h = Math.floor(m / 60);
            m = m % 60;
            d = Math.floor(h / 24);
            h = h % 24;
            return { d: d, h: h, m: m, s: s };
        }

        if (stored_time) {
            stored_time = convertMS(parseInt(stored_time, 10));
            title += stored_time.d ? stored_time.d + chrome.i18n.getMessage('p_day') : '';
            title += stored_time.h ? ' ' + stored_time.h + chrome.i18n.getMessage('p_hour') : ' 0' + chrome.i18n.getMessage('p_hour');
            title += stored_time.m ? ' ' + stored_time.m + chrome.i18n.getMessage('p_min') : ' 0' + chrome.i18n.getMessage('p_min');
        } else {
            title = chrome.i18n.getMessage('p_defaultTitle');
        }

        chrome.browserAction.setTitle({title: title});
    }

    chrome.browserAction.onClicked.addListener(function () {
        var track_no = 0;

        function play() {
            audio.src = playlist[track_no].location;
            audio.play();
            start_time = Date.now();
            chrome.browserAction.setTitle({title: playlist[track_no].title});
        }

        if (!is_playing) {
            chrome.browserAction.setIcon({path: 'img/ext_icons/19.png'});
            checkPlaylist(function () {
                shufflePlaylist();
                play();
                audio.addEventListener('ended', function () {
                    storeStatistics();
                    track_no = track_no < playlist.length ? track_no + 1 : 0;
                    play();
                });
                is_playing = true;
            });
        } else {
            storeStatistics();
            chrome.browserAction.setIcon({path: 'img/ext_icons/19_stop.png'});
            showStopTitle();
            audio.pause();
            is_playing = false;
        }
    });

    showStopTitle();
    checkPlaylist();
})();