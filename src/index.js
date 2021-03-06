import L from 'lightue'
import snarkdown from 'snarkdown'
import highlight from './highlight'
import Link from './comp/Link'
import SidebarLinks from './comp/SidebarLinks'
import './css/layout.css'
import './css/page.css'

/**
 * initialize LightuePress
 * @param {object} config - Configurations
 */
function Lightuepress(config) {
  if (!config) return
  var locales = Object.keys(config.locales),
    S = L.useState({
      locale: '/',
      config: {},
      route: '', // default is empty, later it changed to '/' and load md file
      sidebarShown: false,
      curSidebar: [], // current showing sidebar
      pages: [],
    })

  L.watchEffect(() => (S.config = config.locales[S.locale]))
  L.watchEffect(() => {
    for (var i in S.config.sidebar) {
      if (S.route.startsWith(i)) {
        S.curSidebar = S.config.sidebar[i]
        break
      }
    }
  })
  L.watchEffect(() => {
    S.pages = S.curSidebar.reduce((previous, current) => previous.concat(current.children), [])
  })

  if (!window.matchMedia('(prefers-color-scheme:dark)').matches) document.body.classList.add('light')

  L({
    navBar: {
      sidebarToggler: L.button.navItem({
        $$: '📑',
        onclick: (e) => (S.sidebarShown = !S.sidebarShown),
      }),
      navBarTitle: Link(() => ({ href: '#' + S.locale, text: S.config.title })),
      nav: {
        $tag: 'nav',
        $$: () =>
          S.config.nav.map((n) =>
            n.items
              ? L.span({
                  _class: 'nav-dropdown',
                  navItem: L.button({
                    $$: n.text,
                    $$arrow: ' ▽',
                  }),
                  dropdown: n.items.map((item) =>
                    Link.sidebarItem(() => ({
                      href: item.link,
                      text: item.text,
                      active: item.active != undefined ? item.active : new RegExp(n.activeMatch).test(S.route),
                    }))
                  ),
                })
              : Link(() => ({
                  href: '#' + S.locale + n.link.slice(1),
                  text: n.text,
                  active: new RegExp(n.activeMatch).test(S.route),
                }))
          ),
        $_navDropdown: {
          $if: locales.length > 1,
          navItem: L.button({
            $$: () => config.locales[S.locale].selectText,
            $$arrow: ' ▽',
          }),
          dropdown: locales.map((l) =>
            Link.sidebarItem(() => ({
              href: '#' + l + S.route.slice(1),
              text: config.locales[l].label,
              active: l == S.locale,
            }))
          ),
        },
        navItem: config.repo && Link(() => ({ href: 'https://github.com/' + config.repo, text: 'GitHub ↗' })),
        toggleLight: L.button.navItem({
          $$: '💡',
          onclick: (e) => {
            document.body.classList.toggle('light')
          },
        }),
      },
    },
    sidebar: {
      $class: { shown: () => S.sidebarShown },
      sidebarLinks: SidebarLinks(
        () => ({
          locale: S.locale,
          route: S.route,
          arr: S.curSidebar,
        }),
        0
      ),
    },
    page: {
      onclick: (e) => {
        var a = e.target
        while (a && a.tagName != 'A') a = a.parentElement
        if (a == null) return
        e.preventDefault()
        e.stopPropagation()
        var href = a.getAttribute('href')
        if (href[0] == '#') {
          location.hash = '#' + S.locale + S.route.slice(1) + href
        } else if (!href.startsWith('http')) {
          var parent = S.route.slice(0, S.route.lastIndexOf('/')),
            grandPa = parent.slice(0, parent.lastIndexOf('/')),
            abso = href.replace(/^\.\./, grandPa).replace(/^\./, parent).split('#')
          location.hash = '#' + S.locale + abso[0].slice(1) + (abso[1] ? '#' + encodeURIComponent(abso[1]) : '')
        } else window.open(href)
      },
      pageHeader: L.header({
        editLink: config.editLinks
          ? L.a({
              _href: () =>
                `https://github.com/${config.repo}/edit/${config.docsBranch}/docs${
                  S.locale + (S.route.slice(1) || 'index')
                }.md`,
              $$: () => S.config.editLinkText + ' ↗',
            })
          : null,
      }),
      pageMain: {
        $tag: 'main',
      },
      pageFooter: L.footer({
        prev: () => {
          var curPageIndex = S.pages.findIndex((p) => p.link == S.route)
          return curPageIndex > 0
            ? L.a({
                _href: S.pages[curPageIndex - 1].link,
                $$: '⇦ ' + S.pages[curPageIndex - 1].text,
              })
            : {}
        },
        next: () => {
          var curPageIndex = S.pages.findIndex((p) => p.link == S.route)
          return curPageIndex < S.pages.length - 1
            ? L.a({
                _href: S.pages[curPageIndex + 1].link,
                $$: S.pages[curPageIndex + 1].text + ' ⇨',
              })
            : {}
        },
      }),
    },
  })

  var cachedMD = {}
  /**
   * scroll target element to below header
   * @param {HTMLElement} wrapper - page wrapper
   * @param {string} hash - target element's hash
   */
  function scrollTo(wrapper, hash) {
    if (hash) {
      var hashEl = wrapper.querySelector('[href="#' + hash + '"]')
      hashEl && window.scrollBy(0, hashEl.getBoundingClientRect().top - 60)
    }
  }

  /**
   * handle hash change (load and go to new page)
   */
  function go() {
    var paths = location.hash.slice(1).split('#'),
      path = paths[0],
      hash = paths[1]
    if (path == '') path = '/'
    var locale = locales.find((l) => l != '/' && path.startsWith(l)),
      samepage
    if (locale) {
      samepage = S.locale == locale && S.route == '/' + path.slice(locale.length)
      S.locale = locale
      S.route = '/' + path.slice(locale.length)
    } else {
      samepage = S.locale == '/' && S.route == path
      S.locale = '/'
      S.route = path
    }
    S.sidebarShown = false
    var mainEl = document.querySelector('main')
    if (samepage) {
      mainEl && scrollTo(mainEl, hash)
      return
    }
    /**
     * show page content, scroll to hash and highlight code
     * @param {HTMLElement} mainEl - element to place page content
     */
    function goWithCache(mainEl) {
      window.scrollTo(0, 0)
      mainEl.innerHTML = cachedMD[path]
      scrollTo(mainEl, hash)
      ;[...mainEl.querySelectorAll('pre > code')].forEach((code) => {
        code.innerHTML = highlight(code.innerHTML, code.className.slice(9))
      })
    }
    if (cachedMD[path]) mainEl && goWithCache(mainEl)
    else {
      var xhr = new XMLHttpRequest()
      xhr.open('GET', (path.endsWith('/') ? path + 'index' : path) + '.md')
      xhr.onload = (e) => {
        cachedMD[path] = snarkdown(xhr.response)
        mainEl && goWithCache(mainEl)
      }
      xhr.send()
    }
  }

  go()
  window.addEventListener('hashchange', go)
}

export default Lightuepress
