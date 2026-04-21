'use client';

import React, { useState } from 'react';
import Card from '@/components/Card';
import Button from '@/components/Button';
import MapPin from 'lucide-react/dist/esm/icons/map-pin';
import Users from 'lucide-react/dist/esm/icons/users';
import UserIcon from 'lucide-react/dist/esm/icons/user';
import { ImagePreview } from '@/components/ImagePreview';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export interface PremiumTaskData {
  id: string;
  name: string;
  description: string;
  status: 'Pending' | 'In Progress' | 'Completed' | string;
  priority: 'High' | 'Medium' | 'Low' | string;
  type: 'Mandatory' | 'Optional' | string;
  frequency: 'Daily' | 'Weekly' | 'One-Time' | string;
  officeName?: string;
  categoryName?: string;
  createdBy?: { name: string; initials: string; photo?: string };
  assignedBy?: { name: string; initials: string; photo?: string };
  assignedTo?: { name: string; initials: string; photo?: string }[];
  dueDate?: string;
  createdAt?: string;
  completedAt?: string;
  remarks?: string;
  photoProof?: string;
}

interface PremiumTaskCardProps {
  task: PremiumTaskData;
  onManage?: (id: string) => void;
  manageLabel?: string;
  t: (key: string, values?: any) => string;
}

const PremiumTaskCard: React.FC<PremiumTaskCardProps> = ({ task, onManage, manageLabel, t }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Safely translate keys that exist in the system
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

  const getTypeLabel = (type: string) => {
    return type === 'Mandatory' ? t('tasks.mandatory') : t('tasks.optional');
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
  const typeLabel = getTypeLabel(task.type);
  const statusLabel = getStatusLabel(task.status);
  const statusClass = getStatusClass(task.status);

  const getAvatarUrl = (photo?: string) => {
    if (!photo) return null;
    return photo.startsWith('http') ? photo : `${API_URL}${photo}`;
  };

  const UserAvatar = ({ user, size = 'md' }: { user?: { name: string; initials: string; photo?: string }, size?: 'sm' | 'md' }) => {
    const dim = size === 'sm' ? 'w-8 h-8' : 'w-10 h-10';
    const iconDim = size === 'sm' ? 'w-4 h-4' : 'w-5 h-5';
    const txtSize = size === 'sm' ? 'text-[10px]' : 'text-base';

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
        {user.initials}
      </div>
    );
  };

  return (
    <Card
      className="group grid grid-rows-subgrid row-span-7 gap-0 border-border/80 overflow-hidden bg-card/80 backdrop-blur-md transition-all duration-300 w-full max-w-full"
      shadow="md"
      hover
      rounded="xl"
    >
      {/* 1. Header Section */}
      <div className="pb-3 flex items-center justify-between gap-4 overflow-hidden self-start">
        <span className={`text-xs px-2.5 py-1 rounded-full font-semibold uppercase leading-none tracking-none border whitespace-nowrap ${priorityCfg.className}`}>
          ● {priorityCfg.label}
        </span>
        {/* <div className="flex items-center gap-1.5 shrink-0">
          <span className={`px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider border whitespace-nowrap ${task.type === 'Mandatory' ? 'bg-primary text-background border-primary' : 'bg-secondary text-background border-secondary'}`}>
            ◇ {typeLabel}
          </span> */}
        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold uppercase leading-none tracking-none border whitespace-nowrap ${statusClass}`}>
          ● {statusLabel}
        </span>
        {/* </div> */}
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

      {/* 3. Metadata Cards */}
      <div className="pb-3 overflow-hidden">
        <div className="grid grid-cols-2 gap-3 overflow-hidden">
          <div className="flex items-center justify-center gap-2.5 bg-primary/[0.02] p-2 rounded-xl border border-border shadow-inner min-w-0 overflow-hidden">
            <MapPin className="w-3.5 h-3.5 text-primary shrink-0 opacity-70" />
            <span className="text-xs font-bold text-foreground/90 sm:truncate translate-y-[0.5px] whitespace-normal sm:whitespace-nowrap hover:whitespace-normal break-all sm:break-normal hover:break-all" title={task.officeName || t('tasks.unknownOffice')}>{task.officeName || t('tasks.unknownOffice')}</span>
          </div>
          <div className="flex items-center justify-center gap-3 bg-primary/[0.02] p-2 rounded-xl border border-border shadow-inner min-w-0 overflow-hidden">
            <Users className="w-3.5 h-3.5 text-primary shrink-0 opacity-70" />
            <span className="text-xs font-bold text-foreground/90 sm:truncate translate-y-[0.5px] whitespace-normal sm:whitespace-nowrap hover:whitespace-normal break-all sm:break-normal hover:break-all" title={task.categoryName || t('tasks.selectUserCategory')}>{task.categoryName || t('tasks.selectUserCategory')}</span>
          </div>
        </div>
      </div>

      {/* 4. Stakeholder Section */}
      <div className="pb-3 overflow-hidden">
        <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent w-full mb-3" />
        <div className="flex items-center justify-between gap-4 overflow-hidden">
          {/* Assigner */}
          <div className="flex items-center gap-3 min-w-0 overflow-hidden">
            <UserAvatar user={task.assignedBy} />
            <div className="flex flex-col min-w-0 overflow-hidden">
              <span className="text-xs text-muted-foreground font-bold uppercase tracking-widest leading-none mb-1 shrink-0">{t('tasks.assigner')}</span>
              <span className="text-xs font-semibold text-foreground leading-tight tracking-tight truncate">
                {task.assignedBy?.name || t('tasks.notAssignedYet')}
              </span>
            </div>
          </div>

          {/* Assignees */}
          <div className="flex flex-col items-end shrink-0 overflow-hidden">
            <div className="flex -space-x-2 overflow-hidden px-1">
              {task.assignedTo && task.assignedTo.length > 0 ? (
                task.assignedTo.slice(0, 3).map((user, i) => (
                  <div key={i} className="flex items-center gap-3 min-w-0 overflow-hidden" title={user.name}>
                    <UserAvatar user={user} />
                    <div className="flex flex-col min-w-0 overflow-hidden">
                      <span className="text-xs text-muted-foreground font-bold uppercase tracking-widest leading-none mb-1 shrink-0">{t('tasks.assignments')}</span>
                      <span className="text-xs font-semibold text-foreground leading-tight tracking-tight truncate">
                        {user?.name}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex items-center gap-3 min-w-0 overflow-hidden" >
                  <UserAvatar />
                  <div className="flex flex-col min-w-0 overflow-hidden">
                    <span className="text-sm text-muted-foreground font-bold uppercase tracking-widest leading-none mb-1 shrink-0">{t('tasks.assignments')}</span>
                    <span className="text-xs font-semibold text-foreground leading-tight tracking-tight truncate">
                      NA
                    </span>
                  </div>
                </div>
              )}
              {task.assignedTo && task.assignedTo.length > 3 && (
                <div className="w-8 h-8 rounded-full bg-foreground border-2 border-card flex items-center justify-center text-[9px] font-black text-background shrink-0">
                  +{task.assignedTo.length - 3}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 5. Professional Data Row */}
      <div className="pb-3 flex items-center justify-between border-t border-border/50 pt-3 bg-primary/[0.02] overflow-hidden gap-2">
        <div className="flex flex-col min-w-0 overflow-hidden text-center">
          <span className="text-xs text-muted-foreground font-bold uppercase mb-1.5 leading-none truncate">{t('tasks.dueDate')}</span>
          <span className={`text-xs font-semibold truncate ${task.dueDate && new Date(task.dueDate) < new Date() ? 'text-destructive' : 'text-primary'}`}>
            {task.dueDate ? new Intl.DateTimeFormat('en-US', { month: 'short', day: '2-digit' }).format(new Date(task.dueDate)) : t('tasks.noDueDate')}
          </span>
        </div>
        <div className="flex flex-col items-center min-w-0 overflow-hidden text-center mx-auto">
          <span className="text-xs text-muted-foreground font-bold uppercase mb-1.5 leading-none truncate w-full">{t('tasks.createdOn')}</span>
          <span className="text-xs font-semibold text-foreground/90 truncate">
            {task.createdAt ? new Intl.DateTimeFormat('en-US', { month: 'short', day: '2-digit' }).format(new Date(task.createdAt)) : '--'}
          </span>
        </div>
        <div className="flex flex-col items-center min-w-0 overflow-hidden text-center">
          <span className="text-xs text-muted-foreground font-bold uppercase mb-1.5 leading-none truncate w-full text-right">{t('tasks.frequency')}</span>
          <span className="text-xs font-semibold text-foreground truncate">
            {task.frequency === 'Daily' ? t('tasks.daily') : task.frequency === 'Weekly' ? t('tasks.weekly') : task.frequency === 'One-Time' ? t('tasks.oneTime') : task.frequency}
          </span>
        </div>
      </div>

      {/* 6. Template Origin */}
      <div className="pb-3 overflow-hidden">
        {task.createdBy && (
          <div className="flex items-center gap-2 border-t border-border/40 pt-3 overflow-hidden">
            <div className="w-1.5 h-1.5 rounded-full bg-primary/60 border border-primary/20 shrink-0" />
            <p className="text-sm font-semibold text-foreground truncate">
              {t('tasks.createdBy')}: {task.createdBy.name.length > 20 ? <span className="font-semibold text-foreground">{task.createdBy.name}.slice(0, 20) + "..."</span> : <span className="font-bold text-foreground">{task.createdBy.name}</span>}
            </p>
          </div>
        )}
      </div>

      {/* 7. Call to Action */}
      <div className="overflow-hidden">
        <Button
          variant="primary"
          className="w-full h-12 text-primary-foreground font-black uppercase text-[12px] border-none transition-all shadow-md active:scale-95 whitespace-nowrap truncate overflow-hidden"
          onClick={() => onManage?.(task.id)}
        >
          {manageLabel || t('tasks.manage')}
        </Button>
      </div>
    </Card>
  );
};

export default PremiumTaskCard;
