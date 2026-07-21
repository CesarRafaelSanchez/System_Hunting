const fs = require('fs');
const path = require('path');

const filesToPatch = [
  'frontend/src/components/layout/Sidebar.tsx',
  'frontend/src/components/layout/Topbar.tsx',
  'frontend/src/components/opportunities/ImportExportExcelModal.tsx',
  'frontend/src/components/opportunities/NewOpportunityModal.tsx',
  'frontend/src/views/auth/WorkspaceSelectorView.tsx',
  'frontend/src/views/backoffice/KanbanBoard.tsx',
  'frontend/src/views/backoffice/OpportunitySplitView.tsx',
  'frontend/src/views/dashboard/DashboardView.tsx',
  'frontend/src/views/hunter/AsignacionPredio.tsx',
  'frontend/src/views/hunter/FichaDatosPredio.tsx',
  'frontend/src/views/hunter/RegistrarPredio.tsx',
  'frontend/src/views/hunter/TimeMark.tsx',
];

const basePath = path.join(__dirname);

for (const relPath of filesToPatch) {
  const fullPath = path.join(basePath, relPath);
  if (!fs.existsSync(fullPath)) continue;

  let content = fs.readFileSync(fullPath, 'utf-8');

  // Add import if missing
  if (!content.includes('useTenantStore')) {
    if (content.includes("import { useAuthStore }")) {
      content = content.replace("import { useAuthStore } from '../../store/useAuthStore';", "import { useAuthStore } from '../../store/useAuthStore';\nimport { useTenantStore } from '../../store/useTenantStore';");
      // Adjust path for views vs components
      content = content.replace("import { useAuthStore } from '../store/useAuthStore';", "import { useAuthStore } from '../store/useAuthStore';\nimport { useTenantStore } from '../store/useTenantStore';");
    }
  }

  // Inject activeWorkspace hook if useAuthStore is called
  if (content.includes('useAuthStore(') && !content.includes('activeWorkspace')) {
    content = content.replace(/(const {.*?user.*?} = useAuthStore\(\);)/, "$1\n  const activeWorkspace = useTenantStore(state => state.activeWorkspace);");
    content = content.replace(/(const user = useAuthStore.*?;)/, "$1\n  const activeWorkspace = useTenantStore(state => state.activeWorkspace);");
  }

  // Replace user?.role with activeWorkspace?.role
  content = content.replace(/user\?\.role/g, "(activeWorkspace?.role || user?.globalRole)");
  content = content.replace(/user\.role/g, "(activeWorkspace?.role || user?.globalRole)");

  // Replace user?.companyId with activeWorkspace?.companyId
  content = content.replace(/user\?\.companyId/g, "activeWorkspace?.companyId");
  content = content.replace(/user\.companyId/g, "activeWorkspace?.companyId");

  // Fix 'ADMIN' comparisons
  content = content.replace(/=== 'ADMIN'/g, "=== 'ACCOUNT_ADMIN' || (activeWorkspace?.role || user?.globalRole) === 'AGENCY_ADMIN'");
  content = content.replace(/case 'ADMIN':/g, "case 'ACCOUNT_ADMIN':\n    case 'AGENCY_ADMIN':");
  
  // Fix KanbanBoard 503 missing role (might be userRole variable)
  // Let's just fix the rest manually or write a broader regex if needed, but let's try replacing === 'ADMIN' first.
  
  // Fix WorkspaceSelectorView unused var
  if (relPath.includes('WorkspaceSelectorView.tsx')) {
    content = content.replace("import { useTenantStore, Workspace }", "import { useTenantStore, type Workspace }");
    content = content.replace("const activeWorkspace = useTenantStore(state => state.activeWorkspace);", "");
  }

  // Fix KanbanBoard 1220: user?.role passed as string
  content = content.replace(/role: \(activeWorkspace\?\.role \|\| user\?\.globalRole\)/g, "role: (activeWorkspace?.role || user?.globalRole) as string");


  fs.writeFileSync(fullPath, content, 'utf-8');
  console.log(`Patched ${relPath}`);
}
