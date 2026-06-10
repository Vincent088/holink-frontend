import pluginVue from 'eslint-plugin-vue'
import tsParser from '@typescript-eslint/parser'

export default [
  {
    files: ['**/*.{ts,tsx,vue}'],
    plugins: { vue: pluginVue },
    languageOptions: {
      parser: tsParser,
    },
    rules: {
      'vue/multi-word-component-names': 'off',
      'no-console': 'off',
    },
  },
]