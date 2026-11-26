import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";
import { buildCatalog, mergeSermons, type ManualSermonInput } from "./catalog";
import {
  extractYouTubeVideoId,
  isYouTubeVideoId,
  youtubeEmbedUrl,
  youtubeThumbnailUrl,
} from "./media";
import { formatSermonDate, shortDescription } from "./text";
import {
  mapLiveBroadcast,
  mapPlaylistItems,
  mapVideoList,
  playlistItemsUrl,
  sanitizePageToken,
} from "./youtube-api";
import { isMissingColumnError } from "./schema-error";
import { parseYouTubeRss } from "./youtube-feed";

const fixture = readFileSync(
  path.join(process.cwd(), "src/lib/sermons/fixtures/youtube-feed.xml"),
  "utf8",
);

function manual(overrides: Partial<ManualSermonInput> & Pick<ManualSermonInput, "id" | "title" | "mediaUrl">): ManualSermonInput {
  return {
    speaker: null,
    series: null,
    scripture: null,
    date: new Date("2026-10-18T12:00:00.000Z"),
    description: null,
    mediaType: "VIDEO",
    youtubeVideoId: null,
    ...overrides,
  };
}

test("a missing database column is recognised without treating other errors as schema drift", () => {
  assert.equal(isMissingColumnError({ code: "P2022" }), true);
  assert.equal(
    isMissingColumnError(new Error('column "series" of relation "Sermon" does not exist')),
    true,
  );
  assert.equal(isMissingColumnError({ code: "P2002" }), false);
  assert.equal(isMissingColumnError(new Error("connection refused")), false);
});

test("parseYouTubeRss reads the channel fixture newest-first and skips a broken entry", () => {
  const videos = parseYouTubeRss(fixture);

  assert.deepEqual(
    videos.map((video) => video.id),
    ["abcd1234efg", "zxcv0987bnm", "qwer5678tyu"],
  );
  assert.equal(videos[0]?.title, "Faith & Hope");
  assert.equal(
    videos[0]?.description,
    "Bishop Harrison Sakala teaches from Hebrews 11. A message of hope for the church in Lusaka & beyond.",
  );
  assert.equal(videos[1]?.title, "Sunday Service at TOD");
  assert.equal(videos[1]?.description, "A shorter note about the service in Lusaka.");
  assert.equal(videos[2]?.title, "God's Watchnight");
  assert.equal(videos[0]?.thumbnailUrl, "https://i.ytimg.com/vi/abcd1234efg/hqdefault.jpg");
  assert.equal(videos[0]?.url, "https://www.youtube.com/watch?v=abcd1234efg");
  assert.equal(videos[0]?.publishedAt, "2026-11-02T12:00:00.000Z");
});

test("parseYouTubeRss rejects a response that is not a feed", () => {
  assert.throws(() => parseYouTubeRss("<html>not a feed</html>"), /channel feed/);
});

test("parseYouTubeRss accepts an empty channel feed", () => {
  assert.deepEqual(parseYouTubeRss("<feed xmlns='http://www.w3.org/2005/Atom'></feed>"), []);
});

test("YouTube ids are taken from watch, share, shorts, and nocookie links", () => {
  assert.equal(extractYouTubeVideoId("https://www.youtube.com/watch?v=abcd1234efg"), "abcd1234efg");
  assert.equal(extractYouTubeVideoId("https://youtu.be/abcd1234efg"), "abcd1234efg");
  assert.equal(extractYouTubeVideoId("https://www.youtube.com/shorts/abcd1234efg"), "abcd1234efg");
  assert.equal(
    extractYouTubeVideoId("https://www.youtube-nocookie.com/embed/abcd1234efg"),
    "abcd1234efg",
  );
  assert.equal(extractYouTubeVideoId("https://example.com/watch?v=abcd1234efg"), null);
  assert.equal(extractYouTubeVideoId("https://youtu.be/short"), null);
  assert.equal(isYouTubeVideoId("abcd1234efg"), true);
  assert.equal(youtubeEmbedUrl("https://youtu.be/abcd1234efg"), "https://www.youtube-nocookie.com/embed/abcd1234efg");
  assert.equal(youtubeThumbnailUrl("abcd1234efg"), "https://i.ytimg.com/vi/abcd1234efg/hqdefault.jpg");
});

test("manual sermons merge onto the same YouTube video and stay newest first", () => {
  const videos = parseYouTubeRss(fixture);
  const audio = manual({
    id: "audio-1",
    title: "Midweek audio",
    mediaUrl: "https://example.com/midweek.mp3",
    mediaType: "AUDIO",
    date: new Date("2026-10-01T12:00:00.000Z"),
  });
  const enriched = manual({
    id: "db-sunday",
    title: "Sunday Service at TOD",
    mediaUrl: "https://youtu.be/zxcv0987bnm",
    date: new Date("2026-10-18T12:00:00.000Z"),
    speaker: "Bishop Harrison Sakala",
    series: "Hebrews",
    scripture: "Hebrews 11:1",
    description: "Taught in the second service.",
  });
  const olderDuplicate = manual({
    id: "db-old",
    title: "Old duplicate",
    mediaUrl: "https://www.youtube.com/watch?v=zxcv0987bnm",
    date: new Date("2020-01-01T12:00:00.000Z"),
    speaker: "Someone else",
  });

  const merged = mergeSermons(videos, [audio, enriched, olderDuplicate]);
  assert.deepEqual(
    merged.map((sermon) => sermon.title),
    ["Faith & Hope", "Sunday Service at TOD", "Midweek audio", "God's Watchnight"],
  );

  const sunday = merged[1];
  assert.equal(sunday?.id, "zxcv0987bnm");
  assert.equal(sunday?.dbId, "db-sunday");
  assert.equal(sunday?.speaker, "Bishop Harrison Sakala");
  assert.equal(sunday?.series, "Hebrews");
  assert.equal(sunday?.scripture, "Hebrews 11:1");
  assert.equal(sunday?.description, "Taught in the second service.");
  assert.equal(merged.filter((sermon) => sermon.youtubeId === "zxcv0987bnm").length, 1);

  const catalog = buildCatalog(
    { ok: true, videos, nextPageToken: null, live: null },
    [audio, enriched],
    null,
  );
  assert.equal(catalog.status, "ready");
  assert.equal(catalog.featured?.title, "Faith & Hope");
  assert.equal(catalog.rest[0]?.title, "Sunday Service at TOD");
  assert.equal(formatSermonDate(catalog.featured!.date), "2 Nov 2026");
});

test("a failed feed keeps saved sermons and a later page does not pretend to be the channel", () => {
  const saved = manual({
    id: "audio-1",
    title: "Midweek audio",
    mediaUrl: "https://example.com/midweek.mp3",
    mediaType: "AUDIO",
  });
  const fallback = buildCatalog({ ok: false }, [saved], null);
  assert.equal(fallback.status, "fallback");
  assert.equal(fallback.rest[0]?.title, "Midweek audio");

  const missingPage = buildCatalog({ ok: false }, [saved], "CAoQAA");
  assert.equal(missingPage.status, "page-unavailable");
  assert.equal(missingPage.rest.length, 0);
});

test("short descriptions collapse space and keep a word boundary", () => {
  assert.equal(shortDescription("  Hello   <b>church</b>  "), "Hello church");
  assert.equal(shortDescription("   "), null);
  const long = `${"word ".repeat(40)}end`;
  const summary = shortDescription(long, 80);
  assert.ok(summary);
  assert.ok(summary.length <= 81);
  assert.ok(summary.endsWith("…"));
  assert.equal(summary.includes("  "), false);
});

test("page tokens stay opaque and safe to put in a cache key", () => {
  assert.equal(sanitizePageToken("CAoQAA"), "CAoQAA");
  assert.equal(sanitizePageToken("  abc-def_12=  "), "abc-def_12=");
  assert.equal(sanitizePageToken("../etc"), null);
  assert.equal(sanitizePageToken(""), null);
  assert.equal(sanitizePageToken("a".repeat(401)), null);
});

test("Data API playlist and live payloads map into sermons", () => {
  const page = mapPlaylistItems({
    nextPageToken: "CAoQAA",
    items: [
      {
        snippet: {
          title: "Private video",
          description: "",
          publishedAt: "2026-11-02T12:00:00Z",
          resourceId: { videoId: "abcd1234efg" },
        },
      },
      {
        snippet: {
          title: "Evening service",
          description: "A full service.",
          publishedAt: "2026-09-01T12:00:00Z",
          thumbnails: { high: { url: "https://i.ytimg.com/vi/qwer5678tyu/hqdefault.jpg" } },
          resourceId: { videoId: "qwer5678tyu" },
        },
        contentDetails: { videoId: "qwer5678tyu", videoPublishedAt: "2026-09-01T12:00:00Z" },
      },
    ],
  });

  assert.equal(page.nextPageToken, "CAoQAA");
  assert.equal(page.videos.length, 1);
  assert.equal(page.videos[0]?.title, "Evening service");
  assert.equal(page.videos[0]?.thumbnailUrl, "https://i.ytimg.com/vi/qwer5678tyu/hqdefault.jpg");

  assert.equal(
    mapLiveBroadcast({
      items: [
        { id: { videoId: "abcd1234efg" }, snippet: { title: "Sunday live", liveBroadcastContent: "live" } },
      ],
    })?.title,
    "Sunday live",
  );
  assert.equal(
    mapLiveBroadcast({
      items: [
        { id: { videoId: "abcd1234efg" }, snippet: { title: "Soon", liveBroadcastContent: "upcoming" } },
      ],
    }),
    null,
  );
  assert.equal(mapVideoList({ items: [] }), null);

  const url = new URL(playlistItemsUrl("test-key", null));
  assert.equal(url.searchParams.get("playlistId"), "UUMQ7zUtOm8K4vs6t4nkFbdw");
  assert.equal(url.searchParams.get("key"), "test-key");
  assert.equal(url.searchParams.get("maxResults"), "24");
});
