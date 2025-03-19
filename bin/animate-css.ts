import fs from 'fs/promises'
import path from 'path'
import { Animation, AnimationKeyframes, AnimationSelector } from "../packages/types.js";
import { getCategories, getDirectories, getFiles, getProjectRoot, parseFileAnimations, writeJsonFile } from "./utils.js";
import { keyframesToString, selectorToString } from '../packages/common.js';
import { kebabCase } from 'lodash-es';

const ProjectRoot = getProjectRoot('packages/animate.css/src')

export default async function parse () {
  const dirs = await getDirectories(ProjectRoot)
  const animationList: Animation[] = []
  const cssContentList: string[] = []

  for (const dir of dirs) {
    const files = await getFiles(dir.path, '.css')
    const dirAnimations: Animation[] = []

    for (const file of files) {
      const { content, animations, selectors } = await parseFileAnimations(file.path)
      const selectorsMap = new Map(selectors.map(selector => [selector.selectors[0].slice(1), selector]))
      const fileAnimations: Animation[] = []

      for (const { name, keyframes } of animations) {
        const selector = selectorsMap.get(name)
        const properties = selector?.declarations.filter(d => {
          return d.property !== 'animation-name' && d.property !== 'animation-duration'
        })

        const animation: Animation = {
          name,
          categories: getCategories([dir.name, file.name.slice(0, -4), name]),
          keyframes,
          properties: properties?.length ? properties : undefined
        }

        const css_keyframes = keyframesToString(animation.name, animation.keyframes)
        const css_selector = selectorToString(`.${kebabCase(animation.name)}`, [
          ...animation.properties || [],
          { property: 'animation-name', value: animation.name }
        ])
        const css_content = css_keyframes + '\n\n' + css_selector + '\n'

        fileAnimations.push(animation)
        cssContentList.push(css_content)
      }
      if (fileAnimations.length === 1) {
        const jsonFile = file.path.replace(/\.css$/, '.json')
        await fs.writeFile(jsonFile, JSON.stringify(fileAnimations[0], null,2))
      } else {
        console.warn('Multiple animations in file:', file.path)
      }

      dirAnimations.push(...fileAnimations)
    }

    animationList.push(...dirAnimations)
  }

  await writeJsonFile(path.resolve(ProjectRoot, 'index.json'), animationList)
  await fs.writeFile(path.resolve(ProjectRoot, 'index.css'), cssContentList.join('\n'))
  console.log(`✅ [animate.css] ${animationList.length} animations parsed`)
}

// @ts-ignore
if (import.meta.main) {
  parse()
}
