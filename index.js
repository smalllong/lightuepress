import L from 'lightue'
import snarkdown from 'snarkdown'
import './layout.css'
import './page.css'

function Lightuepress(config) {
  if (!config) return
  var locales = Object.keys(config.locales),
    S = L.useState({
      locale: '/',
      config: {},
      route: '/',
    })

  L.watchEffect(() => (S.config = config.locales[S.locale]))

  function SidebarLinks(arr, level) {
    return arr.map((item) => ({
      $$: item.link
        ? L.a({
            _href: () => '#' + S.locale + item.link.slice(1),
            _class: 'sidebar-item sidebar-item-' + level,
            $class: { active: () => S.route == item.link },
            $$: item.text,
          })
        : {
            _class: 'sidebar-item sidebar-item-' + level,
            $$: item.text,
          },
      sidebarLinks: item.children ? SidebarLinks(item.children, level + 1) : null,
    }))
  }

  L({
    navBar: {
      navBarTitle: L.a({
        _href: () => '#' + S.locale,
        $$: () => S.config.title,
      }),
      nav: {
        $tag: 'nav',
        $$: () =>
          S.config.nav.map((n) =>
            L.a({
              _href: '#' + S.locale + n.link.slice(1),
              $class: { active: () => new RegExp(n.activeMatch).test(S.route) },
              $$: n.text,
            })
          ),
        $_locales: {
          navItem: L.button({
            $$: () => config.locales[S.locale].selectText,
            $$arrow: ' ▽',
          }),
          dialog: locales.map((l) =>
            L.a.sidebarItem({
              _href: () => '#' + l + S.route.slice(1),
              $class: { active: () => l == S.locale },
              $$: config.locales[l].label,
            })
          ),
        },
        navItem: L.a({
          $if: config.repo,
          _href: 'https://github.com/' + config.repo,
          _target: '_blank',
          $$: 'GitHub ↗',
        }),
      },
    },
    sidebar: {
      sidebarLinks: () => {
        for (var i in S.config.sidebar) {
          if (S.route.startsWith(i)) {
            return SidebarLinks(S.config.sidebar[i], 0)
          }
        }
      },
    },
    page: {
      $tag: 'main',
      onclick: (e) => {
        var a = e.target
        while (a && a.tagName != 'A') a = a.parentElement
        if (a == null) return
        e.preventDefault()
        e.stopPropagation()
        var url = new URL(a.href)
        if (url.origin == location.origin) {
          location.hash = '#' + S.locale + url.pathname.slice(1) + url.hash
        } else window.open(a.href)
      },
    },
  })

  var cachedMD = {}

  function highlightCode(mainEl) {
    var codeBlocks = mainEl.querySelectorAll('pre > code')
    codeBlocks.forEach((cb) => {
      cb.innerHTML = highlight(cb.innerHTML, cb.className.slice(9))
    })
  }

  function wrap(part, classFlag) {
    if (part) return `<span class="hl-${classFlag}">${part}</span>`
    else return ''
  }

  function highlight(code, lang) {
    if (lang == 'js') {
      // string|string|keyword|number|method|identifier|comment
      return code
        .replace(/&gt;/g, '>')
        .split(
          /('.*?[^\\]')|(".*?[^\\]")|\b(var|const|let|function|for|in|of|import|from)\b|\b(\d+)\b|([\$\w]+)(?=\()|([\$\w]+)|(\/\/[^\n]*)/
        )
        .map((part, i, arr) => {
          if (i % 8) return
          var roundArr = arr.slice(i, i + 8)
          return (
            part +
            wrap(roundArr[1], 's') +
            wrap(roundArr[2], 's') +
            wrap(roundArr[3], 'k') +
            wrap(roundArr[4], 'n') +
            wrap(roundArr[5], 'm') +
            wrap(roundArr[6], 'i') +
            wrap(roundArr[7], 'c')
          )
        })
        .join('')
    } else if (lang == 'html') {
      // start|start|end|attr|value
      return code
        .split(/(&lt;\w+)|(&gt;)|(&lt;\/\w+&gt;)|(\w+)(?==)|(".*?")/)
        .map((part, i, arr) => {
          if (i % 6) return
          var roundArr = arr.slice(i, i + 6)
          return (
            part +
            wrap(roundArr[1], 's') +
            wrap(roundArr[2], 's') +
            wrap(roundArr[3], 's') +
            wrap(roundArr[4], 'i') +
            wrap(roundArr[5], 'n')
          )
        })
        .join('')
    }
  }

  function go() {
    var paths = location.hash.slice(1).split('#'),
      path = paths[0],
      hash = paths[1]
    if (path == '') path = '/'
    var locale = locales.find((l) => l != '/' && path.startsWith(l))
    if (locale) {
      S.locale = locale
      S.route = '/' + path.slice(locale.length)
    } else {
      S.locale = '/'
      S.route = path
    }
    var mainEl = document.querySelector('main')
    if (cachedMD[path]) {
      window.scrollTo(0, 0)
      mainEl.innerHTML = cachedMD[path]
      highlightCode(mainEl)
    } else {
      var xhr = new XMLHttpRequest()
      xhr.open('GET', (path.endsWith('/') ? path + 'index' : path) + '.md')
      xhr.onload = (e) => {
        var result = snarkdown(xhr.response)
        window.scrollTo(0, 0)
        mainEl.innerHTML = result
        highlightCode(mainEl)
        cachedMD[path] = result
      }
      xhr.send()
    }
  }

  go()
  window.addEventListener('hashchange', go)
}

export default Lightuepress
