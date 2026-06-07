import fs from 'fs';
import path from 'path';

import emojisData from "../src/assets/emojis.json" with { type: 'json' };

// Извлекаем символы эмодзи из объекта
const ACTIVE_EMOJIS = Object.values(emojisData);

// Настройка путей
const SOURCE_DIR = path.resolve('./node_modules/twemoji-emojis/vendor/svg');
const TARGET_DIR = path.resolve('./src/assets/twemojis');

// Функция генерирует два варианта: строгий (все коды) и очищенный (без селектора стиля fe0f)
const getHexCodeVariants = (emojiStr) => {
  const baseCodes = [...emojiStr].map(c => c.codePointAt(0).toString(16));
  const strippedCodes = baseCodes.filter(hex => hex !== 'fe0f');

  return {
    strict: baseCodes.join('-'),
    stripped: strippedCodes.join('-')
  };
};

const run = () => {
  console.log('📦 Starting selective Twemoji extraction...');

  // Проверка существования папки node_modules с ассетами
  if (!fs.existsSync(SOURCE_DIR)) {
    console.error(`❌ Source directory not found: ${SOURCE_DIR}. Did you run npm install?`);
    process.exit(1);
  }

  // Очищаем и создаем целевую папку заново
  if (fs.existsSync(TARGET_DIR)) {
    fs.rmSync(TARGET_DIR, { recursive: true, force: true });
  }
  fs.mkdirSync(TARGET_DIR, { recursive: true });

  let copiedCount = 0;
  let missingCount = 0;

  ACTIVE_EMOJIS.forEach(emoji => {
    if (!emoji) return;

    const variants = getHexCodeVariants(emoji.unicodeSymbol);
    
    const strictFilename = `${variants.strict}.svg`;
    const strippedFilename = `${variants.stripped}.svg`;

    let sourcePath = null;
    let finalFilename = '';

    // Сначала ищем файл по строгому имени, если нет — по очищенному от fe0f
    if (fs.existsSync(path.join(SOURCE_DIR, strictFilename))) {
      sourcePath = path.join(SOURCE_DIR, strictFilename);
      finalFilename = strictFilename;
    } else if (fs.existsSync(path.join(SOURCE_DIR, strippedFilename))) {
      sourcePath = path.join(SOURCE_DIR, strippedFilename);
      finalFilename = strippedFilename;
    }

    if (sourcePath) {
      // Сохраняем всегда под очищенным именем (strippedFilename), 
      // чтобы вашему Svelte-компоненту <Twemoji /> было проще его рендерить
      const targetPath = path.join(TARGET_DIR, `${emoji.qualifiedName}.svg`);
      fs.copyFileSync(sourcePath, targetPath);
      copiedCount++;
    } else {
      console.warn(`⚠️  Could not find source asset for emoji: ${emoji.unicodeSymbol} (Tried: ${strictFilename} & ${strippedFilename})`);
      missingCount++;
    }
  });

  console.log(`✅ Extraction complete! Copied ${copiedCount} SVGs to ${TARGET_DIR}. (Missed: ${missingCount})`);
};

run();
