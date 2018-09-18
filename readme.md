Chromium (Chrome, Opera published) and FireFox Extension for playing awesome chiptune from keygenmusic.tk
--------------------------------------------------------------------------------------------------

![](https://raw.githubusercontent.com/onikienko/keygenjukebox-play-button/master/chromium/img/ext_icons/128.png)

**Just click button to play chiptune from [keygenmusic.tk](http://keygenmusic.tk/)**

It plays mp3 version (not tracker) from mp3 mirror.


Used [Chrome Extension Box](https://github.com/onikienko/chrome-extensions-box) for Chrome release building.

Install for your browser:

- **[Chrome](https://chrome.google.com/webstore/detail/keygenjukebox-play-button/olephdnjkkjiidgifanfiimkbbcaogid)**
- **[Opera](https://addons.opera.com/extensions/details/keygenjukebox-play-button/)**
- **[FireFox](https://addons.mozilla.org/addon/keygen-music-play-button/)**

--------------------------------------------------------------------------------------------

The idea of extension is simplicity. One button UI.  
Click on the icon to start. Click again to stop.  
Each time you click the icon, extension is shuffling playlist.  
It is like a radio. You never know the next track.  
At the moment, there are more than 6 days of non-stop playing :scream:  

-----------------------------------------------------------------------------------------------

**Tips:**  
- Double click on extension icon for next track.
- Hover over extension icon to see Total played statistics (when stopped). When playing you will see track title.

------------------------------------------------------------------------------------------------

**Firefox versions dev. notes**

In the `firefox` folder located obsolete extension. Version implemented with webExtensions API is located under the `firefox-webExtensions` folder.

In fact, this `firefox-webExtensions` is slightly modified `chromium` version (only `manifest.json` is different). 
I plan to create new builder which will build Chrome, Opera and Firefox version from one source.
