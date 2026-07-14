# Premium Blue Notebook — Asset Pack

## Overview

**Brand:** Premium  
**Country:** Indonesia  
**Category:** Premium  
**Paper Size:** A4 (Portrait)  
**Render Mode:** Photo

## Description

A premium quality blue-tinted ruled notebook with a refined aesthetic. The subtle blue tone creates a calm, focused writing environment. The high-quality paper stock accepts ink smoothly, and the consistent fine ruling guides the hand perfectly. Ideal for creative writing, journaling, and professional correspondence.

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

- **Total lines:** 26 | **Line spacing:** 30px | **Line color:** #98bfe0

## Usage

```typescript
const blue = await getNotebookById('notebook-blue');
```
