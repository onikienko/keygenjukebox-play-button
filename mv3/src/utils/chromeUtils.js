// https://developer.chrome.com/docs/extensions/reference/api/offscreen#maintain_the_lifecycle_of_an_offscreen_document
let creating; // A global promise to avoid concurrency issues
export async function setupOffscreenDocument(path) {
    // Check all windows controlled by the service worker to see if one
    // of them is the offscreen document with the given path
    const offscreenUrl = chrome.runtime.getURL(path);
    const existingContexts = await chrome.runtime.getContexts({
        contextTypes: ['OFFSCREEN_DOCUMENT'],
        documentUrls: [offscreenUrl],
    });

    if (existingContexts.length > 0) {
        return;
    }

    // create offscreen document
    if (creating) {
        await creating;
    } else {
        creating = chrome.offscreen.createDocument({
            url: path,
            reasons: ['AUDIO_PLAYBACK'],
            justification: 'Playing Audio In Background',
        });
        await creating;
        creating = null;
    }
}

export async function enableAlarm(name, alarmInfo) {
    if (!name) throw new Error('Alarm name is not provided');
    const alarm = await chrome.alarms.get(name);
    if (!alarm) {
        await chrome.alarms.create(name, alarmInfo);
    }
}
