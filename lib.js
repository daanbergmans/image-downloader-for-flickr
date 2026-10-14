"use strict";
// Shared parsing helpers, loaded both in the background page and injected into Flickr tabs.
(function (root) {
  const PHOTO_RE = /^https?:\/\/(?:www\.)?flickr\.com\/photos\/([^/?#]+)\/(\d+)/i;

  function findSiteKey(html) {
    const patterns = [
      /site_key\s*=\s*["']([0-9a-f]{32})["']/i,
      /["']site_key["']\s*:\s*["']([0-9a-f]{32})["']/i,
      /["']api_key["']\s*:\s*["']([0-9a-f]{32})["']/i,
      /api_key=([0-9a-f]{32})/i,
    ];
    for (const re of patterns) {
      const m = html.match(re);
      if (m) return m[1];
    }
    return null;
  }

  function apiUrl(apiKey, photoId) {
    return (
      "https://api.flickr.com/services/rest/?method=flickr.photos.getSizes" +
      `&api_key=${apiKey}&photo_id=${photoId}&format=json&nojsoncallback=1`
    );
  }

  // Turn a getSizes JSON response into plain candidate objects.
  function parseApiSizes(data) {
    if (!data || data.stat !== "ok") throw new Error(`API: ${(data && (data.message || data.stat)) || "no data"}`);
    const out = [];
    for (const s of data.sizes.size) {
      if (s.media && s.media !== "photo") continue;
      const c = { url: String(s.source || ""), width: Number(s.width), height: Number(s.height), label: String(s.label || "") };
      if (c.url && c.width && c.height) out.push(c);
    }
    return out;
  }

  // Scrape the size table Flickr embeds in the page's JSON model.
  function scrapeSizes(html, photoId) {
    const text = html.replace(/\\\//g, "/");
    const out = [];
    const objRe = /\{[^{}]*\}/g;
    let m;
    while ((m = objRe.exec(text))) {
      const obj = m[0];
      const u = obj.match(/"(?:displayUrl|url|src|source)"\s*:\s*"((?:https?:)?\/\/[^"]*staticflickr\.com\/[^"]+)"/);
      if (!u || !u[1].includes(`/${photoId}_`)) continue;
      const w = obj.match(/"width"\s*:\s*"?(\d+)/);
      const h = obj.match(/"height"\s*:\s*"?(\d+)/);
      if (!w || !h) continue;
      const key = obj.match(/"key"\s*:\s*"([^"]+)"/);
      out.push({
        url: u[1].startsWith("//") ? "https:" + u[1] : u[1],
        width: Number(w[1]),
        height: Number(h[1]),
        label: key ? key[1] : "scraped",
      });
    }
    return out;
  }

  function decodeEntities(s) {
    return s
      .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
      .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)))
      .replace(/&quot;/g, '"')
      .replace(/&#039;|&apos;/g, "'")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&amp;/g, "&");
  }

  function findTitle(html) {
    const m =
      html.match(/<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']*)["']/i) ||
      html.match(/<meta[^>]+content=["']([^"']*)["'][^>]+property=["']og:title["']/i);
    return m ? decodeEntities(m[1]).trim() : "";
  }

  root.__flickrLargestLib = { PHOTO_RE, findSiteKey, apiUrl, parseApiSizes, scrapeSizes, findTitle };
  if (typeof module !== "undefined") module.exports = root.__flickrLargestLib;
})(typeof globalThis !== "undefined" ? globalThis : this);

undefined;
