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

  // Add import if missing
  if (!content.includes('TenantGuard')) {
    // find the last import and append
    const importMatch = content.match(/import .* from '.*';\n/g);
    if (importMatch) {
      const lastImport = importMatch[importMatch.length - 1];
      const importLevel = relPath.split('/').length - 1; // 1 level deep
      const dots = '../'.repeat(importLevel);
      content = content.replace(lastImport, lastImport + `import { TenantGuard } from '${dots}auth/guards/tenant.guard';\n`);
    }
  }

  // Replace @UseGuards(AuthGuard('jwt'))
  content = content.replace("@UseGuards(AuthGuard('jwt'))", "@UseGuards(AuthGuard('jwt'), TenantGuard)");

  fs.writeFileSync(fullPath, content, 'utf-8');
  console.log(`Patched ${relPath}`);
}
