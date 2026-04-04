const fs = require('fs');
const path = require('path');

const scssDir = path.join(process.cwd(), 'src/assets/scss');

function walk(dir, callback) {
    fs.readdirSync(dir).forEach( f => {
        let dirPath = path.join(dir, f);
        let isDirectory = fs.statSync(dirPath).isDirectory();
        isDirectory ? walk(dirPath, callback) : callback(path.join(dir, f));
    });
}

const REGEX_IMPORT = /@import\s+['"](.*?)['"];/g;
const REGEX_USE = /@use\s+['"](.*?)['"]( as \*|);/g;

walk(scssDir, (filePath) => {
    if (!filePath.endsWith('.scss')) return;
    
    let content = fs.readFileSync(filePath, 'utf8');
    let imports = [];
    
    // 1. Extract all existing imports and already converted uses
    let match;
    while ((match = REGEX_IMPORT.exec(content)) !== null) {
        if (match[1]) imports.push(match[1]);
    }
    while ((match = REGEX_USE.exec(content)) !== null) {
        if (match[1]) imports.push(match[1]);
    }

    // 2. Remove all import/use lines from original content
    let cleanContent = content.replace(REGEX_IMPORT, '').replace(REGEX_USE, '').trim();
    
    // 3. Rebuild with @use at the top (deduplicated)
    if (imports.length > 0) {
        const uniqueImports = [...new Set(imports)];
        // Filter out empty ones that might have been created by previous failed attempts
        const validImports = uniqueImports.filter(i => i.trim().length > 0);
        
        const useStatements = validImports.map(i => `@use "${i.replace('.scss', '')}" as *;`).join('\n');
        
        // Handle Tailwind which MUST stay at the top or bottom depending on structure
        // In this project, Tailwind base/components/utilities are usually in app.scss
        let finalContent = useStatements + '\n\n' + cleanContent;
        
        // If it's app.scss, keep Tailwind at the very top before @use (Sass allows this in some setups, but officially @use is first)
        // Actually, Sass 2.0+ is strict: @use MUST be first.
        
        fs.writeFileSync(filePath, finalContent, 'utf8');
        console.log(`Migrated: ${path.relative(scssDir, filePath)}`);
    }
});
