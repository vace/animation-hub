import animista from './download/animista/animista.json'
import fs from 'fs'
import path from 'path'
import { getCategories, getProjectRoot, parseFileAnimations, ROOT_DIR, writeJsonFile } from './utils.js'
import { Animation, AnimationKeyframes } from '../packages/types.js'
import { keyframesToString, selectorToString } from '../packages'
import { kebabCase } from 'lodash-es'

const ProjectRoot = getProjectRoot('packages/animista/src')

const { categories } = animista

export default async function parse () {
  const { animations } = await parseFileAnimations(path.resolve(ROOT_DIR, 'bin/download/animista/animista.css'))
  const animationMap = new Map<string, AnimationKeyframes>(animations.map(animation => [animation.name, animation]))

  const groups = Object.keys(categories)
  const animationList: Animation[] = []
  const cssContentList: string[] = []

  for (const group of groups) {
    // mkdir
    const dir = path.resolve(ProjectRoot, group)
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }
    const groups = categories[group].groups
    const nameList = Object.keys(groups)
    for (const name of nameList) {
      const variations = groups[name].variations
      const animations = Object.keys(variations)
      for (const animation of animations) {
        const keyframes = animationMap.get(animation)
        if (!keyframes) {
          console.error(`animation ${animation} not found`)
          continue
        }
        const properties = []
        const config = variations[animation]
        if (config) {
          if (config.direction && config.direction !== 'normal') {
            properties.push({ property: 'animation-direction', value: config.direction })
          }
          if (config.fill && config.fill !== 'both') {
            properties.push({ property: 'animation-fill-mode', value: config.fill })
          }
        }
        const result: Animation = {
          name: animation,
          categories: getCategories([group, name, animation]),
          keyframes: keyframes.keyframes,
          properties: properties.length ? properties : undefined,
        }

        const filename = path.resolve(dir, animation + '.json')
        writeJsonFile(filename, result)
        const css_keyframes = keyframesToString(result.name, result.keyframes)
        const css_selector = selectorToString(`.${kebabCase(animation)}`, [
          ...result.properties || [],
          { property: 'animation-name', value: result.name }
        ])
        const css_filename = path.resolve(dir, animation + '.css')
        const css_content = css_keyframes + '\n\n' + css_selector + '\n'
        fs.writeFileSync(css_filename, css_content)
        cssContentList.push(css_content)
        animationList.push(result)
      }
    }
  }

  await writeJsonFile(path.resolve(ProjectRoot, 'index.json'), animationList)
  fs.writeFileSync(path.resolve(ProjectRoot, 'index.css'), cssContentList.join('\n'))
  console.log(`✅ [animista] ${animationList.length} animations parsed`)
}

// @ts-ignore
if (import.meta.main) {
  parse()
}
