# Obsidian Code Previews Plugin

## 全部功能展示

具体示例可以直接使用 `Open folder as  vault` 打开 [example.zip](https://github.com/zjhcn/obsidian-code-preview/releases/download/1.3.6/example.zip)。

### 路径

<details open>
<summary> 基本使用 </summary>

代码块的语言默认使用文件的扩展名。

<pre><code>```preview
path: hello.js
```</code></pre>

</details>

<details open>
<summary> 相对路径 </summary>

<pre><code>```preview
path: ./hello.js
```</code></pre>

</details>

<details open>
<summary> 绝对路径 </summary>

绝对路径是以Vault的文件夹路径作为根目录的。

<pre><code>```preview
path: /sub/color.css
```</code></pre>

<pre><code>```preview
path: /hello.js
```</code></pre>

</details>

### 代码块语言

代码块的语言默认使用文件的扩展名。

语言配置属性: `language`、`lang`

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

### 选择显示的行范围

自定义开始或者结束的行

<details open>
<summary> 第三行到文件最后 </summary>

<pre><code>```preview
path: /sub/color.css
start: 3
```</code></pre>

</details>

<details open>
<summary> 文件开头到第三行 </summary>

<pre><code>```preview
path: /sub/color.css
end: 3
```</code></pre>

</details>

<details open>
<summary> 只显示第三行 </summary>

<pre><code>```preview
path: /sub/color.css
start: 3
end: 3
```</code></pre>

</details>

<details open>
<summary> 指定显示范围 </summary>

<pre><code>```preview
path: /sub/color.css
start: 2
end: 3
```</code></pre>

</details>

<details open>
<summary> end 根据start增长 </summary>

`end: "+1"`，这里面的`"`是必须的。

<pre><code>```preview
path: /sub/color.css
start: 2
end: "+1"
```</code></pre>

</details>

<details open>
<summary> 使用正则或者直接文本搜索 </summary>

`/dd\d{2}/`

<pre><code>```preview
path: /sub/color.css
start: body
end: dd\\d{2}
```</code></pre>

如果你不会正则，也可以直接使用文本搜索，例如：

`start: body`: 匹配 `body` 所在的行数
`end: dd00dd`: 匹配 `dd00dd` 所在的行数

<pre><code>```preview
path: /sub/color.css
start: body
end: dd00dd
```</code></pre>

</details>

### 高亮行

<details open>
<summary> 按行号高亮 </summary>

<pre><code>```preview
path: /sub/color.css
highlight: 1
```</code></pre>

</details>

<details open>
<summary> 按行号范围高亮 </summary>

<pre><code>```preview
path: /sub/color.css
highlight: 1-3
```</code></pre>

</details>

<details open>
<summary> 按文本搜索高亮 </summary>

<pre><code>```preview
path: /sub/color.css
highlight: dd00dd
```</code></pre>

</details>

<details open>
<summary> 按正则搜索高亮 </summary>

<pre><code>```preview
path: /sub/color.css
highlight: /dd\d{2}/
```</code></pre>

</details>

<details open>
<summary> 多个条件 </summary>

多个条件使用 `,`隔开。

<pre><code>```preview
path: /sub/color.css
highlight: /dd\d{2}/, 1, body
```</code></pre>

也可以使用数组形式

<pre><code>```preview
path: /sub/color.css
highlight:
  - /dd\d{2}/
  - 1
  - body
```</code></pre>

</details>

## 代码块YAML配置项

|配置 |说明 |类型 |默认值|
|---|---|---|---|
| path | 文件路径 | string |  必填 |
| start | 预览开始行数从1开始 | number or string or RegExp |  - |
| end | 预览结束行数 | number or string or RegExp |  - |
| highlight | 高亮的行 | number or string or RegExp | - |
| linenumber | 是否显示行号, 优先级大于插件配置 | true or false | 插件配置 |

## 插件配置

|配置 |说明 |类型 |默认值|
|---|---|---|---|
| watchAlias | 监听Alias文件夹变化，更新输入提示。可能有性能问题 | boolean | false |
| watchCode | 监听已经预览的代码文件，文件变更时更新渲染内容。可能有性能问题 | boolean | false |
| highLightColor | 高亮背景色 | css color | #2d82cc20 |
| include | 包含的路径，为空即包含全部 | `Array<string or RegExp>` |  [] |
| exclude | 排除的路径 | `Array<string or RegExp>` |  ["node_modules", ".obsidian"] |
| includeFile | 包含的文件, Required | `Array<string or RegExp>` |  ["/\\.(j|t)s$/", "/\\.css$/"] |
| excludeFile | 排除的文件 | `Array<string or RegExp>` |  [] |
| alias | 路径映射 | string \| Alias |  code |
| linenumber | 是否显示行号 | true or false | true |

## Thank

linenumber, highlight 基于[obsidian-better-codeblock](https://github.com/stargrey/obsidian-better-codeblock)基础实现
