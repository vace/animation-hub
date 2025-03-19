import fs from 'fs'
import path from 'path'
import { getCategories, getFiles, getProjectRoot, parseFileAnimations, ROOT_DIR, writeJsonFile } from './utils.js'
import { Animation, AnimationGroup, AnimationKeyframes } from '../packages/types.js'
import { keyframesToString, selectorToString } from '../packages'

const ProjectRoot = getProjectRoot('packages/css-spinner/src')

export default async function parse() {
  const templateRoot = getProjectRoot('bin/download/css-spinner')
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
        categories: getCategories(['spinner', name, animation.name]),
        keyframes: animation.keyframes,
      }
    })

    const templateFile = path.resolve(templateRoot, name + '.html')

    const result: AnimationGroup = {
      name,
      animations: animations_,
      selectors,
      template: fs.existsSync(templateFile) ? fs.readFileSync(templateFile, 'utf-8') : '',
    }
    animationGroupList.push(result)

    const filename = path.resolve(ProjectRoot, name + '.json')
    const css_filename = path.resolve(ProjectRoot, name + '.css')
    const css_content = keyframes_code + '\n\n' + selectors_code + '\n'
    writeJsonFile(filename, result)
    fs.writeFileSync(css_filename, css_content)
    cssContentList.push(css_content)
  }

  writeJsonFile(path.resolve(ProjectRoot, 'index.json'), animationGroupList)
  fs.writeFileSync(path.resolve(ProjectRoot, 'index.css'), cssContentList.join('\n'))
  console.log(`✅ [css-spinner] ${animationGroupList.length} animations parsed`)
}

// @ts-ignore
if (import.meta.main) {
  parse()
}
