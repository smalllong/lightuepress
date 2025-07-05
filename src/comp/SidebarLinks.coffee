import Link from './Link.coffee'

###
# Recursive Sidebar Link Tree
# @param {object} P - {locale: current page locale, route: current page route, arr: links data}
# @param {number} level - how deep is it
# @returns {object} VNode
###
SidebarLinks = useComp (P, level) =>
  => P.arr.map (item) =>
    div {},
      if item.link
        Link.sidebarItem =>
          href: '#' + P.locale + item.link.slice(1)
          active: P.route == item.link
          dataLevel: level
          text: item.text
      else div.sidebarItem
        dataLevel: level
        item.text
      if item.children
        SidebarLinks =>
          locale: P.locale
          route: P.route
          arr: item.children
        , level + 1

export default SidebarLinks
