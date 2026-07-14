# Amigo Spiral — Asset Pack

## Overview

**Brand:** Amigo  
**Country:** Indonesia  
**Category:** Spiral  
**Paper Size:** A5 (Portrait)  
**Render Mode:** Photo

## Description

The Amigo spiral-bound notebook offers a convenient flat-lay experience. Its coil binding lets the pages fold completely back, making it ideal for taking notes in small spaces. The ruled pages feature light blue horizontal lines on bright white paper. Popular among high school and university students for its portability and durability.

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
{ "top": 45, "bottom": 35, "left": 60, "right": 25, "usableWidth": 595, "usableHeight": 800 }
```

> Note: left margin (60px) accounts for spiral binding coil shadow.

## Line Data

- **Total lines:** 30 | **Line spacing:** 26px | **Line color:** #b8c8d8

## Usage

```typescript
const amigo = await getNotebookById('amigo');
```
