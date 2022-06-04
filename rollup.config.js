import { nodeResolve } from '@rollup/plugin-node-resolve'
import postcss from 'rollup-plugin-postcss'

export default {
  input: 'index.js',
  output: {
    file: 'dist/iife.js',
    // file: '../lightue/docs/iife.js',
    format: 'iife',
    name: 'Lightuepress',
  },
  plugins: [nodeResolve(), postcss()],
}
