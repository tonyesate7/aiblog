#!/usr/bin/env node

import fs from 'fs'
import path from 'path'
import postcss from 'postcss'
import tailwindcssPostcss from '@tailwindcss/postcss'
import autoprefixer from 'autoprefixer'

const inputCSS = fs.readFileSync('./src/styles/input.css', 'utf8')

async function buildCSS() {
  try {
    const result = await postcss([
      tailwindcssPostcss,
      autoprefixer,
    ]).process(inputCSS, { from: './src/styles/input.css' })
    
    // public/static 디렉토리 확인 및 생성
    if (!fs.existsSync('./public')) {
      fs.mkdirSync('./public')
    }
    if (!fs.existsSync('./public/static')) {
      fs.mkdirSync('./public/static')
    }
    
    // 빌드된 CSS를 public/static에 저장
    fs.writeFileSync('./public/static/tailwind.css', result.css)
    
    console.log('✅ TailwindCSS 빌드 완료: public/static/tailwind.css')
    
    // CSS 파일 크기 확인
    const stats = fs.statSync('./public/static/tailwind.css')
    const fileSizeInKB = (stats.size / 1024).toFixed(2)
    console.log(`📦 CSS 파일 크기: ${fileSizeInKB}KB`)
    
  } catch (error) {
    console.error('❌ CSS 빌드 오류:', error)
    process.exit(1)
  }
}

buildCSS()