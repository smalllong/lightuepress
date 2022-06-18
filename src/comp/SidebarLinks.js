import Link from './Link'
import L from 'lightue'

/**
 * Recursive Sidebar Link Tree
 * @param {object} props - {locale: current page locale, route: current page route, arr: links data}
 * @param {number} level - how deep is it
 * @returns {object} VDomSrc
 */
export default function SidebarLinks(props, level) {
  var P = L.useProp(props)
  return () => P.arr.map((item) => ({
    sidebarItem: Object.assign(
      item.link
        ? Link(() => ({ href: '#' + P.locale + item.link.slice(1), text: '', active: P.route == item.link }))
        : {},
      { _dataLevel: level, $$: item.text }
    ),
    sidebarLinks: item.children
      ? SidebarLinks(() => ({ locale: P.locale, route: P.route, arr: item.children }), level + 1)
      : null,
  }))
}
