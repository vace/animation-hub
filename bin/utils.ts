import fs from 'fs/promises'
import { memoize, uniq } from 'lodash-es'
import path from 'path'
import css from 'css'
import { AnimationKeyframes, AnimationSelector, Animation } from '../packages/types'

export const ROOT_DIR = path.resolve(__dirname, '../')

const TagAlias = {
  'in': 'entrance', 'out': 'exit', 'entrances': 'entrance', 'exits': 'exit', 'x': 'horizontal', 'y': 'vertical', 'h': 'horizontal', 'v': 'vertical', 'hor': 'horizontal', 'ver': 'vertical', 
  'tl': 'top-left', 'tr': 'top-right', 'bl': 'bottom-left', 'br': 'bottom-right', 't': 'top', 'b': 'bottom', 'l': 'left', 'r': 'right', 'c': 'center', 'm': 'middle',
  'bck': 'back', 'fwd': 'forward',
  
}

// fadeInLeft => fade in left
// fade_in_left => fade in left
const formatTags = memoize((name: string) => {
  const arr = name.replace(/([A-Z])/g, ' $1').replace(/(_|-|\d)/g, ' ').trim().toLowerCase().split(' ').map(t => TagAlias[t] || t).filter(Boolean)
  return uniq(arr)
})

export function getCategories (categories: string[]) {
  const formatSet = new Set<string>()
  for (const category of categories) {
    formatTags(category).forEach(tag => formatSet.add(tag))
  }
  return Array.from(formatSet)
}

export function getProjectRoot (src: string) {
  return path.resolve(__dirname, '../', src)
}

/**
 * get directories in the root directory
 */
export async function getDirectories (dir: string) {
  const files = await fs.readdir(dir, { withFileTypes: true })
  return files.filter(file => file.isDirectory()).map(file => ({
    name: file.name,
    path: path.resolve(ROOT_DIR, dir, file.name)
  }))
}

export async function getFiles (dir: string, ext: string) {
  const files = await fs.readdir(path.resolve(ROOT_DIR, dir))
  return files.filter(file => file.endsWith(ext)).map(file => ({
    name: file,
    path: path.resolve(ROOT_DIR, dir, file)
  }))
}

export async function parseFileAnimations (filename: string) {
  const content = await fs.readFile(filename, 'utf-8')
  const ast = css.parse(content)
  const rules = ast.stylesheet.rules
  const animations: AnimationKeyframes[] = []
  const selectors: AnimationSelector[] = []

  for (const rule of rules) {
    switch (rule.type) {
      case 'rule':
        selectors.push(parseCssRule(rule))
        break;
      case 'keyframes':
        animations.push(parseCssKeyframes(rule))
        break;
      default:
        break;
    }
  }
  return { content, animations, selectors }
}

export function writeJsonFile (filename: string, data: any) {
  return fs.writeFile(filename, JSON.stringify(data, null, 2))
}


function parseCssRule(rule: css.Rule): AnimationSelector {
  let animation = ''
  const declarations = rule.declarations.map(declaration => {
    if (declaration.type !== 'declaration') {
      return null
    }

    if (declaration.value) {
      if (declaration.property === 'animation') {
        animation = declaration.value.split(' ')[0]
      } else if (declaration.property === 'animation-name') {
        animation = declaration.value
      }
    }

    return {
      property: declaration.property,
      value: declaration.value
    }
  }).filter(Boolean)

  return {
    type: 'selector',
    animation,
    selectors: rule.selectors,
    declarations: declarations
  }
}

function parseCssKeyframes (keyframes: css.KeyFrames): AnimationKeyframes {
  return {
    type: 'keyframes',
    name: keyframes.name,
    keyframes: keyframes.keyframes.map(keyframe => {
      if (keyframe.type === 'comment') {
        return null
      }
      return {
        name: keyframe.values.join(', '),
        declarations: keyframe.declarations.map(declaration => {
          if (declaration.type === 'comment') {
            return null
          }
          return {
            property: declaration.property,
            value: declaration.value
          }
        }).filter(Boolean)
      }
    }).filter(Boolean)
  }
}
