## Obsidian Code Previews Plugin

## use preview

`example/preview`

### Basic

Code language is extname by path

<pre><code>```preview
path: hello.js
```</code></pre>

### Relative Path And Language

Language key: `language`、`lang`

<pre><code>```preview
path: ./hello.js
lang: ts
```</code></pre>

<pre><code>```preview
path: ./hello.js
language: ts
```</code></pre>

### Root Path

The root path is Vault folder

<pre><code>```preview
path: /sub/color.css
```</code></pre>

<pre><code>```preview
path: /hello.js
```</code></pre>

### Select Line 

Customize the preview of the row

#### The third line of the file ends

<pre><code>```preview
path: /sub/color.css
start: 3
```</code></pre>

#### The first line to the third line

<pre><code>```preview
path: /sub/color.css
end: 3
```</code></pre>

#### Only preview the third line

<pre><code>```preview
path: /sub/color.css
start: 3
end: 3
```</code></pre>

#### Use RegExp (search text)

`dd\\d{2}` -> `/dd\d{2}/`

If you don't know RegExp, just use text directly. like:

`dd00dd`: match `dd00dd` inside the line

<pre><code>```preview
path: /sub/color.css
start: body
end: dd\\d{2}
```</code></pre>


## use espanso

`example/espanso`

## TODO

- [ ] Edit preivew file in Obsidian
- [x] Configurable preview rows

