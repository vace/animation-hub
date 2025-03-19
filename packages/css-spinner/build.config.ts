import fs from 'fs'
import path from 'path'
import { defineBuildConfig } from 'unbuild'

export default defineBuildConfig({
  entries: [
    './index.ts',
  ],
  clean: true,
  declaration: true,
  rollup: {
    emitCJS: true,
    inlineDependencies: true,
  },
  hooks: {
    "build:done"(ctx) {
      const {rootDir, outDir} = ctx.options
      fs.copyFileSync(path.resolve(rootDir, 'src/index.json'), path.resolve(outDir, 'index.json'))
      fs.copyFileSync(path.resolve(rootDir, 'src/index.css'), path.resolve(outDir, 'index.css'))
    },
  }
})
