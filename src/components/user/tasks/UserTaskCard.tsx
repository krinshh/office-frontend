'use client';

import React, { useState } from 'react';
import Card from '@/components/Card';
import Button from '@/components/Button';
import UserIcon from 'lucide-react/dist/esm/icons/user';
import { useTranslations } from 'next-intl';
import { ImagePreview } from '@/components/ImagePreview';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

interface UserTaskCardProps {
  task: any;
  myAssignment: any;
  loadingActions: Set<string>;
  onStart: (assignmentId: string) => void;
  onComplete: (assignment: any) => void;
}

export const UserTaskCard = ({
  task,
  myAssignment,
  loadingActions,
  onStart,
  onComplete
}: UserTaskCardProps) => {
  const t = useTranslations();
  const [isExpanded, setIsExpanded] = useState(false);

  const displayStatus = myAssignment ? myAssignment.status : 'Pending';

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'In Progress': return t('tasks.status.inProgress');
      case 'Pending': return t('tasks.status.pending');
      case 'Completed': return t('tasks.status.completed');
      default: return status;
    }
  };

  const getPriorityConfig = (priority: string) => {
    switch (priority) {
      case 'High':
        return { label: t('tasks.priorityOptions.high'), className: 'text-background bg-destructive font-semibold' };
      case 'Medium':
        return { label: t('tasks.priorityOptions.medium'), className: 'text-background bg-primary font-semibold' };
      case 'Low':
        return { label: t('tasks.priorityOptions.low'), className: 'text-background bg-secondary font-semibold' };
      default:
        return { label: priority, className: 'text-background bg-muted font-semibold' };
    }
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'In Progress': return 'text-background bg-secondary';
      case 'Pending': return 'text-background bg-destructive';
      case 'Completed': return 'text-background bg-secondary';
      default: return 'text-background bg-muted';
    }
  };

  const priorityCfg = getPriorityConfig(task.priority);
  const statusLabel = getStatusLabel(displayStatus);
  const statusClass = getStatusClass(displayStatus);

  const getAvatarUrl = (photo?: string) => {
    if (!photo) return null;
    return photo.startsWith('http') ? photo : `${API_URL}${photo}`;
  };

  const UserAvatar = ({ user, size = 'md' }: { user?: { name: string; initials: string; photo?: string }, size?: 'sm' | 'md' }) => {
    const dim = size === 'sm' ? 'w-8 h-8' : 'w-10 h-10';
    const iconDim = size === 'sm' ? 'w-4 h-4' : 'w-5 h-5';
    const txtSize = size === 'sm' ? 'text-[10px]' : 'text-base';

    const initials = user?.name
      ? user.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
      : 'NA';

    if (!user) return (
      <div className={`${dim} rounded-xl bg-gradient-to-r from-primary to-primary/80 flex items-center justify-center text-primary-foreground font-bold shadow-lg shrink-0`}>
        <UserIcon className={iconDim} />
      </div>
    );

    const photoUrl = getAvatarUrl(user.photo);

    return photoUrl ? (
      <ImagePreview
        src={photoUrl}
        alt={user.name}
        className={`${dim}`}
        thumbnailClassName={`${dim} rounded-xl object-cover shadow-lg shrink-0`}
      />
    ) : (
      <div className={`${dim} rounded-xl bg-gradient-to-r from-primary to-primary/80 flex items-center justify-center text-primary-foreground font-bold shadow-lg shrink-0`}>
        {initials}
      </div>
    );
  };

  const isStarting = myAssignment && loadingActions.has(myAssignment._id);

  return (
    <Card
      className="group grid grid-rows-subgrid row-span-5 gap-0 border-border/80 overflow-hidden bg-card/80 backdrop-blur-md transition-all duration-300 w-full max-w-full"
      shadow="md"
      hover
      rounded="xl"
    >
      {/* 1. Header Section */}
      <div className="pb-3 flex items-center justify-between gap-4 overflow-hidden self-start">
        <span className={`text-xs px-2.5 py-1 rounded-full font-semibold uppercase leading-none tracking-none border whitespace-nowrap ${priorityCfg.className}`}>
          ● {priorityCfg.label}
        </span>

        {/* Type badge commented as requested, maintained for dashboard parity potential */}
        {/* <span className={`px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider border whitespace-nowrap ${task.type === 'Mandatory' ? 'bg-primary text-background border-primary' : 'bg-secondary text-background border-secondary'}`}>
            ◇ {task.type === 'Mandatory' ? t('tasks.mandatory') : t('tasks.optional')}
        </span> */}

        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold uppercase leading-none tracking-none border whitespace-nowrap ${statusClass}`}>
          ● {statusLabel}
        </span>
      </div>

      {/* 2. Title Section */}
      <div className="pb-3 overflow-hidden">
        <button onClick={() => setIsExpanded(!isExpanded)} className="w-full text-left focus:outline-none">
          <h2 className={`text-xl font-bold text-foreground leading-tight tracking-tight mb-1 ${!isExpanded ? 'line-clamp-1' : 'break-words'}`} title={task.name}>
            {task.name}
          </h2>
          <p className={`text-base text-foreground/80 leading-none font-medium transition-all duration-300 ${!isExpanded ? 'line-clamp-2' : 'break-words'}`}>
            {task.description}
          </p>
        </button>
      </div>

      {/* 3. Stakeholder Section (Assigner only) */}
      <div className="pb-3 overflow-hidden">
        <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent w-full mb-3" />
        <div className="flex items-center justify-between gap-4 overflow-hidden">
          {/* Assigner */}
          <div className="flex items-center gap-3 min-w-0 overflow-hidden">
            <UserAvatar user={myAssignment?.assignedBy} />
            <div className="flex flex-col min-w-0 overflow-hidden">
              <span className="text-xs text-muted-foreground font-bold uppercase tracking-widest leading-none mb-1 shrink-0">{t('tasks.assigner')}</span>
              <span className="text-xs font-semibold text-foreground leading-tight tracking-tight truncate">
                {myAssignment?.assignedBy?.name || t('tasks.notAssignedYet')}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Professional Data Row */}
      <div className="pb-3 flex items-center justify-between border-t border-border/50 pt-3 bg-primary/[0.02] overflow-hidden gap-2">
        <div className="flex flex-col min-w-0 overflow-hidden text-center">
          <span className="text-xs text-muted-foreground font-bold uppercase mb-1.5 leading-none truncate">{t('tasks.dueDate')}</span>
          <span className={`text-xs font-semibold truncate ${myAssignment?.dueDate && new Date(myAssignment.dueDate) < new Date() ? 'text-destructive' : 'text-secondary'}`}>
            {myAssignment?.dueDate ? new Intl.DateTimeFormat('en-US', { month: 'short', day: '2-digit' }).format(new Date(myAssignment.dueDate)) : t('tasks.noDueDate')}
          </span>
        </div>
        <div className="flex flex-col items-center min-w-0 overflow-hidden text-center mx-auto">
          <span className="text-xs text-muted-foreground font-bold uppercase mb-1.5 leading-none truncate w-full">{t('tasks.assignedAt')}</span>
          <span className="text-xs font-semibold text-foreground/90 truncate">
            {myAssignment?.createdAt ? new Intl.DateTimeFormat('en-US', { month: 'short', day: '2-digit' }).format(new Date(myAssignment.createdAt)) : '--'}
          </span>
        </div>
        <div className="flex flex-col items-center min-w-0 overflow-hidden text-center">
          <span className="text-xs text-muted-foreground font-bold uppercase mb-1.5 leading-none truncate w-full text-right">{t('tasks.frequency')}</span>
          <span className="text-xs font-semibold text-foreground truncate">
            {task.frequency === 'Daily' ? t('tasks.daily') : task.frequency === 'Weekly' ? t('tasks.weekly') : task.frequency === 'One-Time' ? t('tasks.oneTime') : task.frequency}
          </span>
        </div>
      </div>

      {/* 5. Call to Action */}
      <div className="overflow-hidden">
        {myAssignment ? (
          <>
            {myAssignment.status === 'Pending' && (
              <Button
                variant="secondary"
                className="w-full h-12 text-secondary-foreground font-black uppercase text-[12px] border-none transition-all shadow-md active:scale-95 whitespace-nowrap truncate overflow-hidden"
                onClick={() => onStart(myAssignment._id)}
                disabled={isStarting}
                loading={isStarting}
              >
                {isStarting ? t('tasks.starting') : t('tasks.start')}
              </Button>
            )}
            {myAssignment.status === 'In Progress' && (
              <Button
                variant="secondary"
                className="w-full h-12 text-secondary-foreground font-black uppercase text-[12px] border-none transition-all shadow-md active:scale-95 whitespace-nowrap truncate overflow-hidden bg-secondary hover:bg-secondary/90"
                onClick={() => onComplete(myAssignment)}
              >
                {t('tasks.complete')}
              </Button>
            )}
            {myAssignment.status === 'Completed' && (
              <div className="w-full h-12 rounded-xl bg-secondary/10 border border-secondary/20 flex items-center justify-center gap-2 text-secondary font-black uppercase text-[12px]">
                <span>✓</span>
                {t('tasks.status.completed')}
              </div>
            )}
          </>
        ) : (
          <div className="w-full h-12 rounded-xl bg-muted/10 border border-border flex items-center justify-center text-muted-foreground text-xs italic">
            {t('tasks.notAssignedToYou')}
          </div>
        )}
      </div>
    </Card>
  );
};
