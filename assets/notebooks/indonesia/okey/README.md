# Okey Notebook

## Overview

**Brand:** Okey
**Country:** Indonesia
**Category:** school
**Paper Size:** A5
**Orientation:** portrait
**Render Mode:** photo

## Description

Okey brand notebook — a staple of Indonesian elementary schools. Wide ruled lines and soft paper tone.

## Asset Pack

| File | Purpose |
| --- | --- |
| `page_01.jpg` | Source notebook page image |
| `thumbnail.webp` | 200x260 selector thumbnail |
| `preview.webp` | 400x520 notebook preview |
| `metadata.json` | Notebook identity and rendering metadata |
| `write-area.json` | Writable area boundaries in source-image pixels |
| `lines.json` | Ruled-line detection result |
| `mask.png` | Writable area mask, white for writable pixels and black for protected pixels |

## Write Area

```json
{
  "top": 68,
  "bottom": 65,
  "left": 32,
  "right": 29,
  "header": 0,
  "footer": 0,
  "usableWidth": 674,
  "usableHeight": 913
}
```

## Lines

```json
{
  "lineCount": 31,
  "lineSpacing": 29,
  "baseline": 97,
  "firstLine": 97,
  "lastLine": 981,
  "color": "#ababab"
}
```
