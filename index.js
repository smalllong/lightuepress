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
    onclick: (e) => {
      if (e.target.tagName == 'A' && !e.target.classList.contains('noscroll')) window.scrollTo(0, 0)
    },
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
              $class: { active: () => l == S.locale, noscroll: 1 },
              $$: config.locales[l].label,
            })
          ),
        },
        navItem: L.a.noscroll({
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
        e.preventDefault()
        e.stopPropagation()
        if (e.target.tagName == 'A') {
          var url = new URL(e.target.href)
          if (url.origin == location.origin) {
            location.hash = '#' + url.pathname + url.hash
            window.scrollTo(0, 0)
          } else window.open(e.target.href)
        }
      },
    },
  })

  function go() {
    var paths = location.hash.slice(1).split('#'),
      path = paths[0],
      hash = paths[1]
    var locale = locales.find((l) => l != '/' && path.startsWith(l))
    if (locale) {
      S.locale = locale
      S.route = '/' + path.slice(locale.length)
    } else {
      S.locale = '/'
      S.route = path
    }
    var xhr = new XMLHttpRequest()
    xhr.open('GET', (path.endsWith('/') ? path + 'index' : path) + '.md')
    xhr.onload = (e) => {
      document.querySelector('main').innerHTML = snarkdown(xhr.response)
    }
    xhr.send()
  }

  go()
  window.addEventListener('hashchange', go)
}

export default Lightuepress
