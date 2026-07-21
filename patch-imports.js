const fs = require('fs');
const path = require('path');

const controllers = [
  'predios/predios.controller.ts',
  'opportunities/opportunities.controller.ts',
  'pipelines/pipelines.controller.ts',
  'incidents/incidents.controller.ts',
  'media/media.controller.ts',
  'technical-records/technical-records.controller.ts',
  'time-mark/time-mark.controller.ts'
];

const basePath = path.join(__dirname, 'backend/src');

for (const relPath of controllers) {
  const fullPath = path.join(basePath, relPath);
  if (!fs.existsSync(fullPath)) continue;

  let content = fs.readFileSync(fullPath, 'utf-8');

  if (!content.includes('TenantGuard } from')) {
    const importLevel = relPath.split('/').length - 1; // 1 level deep
    const dots = '../'.repeat(importLevel);
    // find first line
    const importStr = `import { TenantGuard } from '${dots}auth/guards/tenant.guard';\n`;
    content = importStr + content;
    fs.writeFileSync(fullPath, content, 'utf-8');
    console.log(`Added import to ${relPath}`);
  }
}
