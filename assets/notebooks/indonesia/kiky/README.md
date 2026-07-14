# Kiky Notebook — Asset Pack

## Overview

**Brand:** Kiky  
**Country:** Indonesia  
**Category:** School  
**Paper Size:** A5 (Portrait)  
**Render Mode:** Photo

## Description

Kiky is one of Indonesia's most recognizable school notebook brands, found in every stationery shop from Sabang to Merauke. The notebook features simple, clean ruled lines printed on bright white paper. Its affordable price and consistent quality have made it a staple in Indonesian elementary and junior high schools for decades.

## Asset Pack Contents

| File | Description |
|------|-------------|
| `page_01.jpg` | Full-resolution scan of one notebook page |
| `metadata.json` | Notebook identification and properties |
| `write-area.json` | Computed writable area boundaries (px) |
| `lines.json` | Ruled line detection data |
| `README.md` | This file |

## Write Area

```json
{ "top": 50, "bottom": 30, "left": 30, "right": 25, "usableWidth": 625, "usableHeight": 800 }
```

## Line Data

- **Total lines:** 30 | **Line spacing:** 26px | **Line color:** #b8d0e8

## Usage

```typescript
const kiky = await getNotebookById('kiky');
```
