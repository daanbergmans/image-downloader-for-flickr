"use strict";
const L = globalThis.__flickrLargestLib;
const t = (key) => browser.i18n.getMessage(key);

/* ---------- Size discovery ---------- */

// Preferred: run the lookup inside the Flickr tab.
async function collectInTab(tabId, photoUrl) {
  await browser.tabs.executeScript(tabId, { file: "lib.js" });
  await browser.tabs.executeScript(tabId, { file: "collect.js" });
  const [result] = await browser.tabs.executeScript(tabId, {
    code: `__flickrLargestCollect(${JSON.stringify(photoUrl)})`,
  });
  return result;
}

// Fallback (e.g. a Flickr link on a non-Flickr site): fetch from the extension itself.
async function collectFromBackground(photoUrl) {
  const [, user, photoId] = photoUrl.match(L.PHOTO_RE);
  const log = [];
  let candidates = [];
  let title = "";
  try {
    const res = await fetch(`https://www.flickr.com/photos/${user}/${photoId}/`, { credentials: "include" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const html = await res.text();
    title = L.findTitle(html);
    const key = L.findSiteKey(html);
    if (key) {
      try {
        const r = await fetch(L.apiUrl(key, photoId), { credentials: "include" });
        candidates = candidates.concat(L.parseApiSizes(await r.json()));
      } catch (e) {
        log.push("API: " + e.message);
      }
    }
    candidates = candidates.concat(L.scrapeSizes(html, photoId));
  } catch (e) {
    log.push("background fetch: " + e.message);
  }
  return { candidates, title, log };
}

async function findLargest(photoUrl, tabId) {
  const m = photoUrl.match(L.PHOTO_RE);
  if (!m) throw new Error(t("errNotPhoto"));
  const photoId = m[2];

  let result = { candidates: [], title: "", log: [] };
  if (tabId != null) {
    try {
      result = await collectInTab(tabId, photoUrl);
    } catch (e) {
      result.log.push("in-tab: " + e.message);
    }
  }
  if (!result.candidates.length) {
    const bg = await collectFromBackground(photoUrl);
    result = { candidates: bg.candidates, title: result.title || bg.title, log: result.log.concat(bg.log) };
  }
  if (!result.candidates.length) {
    console.warn("[flickr-largest]", result.log);
    throw new Error(t("errNoSizes") + " " + result.log.join(" | "));
  }

  const best = result.candidates.sort((a, b) => b.width * b.height - a.width * a.height)[0];
  return { best, photoId, title: result.title };
}

/* ---------- Download ---------- */

function sanitize(name) {
  return name
    .replace(/[\\/:*?"<>|\u0000-\u001f]+/g, "_")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 120)
    .replace(/^[.\s]+|[.\s]+$/g, "");
}

function extensionOf(url) {
  const m = new URL(url).pathname.match(/\.([a-z0-9]{2,5})$/i);
  return m ? m[1].toLowerCase() : "jpg";
}

async function downloadLargest(photoUrl, tabId, saveAs) {
  setBadge("…", "#666");
  try {
    const { best, photoId, title } = await findLargest(photoUrl, tabId);
    const base = sanitize(title ? `${title} - ${photoId}` : `flickr_${photoId}`) || `flickr_${photoId}`;
    const filename = `${base} (${best.width}x${best.height}).${extensionOf(best.url)}`;

    await browser.downloads.download({ url: best.url, filename, saveAs: !!saveAs, conflictAction: "uniquify" });

    setBadge("✓", "#2a9d3a");
    notify(t("notifyStarted"), `${best.width} × ${best.height} (${best.label})\n${filename}`);
  } catch (err) {
    console.error("[flickr-largest]", err);
    setBadge("!", "#c0392b");
    notify(t("notifyFailed"), err.message || String(err));
  }
}

/* ---------- UI helpers ---------- */

let badgeTimer;
function setBadge(text, color) {
  browser.browserAction.setBadgeText({ text });
  browser.browserAction.setBadgeBackgroundColor({ color });
  clearTimeout(badgeTimer);
  if (text !== "…") badgeTimer = setTimeout(() => browser.browserAction.setBadgeText({ text: "" }), 4000);
}

function notify(title, message) {
  browser.notifications.create({ type: "basic", iconUrl: browser.runtime.getURL("icons/icon-96.png"), title, message });
}

/* ---------- Entry points ---------- */

// Toolbar button / Alt+Shift+D. Shift-click opens the "Save as" dialog.
browser.browserAction.onClicked.addListener((tab, info) => {
  const saveAs = !!(info && info.modifiers && info.modifiers.includes("Shift"));
  downloadLargest(tab.url, tab.id, saveAs);
});

browser.menus.create({
  id: "flickr-largest-page",
  title: t("menuPage"),
  contexts: ["page", "image"],
  documentUrlPatterns: ["*://*.flickr.com/photos/*/*"],
});
browser.menus.create({
  id: "flickr-largest-link",
  title: t("menuLink"),
  contexts: ["link"],
  targetUrlPatterns: ["*://*.flickr.com/photos/*/*"],
});

browser.menus.onClicked.addListener((info, tab) => {
  const tabId = tab ? tab.id : null;
  if (info.menuItemId === "flickr-largest-link" && info.linkUrl) {
    downloadLargest(info.linkUrl, tabId, false);
  } else if (info.menuItemId === "flickr-largest-page") {
    const target = info.linkUrl && L.PHOTO_RE.test(info.linkUrl) ? info.linkUrl : info.pageUrl || tab.url;
    downloadLargest(target, tabId, false);
  }
});
