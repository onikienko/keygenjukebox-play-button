import {ALARM_UPD_PLAYLIST, MSG_CMD, STORAGE_NAME} from '../consts';
import {enableAlarm, setupOffscreenDocument} from '../utils/chromeUtils';
import {humanTime} from '../utils/utils';
import {fetchAndUpdateList, getPlaylist} from './playlist';


const updateTotalPlayedAndBadge = async (newTime = 0) => {
    const storage = await chrome.storage.local.get({[STORAGE_NAME.TOTAL_PLAYED]: 0});
    const totalPlayedMsec = storage[STORAGE_NAME.TOTAL_PLAYED] + newTime;
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
    await chrome.storage.local.set({[STORAGE_NAME.TOTAL_PLAYED]: totalPlayedMsec});
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
    await setupOffscreenDocument('offscreen/offscreen.html');
    const playlist = await getPlaylist();
    await chrome.runtime.sendMessage({play: {playlist}});
});

chrome.runtime.onMessage.addListener(async (message) => {
    switch (message.cmd) {
        case MSG_CMD.PLAY:
            await chrome.action.setBadgeTextColor({color: 'white'});
            await chrome.action.setBadgeBackgroundColor({color: 'red'});
            await chrome.action.setBadgeText({text: ' \u25B6'});
            await chrome.action.setTitle({
                title: chrome.i18n.getMessage('p_nowPlaying') + '\n' + message.data.info,
            });
            break;

        case MSG_CMD.STOP:
            await chrome.action.setBadgeText({text: ''});
            // await chrome.action.setTitle({title: ''});
            break;
    }
    if (message.data?.playedMsec) {
        updateTotalPlayedAndBadge(message.data.playedMsec);
    }
});

updateTotalPlayedAndBadge();