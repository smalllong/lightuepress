###
# Link component
# @param {object} P - {href: link href, active: highlighted when true, text: link text}
# @returns {object} VNode
###
export default useComp (P) =>
  a
    href: P.$href,
    target: typeof P.href == 'string' && P.href.startsWith('http') && '_blank',
    $class: { active: P.$active },
    dataLevel: P.$dataLevel,
    P.$text
