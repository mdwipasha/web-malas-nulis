# Okey Notebook — Asset Pack

## Overview

**Brand:** Okey  
**Country:** Indonesia  
**Category:** School  
**Paper Size:** A5 (Portrait)  
**Render Mode:** Photo

## Description

The Okey notebook is a classic of Indonesian elementary schooling. With wide-ruled lines and soft paper, it is specifically designed for younger students still developing their handwriting. The warm paper tone and robust binding make it a reliable daily companion in classrooms across the archipelago.

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
const okey = await getNotebookById('okey');
```
