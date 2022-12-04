
Specific examples can be use `Open folder as  vault` open [example.zip]().

### Path

#### Basic

Code language is extname by path

```preview
path: hello.js
```

#### Relative Path

```preview
path: ./hello.js
```

#### Absolute Path

The root path is Vault folder

```preview
path: /sub/color.css
```

```preview
path: /hello.js
```

### CodeBlock language

Code language is extname by path

Language key: `language`、`lang`

#### language、lang

```preview
path: ./hello.js
lang: ts
```

```preview
path: ./hello.js
language: ts
```

### Select display line range

custom start or end

#### The third line of the file ends

```preview
path: /sub/color.css
start: 3
```

#### The first line to the third line

```preview
path: /sub/color.css
end: 3
```

#### Only preview the third line

```preview
path: /sub/color.css
start: 3
end: 3
```

#### Line Range

```preview
path: /sub/color.css
start: 2
end: 3
```

## end increase by start

`end: "+1"`, config `"` is required.

```preview
path: /sub/color.css
start: 2
end: "+1"
```

#### Use RegExp or Search text)

`/dd\d{2}/`

```preview
path: /sub/color.css
start: body
end: /dd\d{2}/
```

If you don't know RegExp, just use text directly. like:

`start: body`: match `body` inside the line
`end: dd00dd`: match `dd00dd` inside the line

```preview
path: /sub/color.css
start: body
end: dd00dd
```

### Highlight

#### By line

```preview
path: /sub/color.css
highlight: 1
```

#### Range

```preview
path: /sub/color.css
highlight: 1-3
```

#### Search text

```preview
path: /sub/color.css
highlight: dd00dd
```

#### RegExp

```preview
path: /sub/color.css
highlight: /dd\d{2}/
```

#### Multi rule

Separator use `,`

```preview
path: /sub/color.css
highlight: /dd\d{2}/, 1, body
```

YAML list

```preview
path: /sub/color.css
highlight:
  - /dd\d{2}/
  - 1
  - body
```

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
| highLightColor | highlight background | css color | #2d82cc20 |
| include | include path, Empty is All | `Array<string or RegExp>` |  [] |
| exclude | exclude path | `Array<string or RegExp>` |  ["node_modules", ".obsidian"] |
| includeFile | include file, Required | `Array<string or RegExp>` |  ["/\\.js$/", "/\\.css$/"] |
| excludeFile | exclude file | `Array<string or RegExp>` |  [] |
| alias | alias path | string \| Alias |  code |
| linenumber | display linenumber | true or false | true |
