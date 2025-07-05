import { nodeResolve } from '@rollup/plugin-node-resolve'
import postcss from 'rollup-plugin-postcss'
import { terser } from 'rollup-plugin-terser'
import coffee from 'rollup-plugin-coffee-script'

var plugins = [nodeResolve(), postcss(), coffee()], file = '../lightue/docs/lightuepress.js'

if (process.env.NODE_ENV == 'production') {
  plugins.push(terser())
  file = 'dist/lightuepress.min.js'
}

export default {
  input: 'src/index.coffee',
  output: {
    file,
    format: 'iife',
    name: 'Lightuepress',
  },
  plugins,
}
