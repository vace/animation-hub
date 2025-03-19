import { PropDeclaration, PropKeyframe } from "./types";

export function keyframesToString(name: string, keyframes: PropKeyframe[]) {
  return `@keyframes ${name} {
${keyframes.map(keyframe => {
    const declarations = keyframe.declarations.map(declaration => {
      return `    ${declaration.property}: ${declaration.value};`
    }).join('\n')
    return `  ${keyframe.name} {
${declarations}
  }`
  }
).join('\n')}
}`
}

export function selectorToString(selector: string | string[], properties: PropDeclaration[]) {
  const name = Array.isArray(selector) ? selector.join(', ') : selector
  return `${name} {
${properties.map(property => {
    return `  ${property.property}: ${property.value};`
  }
).join('\n')}
}`
}
