// This file provides TypeScript definitions for direct icon imports
// which allows us to bypass the large 'lucide-react' barrel index file
// for better tree-shaking and bundle size.

declare module 'lucide-react/dist/esm/icons/*' {
  import type { LucideIcon } from 'lucide-react';
  const icon: LucideIcon;
  export default icon;
}
