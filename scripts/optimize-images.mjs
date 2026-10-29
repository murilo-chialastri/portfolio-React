import sharp from 'sharp'
import { mkdir } from 'node:fs/promises'
import { resolve } from 'node:path'

const source =
  process.argv[2] || 'F:/Trabalhos Fiap/Front/portfolio-pessoal/img'
if (!source)
  throw new Error(
    'Informe a pasta img do portfólio original: npm run images -- "caminho/img"',
  )
await mkdir('public/images', { recursive: true })
const sizes = {
  hero: 560,
  perfil: 900,
  'projeto-01': 1000,
  'projeto-02': 1000,
  'projeto-03': 1000,
}
for (const [name, width] of Object.entries(sizes)) {
  await sharp(resolve(source, `${name}.jpg`))
    .rotate()
    .resize({ width, withoutEnlargement: true })
    .webp({ quality: 78 })
    .toFile(resolve('public/images', `${name}.webp`))
  console.log(`Otimizada: ${name}.webp`)
}
