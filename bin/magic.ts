import fs from 'fs'
import path from 'path'
import { getCategories, getProjectRoot, parseFileAnimations, ROOT_DIR, writeJsonFile } from './utils.js'
import { Animation, AnimationKeyframes } from '../packages/types.js'
import { keyframesToString, selectorToString } from '../packages'
import { kebabCase } from 'lodash-es'

const ProjectRoot = getProjectRoot('packages/magic/src')

const CategoryList = [
  {
    "group": "magic",
    "effects": [
      "magic",
      "twisterInDown",
      "twisterInUp",
      "swap",
      "swashOut",
      "swashIn",
      "foolishIn",
      "holeOut",
      "bombRightOut",
      "bombLeftOut",
      "boingInUp",
      "boingOutDown"
    ]
  },
  {
    "group": "open_entrances",
    "effects": [
      "openDownLeft",
      "openDownRight",
      "openUpLeft",
      "openUpRight",
      "openDownLeftReturn",
      "openDownRightReturn",
      "openUpLeftReturn",
      "openUpRightReturn"
    ]
  },
  {
    "group": "open_exits",
    "effects": [
      "openDownLeftOut",
      "openDownRightOut",
      "openUpLeftOut",
      "openUpRightOut"
    ]
  },
  {
    "group": "perspective",
    "effects": [
      "perspectiveDown",
      "perspectiveUp",
      "perspectiveLeft",
      "perspectiveRight",
      "perspectiveDownReturn",
      "perspectiveUpReturn",
      "perspectiveLeftReturn",
      "perspectiveRightReturn"
    ]
  },
  {
    "group": "rotating",
    "effects": [
      "rotateDown",
      "rotateUp",
      "rotateLeft",
      "rotateRight"
    ]
  },
  {
    "group": "sliding",
    "effects": [
      "slideDown",
      "slideUp",
      "slideLeft",
      "slideRight",
      "slideDownReturn",
      "slideUpReturn",
      "slideLeftReturn",
      "slideRightReturn"
    ]
  },
  {
    "group": "tin",
    "effects": [
      "tinRightOut",
      "tinLeftOut",
      "tinUpOut",
      "tinDownOut",
      "tinRightIn",
      "tinLeftIn",
      "tinUpIn",
      "tinDownIn"
    ]
  },
  {
    "group": "space",
    "effects": [
      "spaceOutUp",
      "spaceOutRight",
      "spaceOutDown",
      "spaceOutLeft",
      "spaceInUp",
      "spaceInRight",
      "spaceInDown",
      "spaceInLeft"
    ]
  }
]

export default async function parse() {
  const { animations } = await parseFileAnimations(path.resolve(ROOT_DIR, 'bin/download/magic/magic.css'))
  const animationMap = new Map<string, AnimationKeyframes>(animations.map(animation => [animation.name, animation]))
  const animationList: Animation[] = []
  const cssContentList: string[] = []

  for (const cg of CategoryList) {
    const dir = path.resolve(ProjectRoot, cg.group)
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }
    for (const name of cg.effects) {
      const keyframes = animationMap.get(name)
      if (!keyframes) {
        console.error(`animation ${name} not found`)
        continue
      }
      const result: Animation = {
        name,
        categories: getCategories([cg.group, name]),
        keyframes: keyframes.keyframes,
        properties: []
      }
      const filename = path.resolve(dir, name + '.json')
      writeJsonFile(filename, result)
      const css_keyframes = keyframesToString(result.name, result.keyframes)
      const css_selector = selectorToString(`.${kebabCase(name)}`, [
        { property: 'animation-name', value: result.name }
      ])
      const css_filename = path.resolve(dir, name + '.css')
      const css_content = css_keyframes + '\n\n' + css_selector + '\n'
      fs.writeFileSync(css_filename, css_content)
      animationList.push(result)
      cssContentList.push(css_content)
    }
  }

  await writeJsonFile(path.resolve(ProjectRoot, 'index.json'), animationList)
  fs.writeFileSync(path.resolve(ProjectRoot, 'index.css'), cssContentList.join('\n'))
  console.log(`✅ [magic] ${animationList.length} animations parsed`)
}

// @ts-ignore
if (import.meta.main) {
  parse()
}
