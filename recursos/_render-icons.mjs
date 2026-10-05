import { writeFileSync, readFileSync } from 'node:fs'
import { Resvg } from '@resvg/resvg-js'

function png(svgPath, size, outPath) {
  const svg = readFileSync(svgPath)
  const resvg = new Resvg(svg, {
    fitTo: { mode: 'width', value: size },
    background: '#1d3557',
  })
  writeFileSync(outPath, resvg.render().asPng())
  console.log(outPath, size)
}

png('public/icon.svg', 192, 'public/icon-192.png')
png('public/icon.svg', 512, 'public/icon-512.png')
png('public/icon-maskable.svg', 512, 'public/icon-512-maskable.png')
png('public/icon.svg', 180, 'public/apple-touch-icon.png')
png('public/icon.svg', 32, 'public/favicon-32.png')
