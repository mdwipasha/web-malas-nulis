# Minimal Notebook — Asset Pack

## Overview

**Brand:** Generic  
**Country:** Indonesia  
**Category:** Classic  
**Paper Size:** A5 (Portrait)  
**Render Mode:** Photo

## Description

A minimalist A5 notebook with tightly-spaced ruled lines and an uncluttered design. The narrow line spacing accommodates more content per page, making it a favorite for dense note-taking, journaling, and academic coursework. Its subtle paper color and fine line weight project a modern, premium aesthetic.

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
{ "top": 40, "bottom": 30, "left": 25, "right": 25, "usableWidth": 630, "usableHeight": 810 }
```

## Line Data

- **Total lines:** 33 | **Line spacing:** 24px | **Line color:** #c0c8d8

## Usage

```typescript
const minimal = await getNotebookById('minimal');
```
