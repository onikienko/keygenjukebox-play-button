export const fetchAndUpdateList = async () => {
    return fetch('https://keygenmusic.tk/mp3/kgm/playlist.txt')
        .then(resp => resp.json())
        .then(list => {
            if (!list?.length) throw new Error('Invalid list');
            chrome.storage.local.set({list});
            return list;
        });
};

export const getPlaylist = async () => {
    const storage = await chrome.storage.local.get({list: null});
    if (storage?.list) return storage.list;
    return fetchAndUpdateList();
};
