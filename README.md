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

## Features

- **The largest size available to you:** up to the original file when the photographer allows downloads.
- **Works anywhere on Flickr:** on photo pages, and on thumbnails and links in feeds, albums, groups and search results.
- **Clear filenames:** `Title - photoID (6144x4096).jpg`.
- **Tells you what you got:** a notification shows exactly which size was saved.
- **Private:** no data collection, no tracking.

## Install

Install it from [Firefox Add-ons](https://addons.mozilla.org/firefox/addon/image-downloader-for-flickr/).

Requires Firefox 142 or later.

## How to use it

- **Toolbar button:** click it on any Flickr photo page. Shift-click to choose where to save.
- **Keyboard shortcut:** `Alt+Shift+D`. You can change it in Firefox under *Manage Extension Shortcuts*.
- **Right-click menu:** on a photo page, or on any thumbnail or link to a Flickr photo.

## How it works

When you use the button, the shortcut or the menu, the add-on looks up the photo's sizes from inside the Flickr tab, in three places:

1. Flickr's official size list for the photo, the same one behind Flickr's own size menu,
2. the size table embedded in the photo page, and
3. the image currently displayed, as a last resort.

It then downloads the size with the most pixels.

Besides access to Flickr, the add-on uses three permissions: `downloads` to save the image, `menus` for the right-click menu and `notifications` to tell you which size was saved.

### Respects photographers

The add-on only downloads sizes Flickr already makes available to you. If an owner has disabled downloads of the original, you get the largest public size instead. Their settings are never bypassed.

Please respect each photo's license when you use what you download.

## Development

There's no build step. The repository is the extension.

1. Clone the repository.
2. Open `about:debugging#/runtime/this-firefox` in Firefox.
3. Click **Load Temporary Add-on…** and select `manifest.json`.
4. Open any photo on [flickr.com](https://www.flickr.com) and try the toolbar button.

To see what the add-on is doing, click **Inspect** next to it in `about:debugging` and open the **Console** tab.

### Files

| File | Purpose |
| --- | --- |
| `manifest.json` | Extension manifest (Manifest V2) |
| `background.js` | Handles the button, shortcut and menu; picks the largest size and downloads it |
| `collect.js` | Runs inside the Flickr tab and gathers the available sizes |
| `lib.js` | Shared helpers for reading sizes and titles |
| `_locales/` | English translations |
| `icons/` | Add-on and toolbar icons |

### Translations

The interface is available in English. Translations live in `_locales/`. To add a language, copy `_locales/en/messages.json` to a new folder named after the language code (for example `_locales/de/`), translate the `message` values and open a pull request.

### Packaging

```sh
zip -r image-downloader-for-flickr.zip manifest.json background.js collect.js lib.js _locales icons/*.png
```

## Troubleshooting

If a photo doesn't download in the size you expect, Flickr may have changed how it lists photo sizes. Please [open an issue](../../issues) with:

- the link to the photo page,
- the size you got and the size you expected, and
- the text of the error notification, if there was one.

## Privacy

This add-on collects no data. It only contacts Flickr, only when you ask it to download a photo, and stores nothing.

## License

[MIT](LICENSE)

---

*Not affiliated with or endorsed by Flickr or SmugMug. Flickr is a trademark of SmugMug, Inc.*
