# Obsidian Code Previews Plugin

[中文](./README.CN.md)

## Example

Specific examples can be use `Open folder as  vault` open [example.zip](https://github.com/zjhcn/obsidian-code-preview/releases/download/1.3.10/example-1.3.10.zip).

### Path

<details open>
<summary> Basic </summary>

Code language is extname by path

<pre><code>```preview
path: hello.js
```</code></pre>

</details>

<details open>
<summary> Relative Path </summary>

<pre><code>```preview
path: ./hello.js
```</code></pre>

</details>

<details open>
<summary> Absolute Path </summary>

The root path is Vault folder

<pre><code>```preview
path: /sub/color.css
```</code></pre>

<pre><code>```preview
path: /hello.js
```</code></pre>

</details>

### CodeBlock language

Code language is extname by path

Language key: `language`、`lang`

<details open>
<summary> language、lang </summary>

<pre><code>```preview
path: ./hello.js
lang: ts
```</code></pre>

<pre><code>```preview
path: ./hello.js
language: ts
```</code></pre>

</details>

### Select display line range

custom start or end

<details open>
<summary> The third line of the file ends </summary>

<pre><code>```preview
path: /sub/color.css
start: 3
```</code></pre>

</details>

<details open>
<summary> The first line to the third line </summary>

<pre><code>```preview
path: /sub/color.css
end: 3
```</code></pre>

</details>

<details open>
<summary> Only preview the third line </summary>

<pre><code>```preview
path: /sub/color.css
start: 3
end: 3
```</code></pre>

</details>

<details open>
<summary> Line Range </summary>

<pre><code>```preview
path: /sub/color.css
start: 2
end: 3
```</code></pre>

</details>

<details open>
<summary> end increase by start </summary>

`end: "+1"`, config `"` is required.

<pre><code>```preview
path: /sub/color.css
start: 2
end: "+1"
```</code></pre>

</details>

<details open>
<summary> Use RegExp or Search text) </summary>

`/dd\d{2}/`

<pre><code>```preview
path: /sub/color.css
start: body
end: /dd\d{2}/
```</code></pre>

If you don't know RegExp, just use text directly. like:

`start: body`: match `body` inside the line
`end: dd00dd`: match `dd00dd` inside the line

<pre><code>```preview
path: /sub/color.css
start: body
end: dd00dd
```</code></pre>

</details>

### Highlight

<details open>
<summary> By line </summary>

<pre><code>```preview
path: /sub/color.css
highlight: 1
```</code></pre>

</details>

<details open>
<summary> Range </summary>

<pre><code>```preview
path: /sub/color.css
highlight: 1-3
```</code></pre>

</details>

<details open>
<summary> Search text </summary>

<pre><code>```preview
path: /sub/color.css
highlight: dd00dd
```</code></pre>

</details>

<details open>
<summary> RegExp </summary>

<pre><code>```preview
path: /sub/color.css
highlight: /dd\d{2}/
```</code></pre>

</details>

<details open>
<summary> Multi rule </summary>

Separator `,`.

<pre><code>```preview
path: /sub/color.css
highlight: /dd\d{2}/, 1, body
```</code></pre>

YAML list

<pre><code>```preview
path: /sub/color.css
highlight:
  - /dd\d{2}/
  - 1
  - body
```</code></pre>

</details>

## CodeBlock YAML config

| Config | Description | Type |Default|
|---|---|---|---|
| path | file path | string |  Required |
| start | preview start line. Start with 1 | number or string or RegExp |  - |
| end | preview end line. | number or string or RegExp |  - |
| highlight | highlight lines | number or string or RegExp | - |
| linenumber | display line Numbers, priority is greater than the plugin configuration | true or false | plugin config |

## Plugin configuration

| Config | Description | Type |Default|
|---|---|---|---|
| watchAlias | Listening Alias folder changes, update input suggest. May affect performance | boolean | false |
| watchCode | Listen to the previewed code file and update the render when the file changes. May affect performance | boolean | false |
| highLightColor | highlight background | css color | #2d82cc20 |
| include | include path, Empty is All | `Array<string or RegExp>` |  [] |
| exclude | exclude path | `Array<string or RegExp>` |  ["node_modules", ".obsidian"] |
| includeFile | include file, Required | `Array<string or RegExp>` |  ["/\\.js$/", "/\\.css$/"] |
| excludeFile | exclude file | `Array<string or RegExp>` |  [] |
| alias | alias path | string \| Alias |  code |
| linenumber | display linenumber | true or false | true |

## Thank

linenumber, highlight Based on [obsidian-better-codeblock](https://github.com/stargrey/obsidian-better-codeblock) his implementation
