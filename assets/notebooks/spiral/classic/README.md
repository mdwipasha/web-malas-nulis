# Classic Spiral — Asset Pack

## Overview

**Brand:** Generic  
**Country:** Indonesia  
**Category:** Spiral  
**Paper Size:** A4 (Portrait)  
**Render Mode:** Photo

## Description

The Classic Spiral notebook represents the standard A4 spiral-bound format used across Indonesian schools and offices. Its wide, ruled pages and durable coil binding make it versatile for everything from lecture notes to project planning. The clean white paper and consistent line spacing provide an ideal canvas for handwriting simulation.

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
{ "top": 50, "bottom": 35, "left": 65, "right": 30, "usableWidth": 585, "usableHeight": 795 }
```

## Line Data

- **Total lines:** 28 | **Line spacing:** 28px | **Line color:** #a8c8e8

## Usage

```typescript
const classicSpiral = await getNotebookById('classic-spiral');
```
