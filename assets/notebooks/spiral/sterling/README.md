# Sterling Notebook — Asset Pack

## Overview

**Brand:** Sterling  
**Country:** Indonesia  
**Category:** Office  
**Paper Size:** A4 (Portrait)  
**Render Mode:** Photo

## Description

The Sterling notebook is designed for professional environments — offices, boardrooms, and executive desks across Indonesia. Its premium ruling, high-quality paper stock, and refined aesthetics set it apart from school notebooks. Wide line spacing ensures comfortable writing, while the clean design complements any professional setting.

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
{ "top": 55, "bottom": 40, "left": 50, "right": 35, "usableWidth": 595, "usableHeight": 785 }
```

## Line Data

- **Total lines:** 26 | **Line spacing:** 30px | **Line color:** #c8d0e0

## Usage

```typescript
const sterling = await getNotebookById('sterling');
```
