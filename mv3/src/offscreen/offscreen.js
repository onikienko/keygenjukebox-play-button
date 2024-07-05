import logo128 from 'data-url:../images/128.png';
import {KGM_MIRRORS, MSG_CMD} from '../consts';
import {Player} from './Player';


/**
 * @type Player
 */
let player;

const initPlayer = (playlist, mirrors) => {
    const pl = new Player(playlist, mirrors);
    pl.addEventListener('play', (e) => {
        if ('mediaSession' in navigator) {
            navigator.mediaSession.metadata = new MediaMetadata({
                title: e.detail.info,
                artwork: [
                    // add also 96, 192, 256, 384 and 512
                    {src: logo128, sizes: '128x128', type: 'image/png'},
                ],
            });
        }
        chrome.runtime.sendMessage({
            cmd: MSG_CMD.PLAY,
            data: {info: e.detail.info, playedMsec: e.detail.playedMsec},
        });
    });
    pl.addEventListener('stop', (e) => {
        chrome.runtime.sendMessage({
            cmd: MSG_CMD.STOP,
            data: {playedMsec: e.detail.playedMsec},
        });
    });
    return pl;
};

chrome.runtime.onMessage.addListener((message) => {
    if ('play' in message) {
        if (!player) {
            player = initPlayer(message.play.playlist, KGM_MIRRORS);
        }
        player.isPlaying ? player.stop() : player.play();
    }
});
