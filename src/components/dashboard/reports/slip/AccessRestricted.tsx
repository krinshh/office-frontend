'use client';

import Shield from 'lucide-react/dist/esm/icons/shield';

interface AccessRestrictedProps {
  t: any;
}

export function AccessRestricted({ t }: AccessRestrictedProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8">
      <div className="bg-destructive/10 p-4 rounded-full mb-4">
        <Shield className="w-12 h-12 text-destructive" />
      </div>
      <h1 className="text-2xl font-bold text-destructive mb-2">{t('common.accessRestricted')}</h1>
      <p className="text-muted-foreground">{t('common.accessRestrictedMessage')}</p>
      <p className="text-sm text-muted-foreground mt-4 animate-pulse">Redirecting to dashboard...</p>
    </div>
  );
}
