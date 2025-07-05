import snarkdown from 'snarkdown'
import highlight from './highlight'
import Link from './comp/Link.coffee'
import SidebarLinks from './comp/SidebarLinks.coffee'
import './css/layout.css'
import './css/page.css'

###
# initialize LightuePress
# @param {object} config - Configurations
###
Lightuepress = (config) ->
  return unless config
  
  locales = Object.keys config.locales
  
  # Create reactive state using Lightue v1.0.0 syntax
  S = useState
    locale: '/'
    config: {}
    route: '' # default is empty, later it changed to '/' and load md file
    sidebarShown: false
    curSidebar: [] # current showing sidebar
    pages: []
  
  window.S = S
  
  # Watch for config changes
  watchEffect -> 
    S.config = config.locales[S.locale]
  
  # Watch for sidebar changes
  watchEffect ->
    for i of S.config.sidebar
      if S.route.startsWith i
        S.curSidebar = S.config.sidebar[i]
        break
  
  # Watch for pages changes
  watchEffect ->
    S.pages = S.curSidebar.reduce (previous, current) -> 
      previous.concat current.children
    , []

  document.body.classList.add 'light' unless window.matchMedia('(prefers-color-scheme:dark)').matches

  L {},
    div.navBar {},
      button.navItem
        $class: { sidebarToggler: true }
        onclick: (e) -> S.sidebarShown = !S.sidebarShown
        '📑'
      
      Link.navBarTitle -> 
        href: "##{S.locale}"
        text: S.config.title
      
      nav.nav {},
        => S.config.nav.map (n) =>
          if n.items
            span.navDropdown {},
              button.navItem {},
                n.text
                span.arrow ' ▽'
              div.dropdown {},
              n.items.map (item) =>
                Link.sidebarItem =>
                  href: item.link
                  text: item.text
                  active: if item.active != undefined 
                    item.active 
                  else 
                    new RegExp(n.activeMatch).test S.route
          else
            Link.navItem =>
              href: "##{S.locale}#{n.link.slice 1}"
              text: n.text
              active: new RegExp(n.activeMatch).test S.route

        span.navDropdown
          $if: locales.length > 1
          button.navItem {},
            => config.locales[S.locale].selectText
            span.arrow ' ▽'
          div.dropdown locales.map (l) =>
            Link.sidebarItem =>
              href: "##{l}#{S.route.slice 1}"
              text: config.locales[l].label
              active: l == S.locale

        config.repo &&
          Link.navItem =>
            href: "https://github.com/#{config.repo}"
            text: 'GitHub ↗'
        
        button.navItem
          $class: { toggleLight: true }
          onclick: (e) -> document.body.classList.toggle 'light'
          '💡'
    
    div.sidebar
      $class: 
        shown: S.$sidebarShown
      SidebarLinks => 
        locale: S.locale
        route: S.route
        arr: S.curSidebar
      , 0
    
    div.page
      onclick: (e) ->
        a = e.target
        while a and a.tagName != 'A'
          a = a.parentElement
        return unless a
        e.preventDefault()
        e.stopPropagation()
        href = a.getAttribute 'href'
        if href[0] == '#'
          location.hash = "##{S.locale}#{S.route.slice 1}#{href}"
        else if !href.startsWith 'http'
          parent = S.route.slice 0, S.route.lastIndexOf '/'
          grandPa = parent.slice 0, parent.lastIndexOf '/'
          abso = href.replace(/^\.\./, grandPa).replace(/^\./, parent).split '#'
          location.hash = "##{S.locale}#{abso[0].slice 1}#{if abso[1] then '#' + encodeURIComponent(abso[1]) else ''}"
        else 
          window.open href
      
      header.pageHeader {},
        div.editLink config.editLinks &&
          a
            href: -> 
              "https://github.com/#{config.repo}/edit/#{config.docsBranch}/docs#{S.locale}#{S.route.slice(1) or 'index'}.md"
            -> "#{S.config.editLinkText} ↗"
      
      main.pageMain
      
      footer.pageFooter {},
        ->
          curPageIndex = S.pages.findIndex (p) -> p.link == S.route
          if curPageIndex > 0
            a.prev
              href: S.pages[curPageIndex - 1].link
              "⇦ #{S.pages[curPageIndex - 1].text}"
          else div.prev {}
        ->
          curPageIndex = S.pages.findIndex (p) -> p.link == S.route
          if curPageIndex < S.pages.length - 1
            a.next
              href: S.pages[curPageIndex + 1].link
              "#{S.pages[curPageIndex + 1].text} ⇨"
          else div.next {}
  cachedMD = {}
  
  ### scroll target element to below header
  # @param {HTMLElement} wrapper - page wrapper
  # @param {string} hash - target element's hash
  ###
  scrollTo = (wrapper, hash) ->
    if hash
      hashEl = wrapper.querySelector "[href=\"##{hash}\"]"
      hashEl and window.scrollBy 0, hashEl.getBoundingClientRect().top - 60

  ### handle hash change (load and go to new page) ###
  go = ->
    paths = location.hash.slice(1).split '#'
    path = paths[0]
    hash = paths[1]
    path = '/' if path == ''
    
    locale = locales.find (l) -> l != '/' and path.startsWith l
    samepage = null
    
    if locale
      samepage = S.locale == locale and S.route == "/#{path.slice locale.length}"
      S.locale = locale
      S.route = "/#{path.slice locale.length}"
    else
      samepage = S.locale == '/' and S.route == path
      S.locale = '/'
      S.route = path
    
    S.sidebarShown = false
    mainEl = document.querySelector 'main'
    
    return mainEl and scrollTo mainEl, hash if samepage
    
    ### show page content, scroll to hash and highlight code
    # @param {HTMLElement} mainEl - element to place page content
    ###
    goWithCache = (mainEl) ->
      window.scrollTo 0, 0
      mainEl.innerHTML = cachedMD[path]
      scrollTo mainEl, hash
      [...mainEl.querySelectorAll 'pre > code'].forEach (code) ->
        code.innerHTML = highlight code.innerHTML, code.className.slice 9
    
    if cachedMD[path]
      mainEl and goWithCache mainEl
    else
      xhr = new XMLHttpRequest()
      xhr.open 'GET', "#{if path.endsWith('/') then path + 'index' else path}.md"
      xhr.onload = (e) ->
        cachedMD[path] = snarkdown xhr.response
        mainEl and goWithCache mainEl
      xhr.send()

  go()
  window.addEventListener 'hashchange', go

export default Lightuepress
