import {shuffleArray} from '../utils/utils';


export class Player extends EventTarget {
    isPlaying = false;
    #audio = new Audio();
    #playlist = [];
    #mirrors = [];
    #curPlaylistPos = 0;
    #startTime = 0;
    #curMirrorIndex = 0;

    constructor(playlist, mirrors) {
        super();
        this.#mirrors = mirrors;
        this.#playlist = playlist;
        this.#initPlaylist();
        this.#listenAudioEvents();
    }

    async play() {
        const playlistElement = this.#playlist[this.#curPlaylistPos];
        this.#audio.src = this.#mirrors[this.#curMirrorIndex] + playlistElement.p;
        try {
            await this.#audio.play();
            this.isPlaying = true;
            const now = Date.now();
            this.dispatchEvent(new CustomEvent('play', {
                detail: {
                    info: playlistElement.st,
                    playedMsec: this.#startTime ? now - this.#startTime : 0,
                },
            }));
            this.#startTime = now;
        } catch (e) {
            console.log('Error playing', e);
        }
    }

    stop() {
        this.#audio.pause();
        this.isPlaying = false;
        this.dispatchEvent(new CustomEvent('stop', {
            detail: {
                playedMsec: this.#startTime ? Date.now() - this.#startTime : 0,
            },
        }));
        this.#startTime = 0;
        this.#initPlaylist();
    }

    next() {
        this.#curPlaylistPos++;
        if (this.#curPlaylistPos >= this.#playlist.length) {
            this.#curPlaylistPos = 0;
        }
        this.play();
    }

    prev() {
        this.#curPlaylistPos--;
        if (this.#curPlaylistPos < 0) {
            this.#curPlaylistPos = this.#playlist.length - 1;
        }
        this.play();
    }

    #initPlaylist() {
        this.#playlist = shuffleArray(this.#playlist);
        this.#curPlaylistPos = 0;
    }

    #listenAudioEvents() {
        this.#audio.addEventListener('ended', () => {
            this.next();
        });
        this.#audio.addEventListener('error', () => {
            // try to play from another mirror
            if (this.#curMirrorIndex >= this.#mirrors.length - 1) {
                this.#startTime = 0;
                this.stop();
            } else {
                this.#curMirrorIndex++;
                this.play();
            }
        });
        if ('mediaSession' in navigator) {
            navigator.mediaSession.setActionHandler('nexttrack', () => this.next());
            navigator.mediaSession.setActionHandler('previoustrack', () => this.prev());
            navigator.mediaSession.setActionHandler('stop', () => this.stop());
        }
    }
}
