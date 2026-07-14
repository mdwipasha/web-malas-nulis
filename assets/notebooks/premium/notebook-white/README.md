# Premium White Notebook — Asset Pack

## Overview

**Brand:** Premium  
**Country:** Indonesia  
**Category:** Premium  
**Paper Size:** A4 (Portrait)  
**Render Mode:** Photo

## Description

An ultra-clean premium white notebook. Bright white paper with fine blue ruling creates the ideal conditions for pristine handwriting simulation. A minimalist, timeless choice for professionals and writers who demand the best. The clean white ground makes every ink color pop with clarity.

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
{ "top": 50, "bottom": 35, "left": 45, "right": 35, "usableWidth": 600, "usableHeight": 795 }
```

## Line Data

- **Total lines:** 26 | **Line spacing:** 30px | **Line color:** #c8d6e8

## Usage

```typescript
const white = await getNotebookById('notebook-white');
```
