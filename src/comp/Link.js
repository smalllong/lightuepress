import L from 'lightue'

/**
 * Link component
 * @param {object} P - {href: link href, active: highlighted when true, text: link text}
 * @returns {object} VDomSrc
 */
export default L.useComp(function Link(P) {
  return L.a({
    _href: P.$href,
    _target: typeof P.href == 'string' && P.href.startsWith('http') ? '_blank' : null,
    $class: { active: P.$active },
    $$: P.$text,
  })
})
