# Suno Lyrics Exporter

English | [简体中文](README.zh-CN.md)

> Check, preview, and export synchronized lyrics directly from a Suno song page.

Suno Lyrics Exporter is a Manifest V3 browser extension for Microsoft Edge and Google Chrome. Once installed, it adds a small **♪ Export Lyrics** button to Suno song pages. There is no need to open DevTools, copy a song ID, or call an API manually.

It exports **SRT, LRC, WebVTT, and JSON**, and can also download the song's cover image.

> [!IMPORTANT]
> This is an unofficial community project. It is not affiliated with or endorsed by Suno. The extension relies on Suno's current private APIs, which may change without notice.

## Features

- Detects song IDs on both `/song/<id>` and `/edit/<id>` routes
- Follows Suno's client-side navigation without requiring a page reload
- Compares the original lyrics with Suno's synchronized transcription
- Shows a completeness score before export
- Lists original lyric lines that could not be matched reliably
- Offers **Original Lyrics** and **Sung Lyrics** subtitle modes
- Supports Chinese, English, Japanese, and mixed-language lyrics
- Handles punctuation, repeated choruses, missing tokens, extra tokens, and small sung-word substitutions
- Filters common section labels and arrangement directions by default
- Provides an adjustable start offset and prevents adjacent subtitle cues from overlapping
- Exports UTF-8 SRT, LRC, WebVTT, and JSON files
- Copies the generated subtitle text with one click
- Downloads the high-resolution Suno cover image
- Shows a five-cue preview, with an option to inspect every cue
- Includes diagnostics and raw JSON download tools
- Uses Shadow DOM so extension styles do not leak into the Suno page
- Remembers the preferred format, offset, subtitle source, label setting, and panel position

## Installation

The extension is currently installed in developer mode. [Node.js](https://nodejs.org/) 20 or newer is required to build it.

```bash
git clone https://github.com/DongquanZheng/suno-lyrics-exporter.git
cd suno-lyrics-exporter
npm install
npm run build
```

The build command creates a loadable extension in `dist/`.

### Microsoft Edge

1. Open `edge://extensions`.
2. Enable **Developer mode**.
3. Click **Load unpacked**.
4. Select the generated `dist` directory.

### Google Chrome

1. Open `chrome://extensions`.
2. Enable **Developer mode**.
3. Click **Load unpacked**.
4. Select the generated `dist` directory.

## Usage

1. Sign in to [Suno](https://suno.com/).
2. Open a song page such as `https://suno.com/song/<song-id>`.
3. Click **♪ Export Lyrics** in the lower-right corner.
4. Review the match count and subtitle preview.
5. Choose the subtitle source, output format, and timing offset.
6. Click **Download SRT** or **Copy**.

When you navigate to another song, the panel automatically discards the old result and loads the new song.

### Subtitle sources

| Mode | Behavior |
| --- | --- |
| Original | Uses the full lyrics entered when the song was created and assigns timestamps through monotonic alignment. This is the default. |
| Sung | Uses Suno's synchronized transcription exactly as returned. This is useful when the generated performance changes or omits words. |

### Completeness status

```text
✓ 42 / 42 lines matched
```

Every original lyric line has a reliable synchronized match.

```text
⚠ 39 / 42 lines matched
```

Three original lines could not be matched reliably. The extension lists them for review, but downloading remains available.

## Diagnostics

Expand **Diagnostics** at the bottom of the panel to inspect:

- Song ID
- Metadata status
- Original lyric line count
- Aligned word count
- Matched and total line counts
- The active Suno endpoint
- Extension version
- Technical error details, when available

Use **Download raw JSON** to save the current clip metadata and aligned-lyrics response. The file does not contain your Suno session token.

## Development

```bash
npm install
npm run dev        # rebuild dist/ when source files change
npm test           # run the automated fixtures
npm run typecheck  # run strict TypeScript checking
npm run check      # typecheck, test, build, and verify dist/
```

To run the alignment and export harness without a Suno login:

```bash
npm run harness
```

Then open <http://127.0.0.1:4173>.

The harness uses explicit local fixture data. It validates the alignment, completeness, timing, and export code, but does not pretend to test the live Suno API.

## Project structure

```text
public/
  manifest.json          Manifest V3 configuration
src/
  alignment/             Multilingual similarity and monotonic alignment
  background/            Restricted API proxy and cover downloads
  content/               Page injection and SPA navigation tracking
  export/                SRT, LRC, WebVTT, and JSON exporters
  lyrics/                Subtitle timing rules
  popup/                 Browser toolbar entry point
  suno/                  Suno response adapters
  ui/                    Shadow DOM panel
  utils/                 Text, filename, and settings helpers
tests/                   Automated fixtures
harness/                 No-login browser harness
scripts/                 Build and artifact verification scripts
```

The Suno adapters, alignment engine, exporters, and UI are independent. If Suno changes an endpoint or response shape, the affected code should usually be limited to `src/suno/` and the background request allowlist.

## Permissions and privacy

The extension requests only these browser permissions:

| Permission | Purpose |
| --- | --- |
| `storage` | Saves format, offset, subtitle source, label preference, and panel position locally |
| `activeTab` | Opens the exporter in the current Suno tab from the toolbar popup |
| `downloads` | Saves the song cover image directly to the Downloads folder |

Host access is limited to:

```text
https://suno.com/*
https://studio-api.prod.suno.com/*
```

The project has no analytics, advertising, or external backend. The Suno session token is used in memory for the requested API call and is never written to storage or included in diagnostics.

## Known limitations

- Suno's synchronized timing can be inaccurate, particularly after lyrics have been edited.
- If an entire line has the wrong timestamp, aligned lyrics alone may not contain enough information to recover the true vocal position.
- A long pause between words can be intentional, so the extension does not automatically compress large token gaps.
- A lyric line omitted by Suno is reported as missing; the extension does not invent a timestamp for it.
- Arrangement-direction filtering is deliberately conservative to avoid silently deleting real lyrics.
- Local speech recognition and per-line manual timing are not currently included.

## Release checklist

1. Update the version in `package.json`, `public/manifest.json`, and `scripts/build.mjs`.
2. Run `npm ci && npm run check`.
3. Smoke-test a real song in both Edge and Chrome.
4. Zip the contents of `dist/`, not the `dist` folder itself.
5. Submit the archive to the Chrome Web Store or Microsoft Edge Add-ons.

## Acknowledgements

This project was inspired by [cityedge/suno_srt_downloader](https://github.com/cityedge/suno_srt_downloader), particularly its documented aligned-lyrics endpoint and subtitle timing approach.

The reference project is MIT-licensed. Suno Lyrics Exporter is a separate TypeScript and Manifest V3 implementation rather than a mechanical fork. See [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md) for attribution details.

## License

[MIT](LICENSE) © 2026 Suno Lyrics Exporter contributors
