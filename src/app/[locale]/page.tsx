import Link from '@/components/Link';
import Button from '@/components/Button';
import { useTranslations } from 'next-intl';

export default function Home() {
  const t = useTranslations('landing');

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/30 relative overflow-hidden flex items-center justify-center px-4 py-12 force-light">
      {/* Background Decor */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px] -z-10" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-secondary/5 rounded-full blur-[100px] -z-10" />

      <div className="max-w-6xl w-full text-center z-10">
        <div className="mb-20 space-y-8">
          <div className="inline-flex items-center justify-center px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            ✨ Next Gen Office Management
          </div>
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight text-foreground bg-clip-text text-transparent bg-gradient-to-b from-foreground to-foreground/70" style={{ contain: 'paint' }}>
            {t('title')}
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            {t('subtitle')}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link href="/login">
              <Button
                size="lg"
                className="h-14 px-8 text-lg rounded-full shadow-xl shadow-primary/20 hover:shadow-primary/30 transition-all hover:scale-105"
              >
                {t('getStarted')}
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-24" style={{ contentVisibility: 'auto', containIntrinsicSize: '0 400px' }}>
          <div className="group glass-card p-8 rounded-3xl hover:-translate-y-2 hover:shadow-lg transition-all duration-300 text-left">
            <div className="w-14 h-14 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mb-6 text-3xl group-hover:scale-110 transition-transform duration-300">
              📋
            </div>
            <h3 className="text-xl font-bold text-foreground mb-3">{t('features.tasks.title')}</h3>
            <p className="text-muted-foreground leading-relaxed">{t('features.tasks.desc')}</p>
          </div>

          <div className="group glass-card p-8 rounded-3xl hover:-translate-y-2 hover:shadow-lg transition-all duration-300 text-left">
            <div className="w-14 h-14 bg-secondary/10 text-secondary rounded-2xl flex items-center justify-center mb-6 text-3xl group-hover:scale-110 transition-transform duration-300">
              📍
            </div>
            <h3 className="text-xl font-bold text-foreground mb-3">{t('features.attendance.title')}</h3>
            <p className="text-muted-foreground leading-relaxed">{t('features.attendance.desc')}</p>
          </div>

          <div className="group glass-card p-8 rounded-3xl hover:-translate-y-2 hover:shadow-lg transition-all duration-300 text-left">
            <div className="w-14 h-14 bg-amber-500/10 text-amber-500 rounded-2xl flex items-center justify-center mb-6 text-3xl group-hover:scale-110 transition-transform duration-300">
              💰
            </div>
            <h3 className="text-xl font-bold text-foreground mb-3">{t('features.salary.title')}</h3>
            <p className="text-muted-foreground leading-relaxed">{t('features.salary.desc')}</p>
          </div>
        </div>

        <div className="border-t border-border pt-8" style={{ contentVisibility: 'auto', containIntrinsicSize: '0 50px' }}>
          <p className="text-sm text-muted-foreground font-medium">
            {t('footer')}
          </p>
        </div>
      </div>
    </div>
  );
}
