import L from 'lightue'

/**
 * Link component
 * @param {object} props - {href: link href, active: highlighted when true, text: link text}
 * @param {string=} classname - optional classname
 * @returns {object} VDomSrc
 */
export default function Link(props, classname) {
  var P = L.useProp(props)
  var tag = classname ? L.a[classname] : L.a,
    content = {
      _href: P.$href,
      $class: { active: P.$active },
      $$: P.$text,
    }
  if (typeof P.href == 'string' && P.href.startsWith('http')) content._target = '_blank'
  return tag(content)
}
