'use client';

import { useTranslations } from 'next-intl';
import { Card, ImagePreview } from '@/components';
import UsersIcon from 'lucide-react/dist/esm/icons/users';

interface LivePresenceProps {
  filteredLivePresence: any[];
  activeFilteredCount: number;
}

export const AttendanceLivePresence = ({
  filteredLivePresence,
  activeFilteredCount,
  isLoading = false
}: LivePresenceProps & { isLoading?: boolean }) => {
  const t = useTranslations();

  return (
    <Card className="p-4 md:p-6">
      <div className="flex items-center justify-between mb-4 md:mb-6 pb-4 border-b border-border/60">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-secondary/10 rounded-lg">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-secondary"></span>
            </span>
          </div>
          <h2 className="text-xl font-bold text-foreground">
            {t('attendance.livePresence.title') || "Who's In? (Live)"}
          </h2>
        </div>
        <div className="text-xs font-semibold px-2 py-1 bg-secondary rounded-md text-secondary-foreground uppercase tracking-widest">
          {activeFilteredCount} {t('attendance.livePresence.online') || "Active Now"}
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div key={`skeleton-${i}`} className="flex flex-col items-center animate-pulse">
              <div className="w-20 h-20 rounded-2xl bg-muted mb-3"></div>
              <div className="h-3 w-16 bg-muted rounded mb-2"></div>
              <div className="h-2 w-12 bg-muted rounded"></div>
            </div>
          ))
        ) : filteredLivePresence.length > 0 ? (
          filteredLivePresence.map((person) => (
            <div key={person._id} className="relative group flex flex-col items-center">
              <div className="relative w-20 h-20 rounded-2xl overflow-hidden mb-3 border-2 border-border group-hover:border-primary/50 transition-all duration-300 shadow-sm group-hover:shadow-md">
                {person.photo ? (
                  <ImagePreview
                    src={person.photo.startsWith('http') ? person.photo : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}${person.photo}${person.updatedAt ? `?v=${new Date(person.updatedAt).getTime()}` : ''}`}
                    alt={person.name}
                    className="w-full h-full"
                    thumbnailClassName="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                ) : null}
                <div className={`${person.photo ? 'hidden' : ''} w-full h-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center text-primary-foreground font-bold text-2xl`}>
                  {person.name.charAt(0).toUpperCase()}
                </div>
                <div className={`absolute bottom-1 right-1 w-4 h-4 rounded-full border-2 border-background shadow-sm ${person.isClockedIn ? 'bg-secondary' : 'bg-muted-foreground/30'}`}>
                  {person.isClockedIn && <span className="absolute inset-0 rounded-full bg-secondary animate-ping opacity-75"></span>}
                </div>
              </div>
              <span className="text-sm font-bold text-foreground text-center truncate w-full px-1">{person.name}</span>
              <div className="flex flex-col items-center">
                <span className="text-[10px] font-semibold text-foreground transition-colors group-hover:text-primary leading-tight">{person.office}</span>
                <span className="text-[9px] text-foreground/60 uppercase tracking-tighter font-medium">{person.userType}</span>
              </div>
              {person.isClockedIn && person.lastIn && (
                <div className="text-[9px] mt-1 text-secondary font-bold bg-secondary/10 px-1.5 py-0.5 rounded-md">
                  {new Date(person.lastIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="col-span-full py-12 flex flex-col items-center justify-center border-2 border-dashed border-border/50 rounded-2xl bg-muted/5">
            <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mb-3">
              <UsersIcon className="w-6 h-6 text-muted-foreground/40" />
            </div>
            <p className="text-muted-foreground text-sm font-medium">
              {t('attendance.livePresence.noStaff') || "No staff matching these filters"}
            </p>
          </div>
        )}
      </div>
    </Card>
  );
};
