const fs = require('fs');
const path = require('path');

const rootDir = process.cwd();

function getAllFiles(dirPath, arrayOfFiles) {
    const files = fs.readdirSync(dirPath);

    arrayOfFiles = arrayOfFiles || [];

    files.forEach(function (file) {
        if (fs.statSync(dirPath + "/" + file).isDirectory()) {
            arrayOfFiles = getAllFiles(dirPath + "/" + file, arrayOfFiles);
        } else {
            if (file.endsWith('.ts') || file.endsWith('.tsx') || file.endsWith('.js') || file.endsWith('.jsx')) {
                arrayOfFiles.push(path.join(dirPath, "/", file));
            }
        }
    });

    return arrayOfFiles;
}

function resolveImport(importPath, currentFile) {
    let resolvedPath = '';

    if (importPath.startsWith('@/')) {
        resolvedPath = path.join(rootDir, importPath.substring(2));
    } else if (importPath.startsWith('.')) {
        resolvedPath = path.resolve(path.dirname(currentFile), importPath);
    } else {
        return null; // Node module or absolute import, skip
    }

    // Handle extensions
    const extensions = ['', '.ts', '.tsx', '.js', '.jsx', '.json', '/index.ts', '/index.tsx', '/index.js'];
    for (const ext of extensions) {
        const p = resolvedPath + ext;
        if (fs.existsSync(p) && fs.statSync(p).isFile()) {
            return p;
        }
    }

    // Try directory index
    if (fs.existsSync(resolvedPath) && fs.statSync(resolvedPath).isDirectory()) {
        for (const ext of ['index.ts', 'index.tsx', 'index.js']) {
            const p = path.join(resolvedPath, ext);
            if (fs.existsSync(p)) return p;
        }
    }

    return null;
}

function getActualFilename(filePath) {
    const dir = path.dirname(filePath);
    const file = path.basename(filePath);
    try {
        const files = fs.readdirSync(dir);
        return files.find(f => f.toLowerCase() === file.toLowerCase());
    } catch (e) {
        return null;
    }
}

const files = getAllFiles(path.join(rootDir, 'app'), []);
files.push(...getAllFiles(path.join(rootDir, 'lib'), []));

let errors = 0;

files.forEach(file => {
    const content = fs.readFileSync(file, 'utf8');
    // Match import ... from '...' and import('...')
    const regex = /from\s+['"]([^'"]+)['"]|import\s*\(['"]([^'"]+)['"]\)/g;
    let match;

    while ((match = regex.exec(content)) !== null) {
        const importPath = match[1] || match[2];
        if (!importPath || !importPath.startsWith('.')) {
            if (!importPath || !importPath.startsWith('@/')) continue;
        }

        const resolved = resolveImport(importPath, file);
        if (resolved) {
            const actualFilename = getActualFilename(resolved);
            if (actualFilename && actualFilename !== path.basename(resolved)) {
                console.error(`[CASE ERROR] In ${path.relative(rootDir, file)}:`);
                console.error(`  Imported: ${importPath}`);
                console.error(`  Resolved: ${path.relative(rootDir, resolved)}`);
                console.error(`  Actual:   ${actualFilename}`);
                console.error('---');
                errors++;
            }
        } else {
            // console.warn(`[WARNING] Could not resolve ${importPath} in ${path.relative(rootDir, file)}`);
        }
    }
});

if (errors === 0) {
    console.log("No casing errors found!");
} else {
    console.log(`Found ${errors} casing errors.`);
}
