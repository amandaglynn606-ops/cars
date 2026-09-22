import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { createRequire } from 'node:module'
import { pathToFileURL } from 'node:url'
import ts from 'typescript'
import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { moduleURL } from './load-module.mjs'
const require = createRequire(import.meta.url)
const dataURL = (source) => 'data:text/javascript;base64,' + Buffer.from(source).toString('base64')
const reactURL = pathToFileURL(require.resolve('react')).href
const replacements = {
  react: reactURL,
  'react/jsx-runtime': pathToFileURL(require.resolve('react/jsx-runtime')).href,
  'next/image': dataURL(
    `import React from ${JSON.stringify(reactURL)}; export default function Image({src,alt}) { return React.createElement('img',{src,alt}) }`,
  ),
  './RegionalProvider': dataURL('export function T({children}) { return children }'),
  '@/lib/image-variants': await moduleURL('src/lib/image-variants.ts'),
}
let source = ts.transpileModule(await readFile('src/components/CarGallery.tsx', 'utf8'), {
  compilerOptions: {
    jsx: ts.JsxEmit.ReactJSX,
    module: ts.ModuleKind.ESNext,
    target: ts.ScriptTarget.ES2022,
  },
}).outputText
for (const [from, to] of Object.entries(replacements))
  source = source
    .replaceAll("from '" + from + "'", "from '" + to + "'")
    .replaceAll('from "' + from + '"', 'from "' + to + '"')
const { default: CarGallery } = await import(dataURL(source))
const cars = JSON.parse(await readFile('data/fleet.json', 'utf8'))
const { colourPreview } = await import(await moduleURL('src/lib/image-variants.ts'))
test('all vehicle colour choices render one matching photo and one active accessible swatch', () => {
  for (const car of cars)
    for (const colour of car.colors) {
      const html = renderToStaticMarkup(
        React.createElement(CarGallery, { car, initialColour: colour.slug }),
      )
      assert.equal((html.match(/<img /g) || []).length, 1, car.id)
      assert.equal((html.match(/aria-pressed="true"/g) || []).length, 1, car.id)
      assert.ok(
        html.includes('src="' + colourPreview(car, colour.slug).image.src + '"'),
        car.id + ' ' + colour.slug,
      )
      assert.ok(html.includes('data-gallery-colour="' + colour.slug + '"'))
      assert.ok(!html.includes('All photos') && !html.includes('Next image'))
    }
})
