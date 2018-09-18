(function () {
    var playlist = localStorage.playlist ? JSON.parse(localStorage.playlist) : [],
        is_playing = false,
        audio = new Audio(),
        start_time = 0,
        track_no = 0,
        dbl_click_timeout = 300,
        sngl_click_pending,
        path_prefix = 'http://keygenmusic.tk/mp3/kgm/';

    function getPlaylistInJSON(cb) {
        var xhr = new XMLHttpRequest(),
            playlist_url = 'http://keygenmusic.tk/mp3/kgm/playlist.txt';

        xhr.open('GET', playlist_url, true);
        xhr.onreadystatechange = function () {
            if (xhr.readyState == 4) {
                playlist = JSON.parse(xhr.responseText);
                if (playlist && playlist.length > 1) {
                    localStorage.playlist_date_check = Date.now();
                    localStorage.playlist = JSON.stringify(playlist);
                }
                cb && cb();
            }
        };
        xhr.send();
    }

    function checkPlaylist(cb) {
        if (playlist.length === 0 || !playlist[0].st || (Date.now() - 1000 * 60 * 60 * 24 * 7 > parseInt(localStorage.playlist_date_check, 10))) {
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

    function showStopTitle() {
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
            return {d: d, h: h, m: m, s: s};
        }

        if (stored_time) {
            stored_time = convertMS(parseInt(stored_time, 10));
            title += stored_time.d ? stored_time.d + chrome.i18n.getMessage('p_day') : '';
            title += stored_time.h ? ' ' + stored_time.h + chrome.i18n.getMessage('p_hour') : ' 0' + chrome.i18n.getMessage('p_hour');
            title += stored_time.m ? ' ' + stored_time.m + chrome.i18n.getMessage('p_min') : ' 0' + chrome.i18n.getMessage('p_min');
        } else {
            title = chrome.i18n.getMessage('p_defaultTitle');
        }
        chrome.browserAction.setIcon({path: 'img/ext_icons/19_stop.png'});
        chrome.browserAction.setTitle({title: title});
    }

    chrome.browserAction.onClicked.addListener(function () {
        function play() {
            audio.src = path_prefix + playlist[track_no].p;
            audio.play();
            start_time = Date.now();
            chrome.browserAction.setTitle({title: playlist[track_no].st});
        }

        function next() {
            storeStatistics();
            track_no = track_no < playlist.length ? track_no + 1 : 0;
            play();
        }

        function start() {
            chrome.browserAction.setIcon({path: 'img/ext_icons/19.png'});
            track_no = 0;
            checkPlaylist(function () {
                shufflePlaylist();
                play();
                audio.addEventListener('ended', function () {
                    next();
                });
                is_playing = true;
            });
        }

        function stop() {
            storeStatistics();
            showStopTitle();
            audio.pause();
            is_playing = false;
        }

        function isDblClick() {
            var now = parseInt(Date.now()),
                is_dbl_click = false;

            if (sessionStorage.click_time && now - parseInt(sessionStorage.click_time, 10) < dbl_click_timeout) {
                is_dbl_click = true;
            }
            sessionStorage.click_time = now;
            return is_dbl_click;
        }

        if (isDblClick()) {
            clearTimeout(sngl_click_pending);
            sngl_click_pending = null;
            is_playing ? next() : start();
        } else {
            sngl_click_pending = setTimeout(function () {
                sngl_click_pending = null;
                is_playing ? stop() : start();
            }, dbl_click_timeout);
        }
    });

    showStopTitle();
})();