'use client';

import React from 'react';
import Card from './Card';
import Button from './Button';
import { ImagePreview } from './ImagePreview';
import Edit from 'lucide-react/dist/esm/icons/edit';
import Mail from 'lucide-react/dist/esm/icons/mail';
import Phone from 'lucide-react/dist/esm/icons/phone';
import Building from 'lucide-react/dist/esm/icons/building';
import Calendar from 'lucide-react/dist/esm/icons/calendar';
import IndianRupee from 'lucide-react/dist/esm/icons/indian-rupee';
import Trash2 from 'lucide-react/dist/esm/icons/trash-2';
import { formatPhone, formatCurrency, formatDate, getPhotoUrl } from '@/utils/formatters';

interface User {
  _id: string;
  name: string;
  email: string;
  mobile: string;
  userType?: { name: string };
  office?: { name: string };
  photo?: string;
  ctc: number;
  joiningDate: string;
  updatedAt?: string;
}

interface UserCardProps {
  user: User;
  onEdit: (user: User) => void;
  onDelete?: (user: User) => void;
  onView?: (user: User) => void;
  className?: string;
}

const UserCard: React.FC<UserCardProps> = React.memo(({ user, onEdit, onDelete, onView, className = '' }) => {
  return (
    <Card
      className={`group hover:shadow-lg transition-all duration-300 cursor-pointer ${className}`}
      onClick={() => onView ? onView(user) : onEdit(user)}
      hover
    >
      <div className="flex items-start justify-between mb-2">
        {user.photo ? (
          <ImagePreview
            src={getPhotoUrl(user.photo, user.updatedAt) || ''}
            alt={user.name}
            className="w-12 h-12"
            thumbnailClassName="w-12 h-12 rounded-xl object-cover shadow-lg"
          />
        ) : (
          <div className="w-12 h-12 bg-gradient-to-r from-primary to-primary/80 rounded-xl flex items-center justify-center text-primary-foreground font-bold text-lg shadow-lg">
            {user.name?.[0]?.toUpperCase() || '?'}
          </div>
        )}
        {/* Fallback for error hidden logic handled by simple conditional above, simplified below for robustness */}
        {user.photo && (
          <div className="hidden w-12 h-12 bg-gradient-to-r from-primary to-primary/80 rounded-xl flex items-center justify-center text-primary-foreground font-bold text-lg shadow-lg">
            {user.name?.[0]?.toUpperCase() || '?'}
          </div>
        )}
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            className="opacity-100"
            onClick={(e) => {
              e.stopPropagation();
              onEdit(user);
            }}
            aria-label={`Edit ${user.name}`}
          >
            <Edit className="w-4 h-4" />
          </Button>
          {onDelete && (
            <Button
              size="sm"
              variant="outline"
              className="opacity-100 text-destructive hover:text-destructive hover:bg-destructive/10"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(user);
              }}
              aria-label={`Delete ${user.name}`}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <div>
          <h2 className="text-lg font-semibold leading-none capitalize text-foreground truncate w-full mb-2">
            {user.name?.toLowerCase()}
          </h2>
          <p className="text-sm text-muted-foreground flex items-center gap-2">
            <Mail className="w-4 h-4" />
            <span className="truncate w-full">{user.email}</span>
          </p>
          <p className="text-sm text-muted-foreground flex items-center gap-2">
            <Phone className="w-4 h-4" />
            {formatPhone(user.mobile)}
          </p>
        </div>

        <div className="flex gap-2 overflow-hidden">
          {user.userType && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary text-primary-foreground shadow-sm flex-1 min-w-0 max-w-max">
              <span className="truncate">{user.userType.name}</span>
            </span>
          )}
          {user.office && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary text-primary-foreground shadow-sm flex-1 min-w-0 max-w-max">
              <Building className="w-3 h-3 mr-1 shrink-0" />
              <span className="truncate">{user.office.name}</span>
            </span>
          )}
        </div>

        <div className="pt-2 border-t border-border">
          <div className="flex items-center justify-between text-sm truncate">
            <div className="flex items-center gap-1 text-muted-foreground">
              <IndianRupee className="w-4 h-4" />
              <span className="font-medium text-muted-foreground">
                {formatCurrency(user.ctc)}
              </span>
            </div>
            <div className="flex items-center gap-1 text-muted-foreground truncate">
              <Calendar className="w-4 h-4" />
              <span className="text-xs">
                Joined {formatDate(user.joiningDate)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </Card >
  );
});

UserCard.displayName = 'UserCard';

export default UserCard;