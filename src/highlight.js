
/**
 * Simple code highlighter using Regexp
 * @param {string} code - source code
 * @param {string} lang - html|css|js
 * @returns {string}
 */
export default function highlight(code, lang) {
  if (lang == 'js') {
    // string|string|keyword|number|method|identifier|comment
    return highlightReplace(
      code.replace(/&gt;/g, '>'),
      /('.*?[^\\]'|".*?[^\\]")|\b(var|const|let|function|for|in|of|import|from)\b|\b(\d+)\b|([\$\w]+)(?=\()|([\$\w]+)|(\/\/[^\n]*)/,
      ['s', 'k', 'n', 'm', 'i', 'c']
    )
  } else if (lang == 'html') {
    // start|start|end|attr|value|comment
    return highlightReplace(code, /(&lt;\w+|&gt;|&lt;\/\w+&gt;)|([\w-]+)(?==)|(".*?")|(&lt;!--[\w\s]+--&gt;)/, [
      's',
      'i',
      'n',
      'c',
    ])
  } else if (lang == 'css') {
    // property|number|selector|selector
    return highlightReplace(code, /([\w-]+:)|\b(\d+)\b|(#[\w-_]+|\.[\w-_]+)/, ['k', 'n', 'i'])
  }
  return ''
}

function highlightReplace(code, regexp, types) {
  return code
    .split(regexp)
    .map((part, i, arr) => {
      if (i % (types.length + 1)) return
      var roundArr = arr.slice(i + 1, i + types.length + 1)
      return part + types.map((t, j) => wrap(roundArr[j], t)).join('')
    })
    .join('')
}

function wrap(part, classFlag) {
  if (part) return `<span class="hl-${classFlag}">${part}</span>`
  else return ''
}
