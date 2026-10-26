<p align="center">
  <img src="icons/icon-128.png" width="96" alt="">
</p>

<h1 align="center">Image Downloader for Flickr</h1>

<p align="center">
  A Firefox add-on that saves any Flickr photo in the largest size available, up to the original, with one click, a shortcut or the right-click menu.
</p>

<p align="center">
  <a href="https://addons.mozilla.org/firefox/addon/image-downloader-for-flickr/">Get it on Firefox Add-ons</a>
</p>

---

Flickr hides its photo sizes behind a size menu, and the right-click "Save image" usually gives you a small preview. This add-on finds every size Flickr offers for a photo and saves the biggest one for you.

## How to use it

- **Toolbar button:** click it on any Flickr photo page. Shift-click to choose where to save.
- **Keyboard shortcut:** `Alt+Shift+D`. You can change it in Firefox under *Manage Extension Shortcuts*.
- **Right-click menu:** on a photo page, or on any thumbnail or link to a Flickr photo in feeds, albums, groups and search results.

## What you get

- The largest size available to you, up to the original file when the photographer allows downloads.
- Clear filenames: `Title - photoID (6144x4096).jpg`.
- A notification telling you exactly which size was saved.
- An English and Dutch interface.

## Respects photographers

The add-on only downloads sizes Flickr already makes available to you. If an owner has disabled downloads of the original, you get the largest public size instead. Their settings are never bypassed.

Please respect each photo's license when you use what you download.

## Install

Install it from [Firefox Add-ons](https://addons.mozilla.org/firefox/addon/image-downloader-for-flickr/).

## Development

1. Clone the repository.
2. Open `about:debugging#/runtime/this-firefox` in Firefox.
3. Click **Load Temporary Add-on…** and select `manifest.json`.
4. Open any photo on [flickr.com](https://www.flickr.com) and try the toolbar button.

### Translations

The interface is available in English and Dutch. Translations live in `_locales/`. To add a language, copy `_locales/en/messages.json` to a new folder named after the language code (for example `_locales/de/`), translate the `message` values and open a pull request.

## Issues and support

Found a photo that doesn't download in the size you expect? Please [open an issue](../../issues) with the link to the photo page and the size you got.

## Privacy

No data is collected, stored or sent anywhere. The add-on only contacts Flickr, and only when you ask it to download a photo.

## License

[MIT](LICENSE)

---

*Not affiliated with or endorsed by Flickr or SmugMug. Flickr is a trademark of SmugMug, Inc.*
