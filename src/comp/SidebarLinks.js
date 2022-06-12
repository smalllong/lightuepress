import Link from './Link'

/**
 * Recursive Sidebar Link Tree
 * @param {Array} arr - links data
 * @param {number} level - how deep is it
 * @param {Function} locale - current page locale
 * @param {Function} route - current page route
 * @returns {object} VDomSrc
 */
export default function SidebarLinks(arr, level, locale, route) {
  return arr.map((item) => ({
    $$: Object.assign(
      item.link
        ? Link(
            () => '#' + locale() + item.link.slice(1),
            '',
            () => route() == item.link
          )
        : {},
      { _class: 'sidebar-item sidebar-item-' + level, $$: item.text }
    ),
    sidebarLinks: item.children ? SidebarLinks(item.children, level + 1, locale, route) : null,
  }))
}
