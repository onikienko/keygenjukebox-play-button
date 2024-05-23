import {ALARM_UPD_PLAYLIST, MSG_CMD, STORAGE_NAME} from '../consts';
import {enableAlarm, setupOffscreenDocument} from '../utils/chromeUtils';
import {humanTime} from '../utils/utils';
import {fetchAndUpdateList, getPlaylist} from './playlist';


const updateTotalPlayed = async (newTime = 0) => {
    if (!newTime) return;
    const storage = await chrome.storage.local.get({[STORAGE_NAME.TOTAL_PLAYED]: 0});
    const totalPlayedMsec = storage[STORAGE_NAME.TOTAL_PLAYED] + newTime;
    await chrome.storage.local.set({[STORAGE_NAME.TOTAL_PLAYED]: totalPlayedMsec});
};

const updateTotalPlayedBadge = async () => {
    const storage = await chrome.storage.local.get({[STORAGE_NAME.TOTAL_PLAYED]: 0});
    const totalPlayedMsec = storage[STORAGE_NAME.TOTAL_PLAYED];
    if (!totalPlayedMsec) {
        chrome.i18n.getMessage('p_defaultTitle');
        return;
    }
    const totalPlayedHuman = humanTime(totalPlayedMsec);
    let title = chrome.i18n.getMessage('p_totalPlayed');
    title += totalPlayedHuman.d ? totalPlayedHuman.d + chrome.i18n.getMessage('p_day') : '';
    title += totalPlayedHuman.h ? ' ' + totalPlayedHuman.h + chrome.i18n.getMessage('p_hour') : ' 0' + chrome.i18n.getMessage('p_hour');
    title += totalPlayedHuman.m ? ' ' + totalPlayedHuman.m + chrome.i18n.getMessage('p_min') : ' 0' + chrome.i18n.getMessage('p_min');
    await chrome.action.setTitle({title});
};

enableAlarm(ALARM_UPD_PLAYLIST, {
    periodInMinutes: 60 * 24 * 7, // 7 days
})
    .catch(err => console.log('Error Alarm enabling', err));

chrome.alarms.onAlarm.addListener(alarm => {
    if (alarm.name === ALARM_UPD_PLAYLIST) {
        fetchAndUpdateList()
            .catch(err => console.log('Error updating list with alarm', err));
    }
});

chrome.action.onClicked.addListener(async () => {
    try {
        const playlist = await getPlaylist();
        await setupOffscreenDocument('offscreen/offscreen.html');
        await chrome.runtime.sendMessage({play: {playlist}});
    } catch (err) {
        console.log('Error during getting playlist', err);
    }
});

chrome.runtime.onMessage.addListener(async (message) => {
    switch (message.cmd) {
        case MSG_CMD.PLAY:
            await chrome.action.setBadgeTextColor({color: '#e94545'});
            await chrome.action.setBadgeBackgroundColor({color: '#A9B7C6'});
            await chrome.action.setBadgeText({text: ' \u25B6'});
            await chrome.action.setTitle({
                title: chrome.i18n.getMessage('p_nowPlaying') + '\n' + message.data.info,
            });
            await updateTotalPlayed(message.data.playedMsec);
            break;

        case MSG_CMD.STOP:
            await chrome.action.setBadgeText({text: ''});
            await updateTotalPlayed(message.data.playedMsec);
            await updateTotalPlayedBadge(message.data.playedMsec);
            break;
    }
});

// to avoid updating badge every time when sw wake up (possible during playing)
const updateBadgeOnStartup = async () => {
    const storage = await chrome.storage.session.get('flag');
    if (storage['flag']) return;
    await updateTotalPlayedBadge();
    await chrome.storage.session.set({flag: 1});
};

updateBadgeOnStartup();
