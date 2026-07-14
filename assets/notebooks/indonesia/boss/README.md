# Boss Notebook

## Overview

**Brand:** Boss
**Country:** Indonesia
**Category:** school
**Paper Size:** A4
**Orientation:** portrait
**Render Mode:** photo

## Description

Indonesian SMA/SMP school notebook by Boss brand. Features a header section for student name, class number and date, plus left-side checkboxes on every line. Warm wooden desk aesthetic.

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
  "top": 126,
  "bottom": 50,
  "left": 53,
  "right": 24,
  "header": 126,
  "footer": 50,
  "usableWidth": 454,
  "usableHeight": 544
}
```

## Lines

```json
{
  "lineCount": 30,
  "lineSpacing": 16,
  "baseline": 142,
  "firstLine": 142,
  "lastLine": 670,
  "color": "#ab9b98"
}
```
