import L from 'lightue'

/**
 * Link component
 * @param {string|Function} href - link href
 * @param {string|Function} text - link text
 * @param {Function=} active - active links are highlighted
 * @param {string=} classname - optional classname
 * @returns {object} VDomSrc
 */
export default function Link(href, text, active, classname) {
  var tag = classname ? L.a[classname] : L.a,
    content = {
      _href: href,
      $class: { active: active },
      $$: text,
    }
  if (typeof href == 'string' && href.startsWith('http')) content._target = '_blank'
  return tag(content)
}
