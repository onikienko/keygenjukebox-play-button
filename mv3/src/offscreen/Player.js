import {shuffleArray} from '../utils/utils';


export class Player extends EventTarget {
    #audio;
    isPlaying = false;
    #playlist;
    #curPlaylistPos;
    #startTime = 0;
    #basePathMirrors = ['https://kgm.cmd.pp.ua/kgm/mp3/kgm/', 'https://keygenmusic.tk/mp3/kgm/'];
    #curBasePathIndex = 0;

    constructor(playlist) {
        super();
        this.#playlist = playlist;
        this.#initPlaylist();
        this.#audio = new Audio();
        this.#listenAudioEvents();
    }

    async play() {
        const playlistElement = this.#playlist[this.#curPlaylistPos];
        this.#audio.src = this.#basePathMirrors[this.#curBasePathIndex] + playlistElement.p;
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

    #initPlaylist() {
        this.#playlist = shuffleArray(this.#playlist);
        this.#curPlaylistPos = 0;
    }

    #listenAudioEvents() {
        this.#audio.addEventListener('ended', () => {
            this.next();
        });
        this.#audio.addEventListener('error', (e) => {
            // try to play from another mirror
            if (this.#curBasePathIndex >= this.#basePathMirrors.length - 1) {
                this.#startTime = 0;
                this.stop();
            } else {
                this.#curBasePathIndex++;
                this.play();
            }
        });
        if ('mediaSession' in navigator) {
            navigator.mediaSession.setActionHandler('nexttrack', () => this.next());
        }
    }
}
