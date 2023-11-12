
// incompatible with one of the installed modules, 
// whose use of `find-config` uses require(), which 
//  isn't compatible with this ESM.  Moved the config 
// to package.json.

export default {
  plugins: {
    'postcss-import': {},
    tailwindcss: {},
    'postcss-focus-visible': {
      replaceWith: '[data-focus-visible-added]',
    },
    autoprefixer: {},
  },
}
