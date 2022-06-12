import { nodeResolve } from '@rollup/plugin-node-resolve'
import postcss from 'rollup-plugin-postcss'
import visualizer from 'rollup-plugin-visualizer'
import { terser } from 'rollup-plugin-terser'

var plugins = [nodeResolve(), postcss()], file = '../lightue/docs/lightuepress.js'

if (process.env.NODE_ENV == 'production') {
  plugins.push(terser(), visualizer({ filename: 'dist/stats.html', open: true, gzipSize: true, brotliSize: true }))
  file = 'dist/lightuepress.min.js'
}

export default {
  input: 'src/index.js',
  output: {
    file,
    format: 'iife',
    name: 'Lightuepress',
  },
  plugins,
}
