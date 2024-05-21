import {MSG_CMD} from '../consts';
import {Player} from './Player';


/**
 * @type Player
 */
let player;

chrome.runtime.onMessage.addListener((message) => {
    if ('play' in message) {
        if (!player) {
            player = new Player(message.play.playlist);
            player.addEventListener('play', (e) => {
                chrome.runtime.sendMessage({
                    cmd: MSG_CMD.PLAY,
                    data: {info: e.detail.info, playedMsec: e.detail.playedMsec},
                });
            });
            player.addEventListener('stop', (e) => {
                chrome.runtime.sendMessage({cmd: MSG_CMD.STOP, data: {playedMsec: e.detail.playedMsec}});
            });
        }

        player.isPlaying ? player.stop() : player.play();
    }
});
