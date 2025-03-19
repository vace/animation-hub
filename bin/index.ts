import parseAnimateCss from './animate-css'
import parseAnimista from './animista'
import parseCssSpinner from './css-spinner'
import parseLoaders from './loaders-css'
import parseMagic from './magic'

export default function parse() {
  parseAnimateCss()
  parseAnimista()
  parseCssSpinner()
  parseLoaders()
  parseMagic()
}

// @ts-ignore
if (import.meta.main) {
  parse()
}
