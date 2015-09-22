var buttons = require('sdk/ui/button/action');
var ss = require("sdk/simple-storage");
var window = require("sdk/window/utils").getMostRecentBrowserWindow();
var Request = require("sdk/request").Request;
var _ = require("sdk/l10n").get;

var playlist = ss.storage.playlist ? ss.storage.playlist : [];
var is_playing = false;
var audio = new window.Audio;
var start_time = 0;
var iconPlaying = {
    "16": "./img/ext_icons/16.png",
    "32": "./img/ext_icons/32.png",
    "64": "./img/ext_icons/64.png"
};
var iconStop = {
    "16": "./img/ext_icons/16_stop.png",
    "32": "./img/ext_icons/32_stop.png",
    "64": "./img/ext_icons/64_stop.png"
};

var button = buttons.ActionButton({
    id: "keygen-music-play-button",
    label: _('defaultTitle'),
    icon: iconStop,
    onClick: handleClick
});

function handleClick() {
    var track_no = 0;

    function play() {
        audio.src = 'http://keygenmusic.tk/mp3/kgm/' + playlist[track_no].p;
        audio.play();
        start_time = Date.now();
        button.label = playlist[track_no].st;
    }

    if (!is_playing) {
        button.icon = iconPlaying;
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
        button.icon = iconStop;
        showStopTitle();
        audio.pause();
        is_playing = false;
    }
}

function showStopTitle() {
    var title = _('totalPlayed');
    var stored_time = ss.storage.total_played;

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
        title += stored_time.d ? stored_time.d + _('day') : '';
        title += stored_time.h ? ' ' + stored_time.h + _('hour') : ' 0' + _('hour');
        title += stored_time.m ? ' ' + stored_time.m + _('min') : ' 0' + _('min');
    } else {
        title = _('defaultTitle');
    }
    button.label = title;
}

function getPlaylistInJSON(cb) {
    Request({
        url: "http://keygenmusic.tk/mp3/kgm/playlist.txt",
        overrideMimeType: "text/plain;",
        onComplete: function (response) {
            playlist = JSON.parse(response.text);
            if (playlist && playlist.length > 1) {
                ss.storage.playlist_date_check = Date.now();
                ss.storage.playlist = playlist;
            }
            cb && cb();
        }
    }).get();
}

function checkPlaylist(cb) {
    if (playlist.length === 0 || !playlist[0].st || (Date.now() - 1000 * 60 * 60 * 24 * 7 > parseInt(ss.storage.playlist_date_check, 10))) {
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
    var stored_time = ss.storage.total_played || 0;
    var played_this_session = start_time ? Date.now() - start_time : 0;

    ss.storage.total_played = parseInt(stored_time, 10) + played_this_session;
    start_time = 0;
}

showStopTitle();
