# Boss Notebook — Asset Pack

## Overview

**Brand:** Boss  
**Country:** Indonesia  
**Category:** School (SMA/SMP)  
**Paper Size:** A4 (Portrait)  
**Render Mode:** Photo

## Description

The Boss Notebook is an iconic Indonesian school notebook used by millions of students across SMA (senior high school) and SMP (junior high school). It features a distinctive header block at the top for writing student information (Name, Class, Number, Date), left-side checkboxes aligned with each ruled line for tracking completed items, and a warm paper tone printed on quality paper stock.

## Asset Pack Contents

| File | Description |
|------|-------------|
| `page_01.jpg` | Full-resolution scan of one notebook page |
| `metadata.json` | Notebook identification and properties |
| `write-area.json` | Computed writable area boundaries (px) |
| `lines.json` | Ruled line detection data (count, spacing, positions) |
| `thumbnail.webp` | 200×260 thumbnail for UI selectors |
| `preview.webp` | 400×520 preview for template browser |
| `mask.png` | Binary mask: white = writable, black = margins/header |
| `README.md` | This file |

## Write Area

```json
{
  "top": 110,       "bottom": 30,
  "left": 68,       "right": 30,
  "header": 110,    "footer": 30,
  "usableWidth": 582, "usableHeight": 740
}
```

## Line Data

- **Total lines:** 26
- **Line spacing:** 28px
- **First line Y:** 138px (after header)
- **Last line Y:** 838px
- **Line color:** #c0cce0

## Rendering Notes

- The header area (top 110px) displays: Nama / Kelas / No. / Date
- Checkboxes appear at x=36px, centered on each line baseline
- Handwriting starts at x=68px (after checkbox column)
- Template respects the warm paper texture of the original scan
- Default ink: Blue ballpoint (`blue-ballpoint`)
- Default handwriting style: Neat student (`student-neat`)

## Usage

```typescript
import { getNotebookById } from '@/lib/notebook-api';

const boss = await getNotebookById('boss');
// boss.writeArea.left === 68
// boss.lines.lineSpacing === 28
```
