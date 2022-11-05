Customize the preview of the row

The third line of the file to the end

```preview
path: /sub/color.css
start: 3
```

The first line to the third line

```preview
path: /sub/color.css
end: 3
```

Only preview the third line

```preview
path: /sub/color.css
start: 3
end: 3
```

Use RegExp

`/dd\d{2}/` 

```preview
path: /sub/color.css
start: 1
end: /dd\d{2}/
```

If you don't know RegExp, just use text directly. like:

`dd00dd`: match `dd00dd` inside the line

```preview
path: /sub/color.css
start: 1
end: dd00
```
