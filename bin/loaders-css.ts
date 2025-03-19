import fs from 'fs/promises'
import path from 'path'
import { Animation, AnimationGroup, AnimationKeyframes, AnimationSelector } from "../packages/types.js";
import { getCategories, getDirectories, getFiles, getProjectRoot, parseFileAnimations, writeJsonFile } from "./utils.js";
import { keyframesToString, selectorToString } from '../packages/common.js';

const ProjectRoot = getProjectRoot('packages/loaders.css/src')

/**
 * @see https://github.com/ConnorAtherton/loaders.css/blob/master/loaders.css.js
 */
const DivNumCount = {
  'ball-pulse': 3,
  'ball-grid-pulse': 9,
  'ball-clip-rotate': 1,
  'ball-clip-rotate-pulse': 2,
  'square-spin': 1,
  'ball-clip-rotate-multiple': 2,
  'ball-pulse-rise': 5,
  'ball-rotate': 1,
  'cube-transition': 2,
  'ball-zig-zag': 2,
  'ball-zig-zag-deflect': 2,
  'ball-triangle-path': 3,
  'ball-scale': 1,
  'line-scale': 5,
  'line-scale-party': 4,
  'ball-scale-multiple': 3,
  'ball-pulse-sync': 3,
  'ball-beat': 3,
  'line-scale-pulse-out': 5,
  'line-scale-pulse-out-rapid': 5,
  'ball-scale-ripple': 1,
  'ball-scale-ripple-multiple': 3,
  'ball-spin-fade-loader': 8,
  'line-spin-fade-loader': 8,
  'triangle-skew-spin': 1,
  'pacman': 5,
  'ball-grid-beat': 9,
  'semi-circle-spin': 1,
  'ball-scale-random': 3
};


export default async function parse () {
  const templateRoot = getProjectRoot('bin/download/loaders.css')
  const files = await getFiles(templateRoot, '.css')
  const animationGroupList: AnimationGroup[] = []
  const cssContentList: string[] = []

  for (const file of files) {
    const { animations, selectors } = await parseFileAnimations(file.path)
    const name = path.basename(file.path, '.css')
    
    const keyframes_code = animations.map((animation => keyframesToString(animation.name, animation.keyframes))).join('\n\n')
    const selectors_code = selectors.map(selector => {
      return selectorToString(selector.selectors, selector.declarations)
    }).join('\n\n')

    const animations_: Animation[] = animations.map(animation => {
      return {
        name: animation.name,
        categories: getCategories(['loader', name, animation.name]),
        keyframes: animation.keyframes,
      }
    })

    const result: AnimationGroup = {
      name,
      animations: animations_,
      selectors,
      template: DivNumCount[name] ? `<div class="${name}">${'<div></div>'.repeat(DivNumCount[name])}</div>` : ''
    }
    animationGroupList.push(result)

    const filename = path.resolve(ProjectRoot, name + '.json')
    const css_filename = path.resolve(ProjectRoot, name + '.css')
    const css_content = keyframes_code + '\n\n' + selectors_code + '\n'
    writeJsonFile(filename, result)
    fs.writeFile(css_filename, css_content, 'utf-8')
    cssContentList.push(css_content)
  }
  writeJsonFile(path.resolve(ProjectRoot, 'index.json'), animationGroupList)
  fs.writeFile(path.resolve(ProjectRoot, 'index.css'), cssContentList.join('\n'), 'utf-8')
  console.log(`✅ [loaders.css] ${animationGroupList.length} animations parsed`)
}

// @ts-ignore
if (import.meta.main) {
  parse()
}
