// build-release.cjs
// 用于将项目文件复制到 release 文件夹，并排除不需要的文件

const fs = require('fs');
const path = require('path');

const srcDir = __dirname;
const destDir = path.join(__dirname, 'release');

// 需要排除的文件和文件夹
const exclude = [
  'node_modules',
  'scripts',
  'release',
  'README.md',
  'LICENSE',
  '.git',
  '.gitignore',
  '.crxignore',
  'postcss.config.js',
  'tailwind.config.js',
  'vite.config.ts',
  'tsconfig.json',
  'package.json',
  'package-lock.json',
  'yarn.lock',
  '*.log',
  '*.psd',
  '*.zip',
  '*.tar.gz',
  '*.map',
  'public',
  'styles',
  'src',
  'build-release.cjs'
];

function matchPattern(rel, pattern) {
  if (pattern.endsWith('/')) {
    return rel === pattern.slice(0, -1) || rel.startsWith(pattern);
  } else if (pattern.startsWith('*')) {
    const ext = pattern.slice(1);
    return rel.endsWith(ext);
  } else {
    return rel === pattern;
  }
}

function shouldExclude(filePath) {
  const rel = path.relative(srcDir, filePath).replace(/\\/g, '/');
  for (const pattern of exclude) {
    if (matchPattern(rel, pattern)) return true;
    // 目录下所有内容
    if (pattern.endsWith('/') && rel.startsWith(pattern)) return true;
  }
  return false;
}

function copyDir(src, dest) {
  if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
  for (const item of fs.readdirSync(src)) {
    const srcPath = path.join(src, item);
    const destPath = path.join(dest, item);
    if (shouldExclude(srcPath)) continue;
    const stat = fs.statSync(srcPath);
    if (stat.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

// 清空 release 目录
if (fs.existsSync(destDir)) {
  fs.rmSync(destDir, { recursive: true, force: true });
}

copyDir(srcDir, destDir);

console.log('Release 文件夹已生成。');
