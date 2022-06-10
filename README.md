# LightuePress

<a href="https://npmjs.com/package/lightuepress"><img src="https://img.shields.io/npm/v/lightuepress.svg" alt="npm-v"></a>
<a href="https://npmjs.com/package/lightuepress"><img src="https://img.shields.io/npm/dt/lightuepress.svg" alt="npm-d"></a>
<a href="https://bundlephobia.com/result?p=lightuepress"><img src="https://img.badgesize.io/https:/unpkg.com/lightuepress/dist/lightuepress.min.js?label=brotli&compression=brotli" alt="brotli"></a>

Lightue and snarkdown powered static site generator

It is similar to VuePress, VitePress, Docsify. But it has the following highlights:

- Super lightweight (<5KB min+br)
- No compilation or server configuration needed

## Usage

Create your entry html file, add CDN script and pass in your configurations:

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Your title</title>
  </head>
  <body>
    <script src="https://unpkg.com/lightuepress@0.0.9/dist/lightuepress.min.js"></script>
    <script>
      // optionally set your default path based on user language
      if (location.hash == '') location.hash = navigator.language.slice(0, 2) == 'zh' ? '#/zh/' : '#/'
      // call Lightuepress and pass in configurations
      Lightuepress({
        // refer to this example on how to configure Lightuepress
        // https://github.com/smalllong/lightue/blob/master/docs/index.html
      })
    </script>
  </body>
</html>
```

Live example: https://lightue.netlify.app/
