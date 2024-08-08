Extension for playing awesome chiptune from keygenmusic.tk
------

Manifest v3 version.

Uses [Parcel Web Extension Config](https://parceljs.org/recipes/web-extension/)
and [release-it](https://github.com/release-it/release-it) for GitHub releases.

## Development:

1. Check if your [Node.js](https://nodejs.org/) version is >= **20**.
2. Run `npm install` to install the dependencies.
3. Run `npm start`
4. Load your extension on Chrome following:
    1. Access `chrome://extensions/`
    2. Check `Developer mode`
    3. Click on `Load unpacked extension`
    4. Select the `dist` folder.

## Production build:

1. Stop development script (if it is running)
2. Remove installed dev. extension at `chrome://extensions/`
3. Run `npm run build`
4. Load your extension on Chrome following:
    1. Access `chrome://extensions/`
    2. Check `Developer mode`
    3. Click on `Load unpacked extension`
    4. Select the `dist` folder

Also, `zip` file with production extension's code will be created in `releases` folder.
This code is ready for uploading to the Chrome Web Store.

## Release:

`npm run release`

[release-it](https://github.com/release-it/release-it) is used for GitHub release.

It will bump the version (`package.json` and `manifest.json`), make the `build`, and prepare a release draft with the extension `zip` on GitHub.
