"use strict";
// Injected into the Flickr tab. Requests made from here use the page's own cookies and
// headers (content.fetch), so Flickr treats them like the website's own requests.
globalThis.__flickrLargestCollect = async function (photoUrl) {
  const L = globalThis.__flickrLargestLib;
  const pageFetch = typeof content !== "undefined" && content.fetch ? (u, o) => content.fetch(u, o) : (u, o) => fetch(u, o);
  const log = [];
  let candidates = [];
  let title = "";

  const m = photoUrl.match(L.PHOTO_RE);
  if (!m) return { candidates, title, log: ["not a photo URL"] };
  const [, user, photoId] = m;

  const here = location.href.match(L.PHOTO_RE);
  const onSamePhoto = !!(here && here[2] === photoId);
  const domHtml = document.documentElement.outerHTML;

  // 1. Official size list via the key the Flickr site itself uses
  let key = null;
  try {
    const k = window.wrappedJSObject.YUI_config.flickr.api.site_key;
    if (typeof k === "string" && /^[0-9a-f]{32}$/i.test(k)) key = k;
  } catch (e) {}
  if (!key) key = L.findSiteKey(domHtml);
  if (key) {
    try {
      const res = await pageFetch(L.apiUrl(key, photoId), { credentials: "include" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = JSON.parse(await res.text());
      candidates = candidates.concat(L.parseApiSizes(data));
    } catch (e) {
      log.push("API: " + e.message);
    }
  } else {
    log.push("no site key found");
  }

  // 2. Size table embedded in the page we're on (if it's this photo)
  if (onSamePhoto) {
    candidates = candidates.concat(L.scrapeSizes(domHtml, photoId));
    const og = document.querySelector('meta[property="og:title"]');
    title = (og && og.content) || "";
  }

  // 3. Fetch the photo page from within the tab (feed/album pages, or nothing found yet)
  if (!candidates.length || !title) {
    try {
      const res = await pageFetch(`https://www.flickr.com/photos/${user}/${photoId}/`, { credentials: "include" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const html = await res.text();
      candidates = candidates.concat(L.scrapeSizes(html, photoId));
      title = title || L.findTitle(html);
    } catch (e) {
      log.push("page fetch: " + e.message);
    }
  }

  // 4. Whatever is currently rendered in the page for this photo
  for (const img of document.images) {
    if (img.currentSrc && img.currentSrc.includes(`/${photoId}_`) && img.naturalWidth) {
      candidates.push({ url: img.currentSrc, width: img.naturalWidth, height: img.naturalHeight, label: "displayed" });
    }
  }

  return { candidates: candidates.map((c) => ({ ...c })), title: String(title), log };
};

// Last expression must be clonable for tabs.executeScript
undefined;
