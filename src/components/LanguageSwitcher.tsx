'use client';

import { useRouter, usePathname } from '@/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { locales } from '../i18n';
import ChevronDown from 'lucide-react/dist/esm/icons/chevron-down';
import Languages from 'lucide-react/dist/esm/icons/languages';
import { useState, useRef, useEffect } from 'react';

interface LanguageSwitcherProps {
  variant?: 'primary' | 'secondary' | 'warning' | 'destructive';
}

const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({ variant = 'primary' }) => {
  const t = useTranslations('language');
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const textClasses = {
    primary: 'text-primary',
    secondary: 'text-secondary',
    warning: 'text-warning',
    destructive: 'text-destructive',
  };

  const bgClasses = {
    primary: 'bg-primary/10',
    secondary: 'bg-secondary/10',
    warning: 'bg-warning/10',
    destructive: 'bg-destructive/10',
  };

  const switchLocale = (newLocale: string) => {
    router.replace(pathname, { locale: newLocale });
    setIsOpen(false);
  };

  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);


  // const switchLocale = (newLocale: string) => {
  //   router.push(pathname, { locale: newLocale });
  //   setIsOpen(false);
  // };

  const getLanguageName = (locale: string) => {
    switch (locale) {
      case 'en': return 'English';
      case 'hi': return 'हिंदी';
      case 'gu': return 'ગુજરાતી';
      default: return locale;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`h-9 flex items-center gap-1 sm:gap-2 px-2 sm:px-3 bg-background/50 backdrop-blur-md border border-border rounded-lg text-foreground hover:bg-muted/50 transition-all duration-200 ${isOpen ? `ring-1 ring-${variant}` : ''}`}
        aria-label={t('selectLanguage')}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <Languages className={`w-4 h-4 ${isOpen ? textClasses[variant] : ''}`} />
        <span className="text-sm font-medium hidden sm:block">{getLanguageName(locale)}</span>
        <ChevronDown className={`w-3 h-3 sm:w-4 sm:h-4 transition-transform duration-200 ${isOpen ? `rotate-180 ${textClasses[variant]}` : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-popover backdrop-blur-lg border border-border rounded-lg shadow-xl z-50 animate-in fade-in zoom-in-95 duration-200">
          {locales.map((loc) => (
            <button
              key={loc}
              onClick={() => switchLocale(loc)}
              className={`w-full text-left px-4 py-3 text-sm hover:bg-muted/50 transition-colors duration-200 first:rounded-t-lg last:rounded-b-lg ${loc === locale ? `${bgClasses[variant]} ${textClasses[variant]} font-medium` : 'text-foreground'
                }`}
            >
              {getLanguageName(loc)}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default LanguageSwitcher;
