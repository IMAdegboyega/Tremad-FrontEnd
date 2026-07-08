'use client';

import React, { useEffect, useState } from 'react';
import {
  User,
  Lock,
  AlertTriangle,
  UserCheck,
  Shield,
  Clock,
  FileText,
  Settings,
  ArrowLeft,
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import {
  getAuditLogs,
  type AuditLog,
  type AuditLogActor,
} from '@/lib/api/superAdmin.service';
import { toTitleCase } from '@/lib/utils';

// ============================================================================
// ACTIVITY TYPE CONFIG
// ============================================================================

type ActivityCategory =
  | 'authentication'
  | 'security'
  | 'user-management'
  | 'system';

interface ActivityType {
  category: ActivityCategory;
  type: string;
  defaultIcon: React.ElementType;
  defaultBg: string;
  defaultColor: string;
}

const ACTIVITY_TYPES: Record<string, ActivityType> = {
  'student-login': {
    category: 'authentication',
    type: 'student-login',
    defaultIcon: User,
    defaultBg: 'bg-green-50',
    defaultColor: 'text-green-600',
  },
  'teacher-login': {
    category: 'authentication',
    type: 'teacher-login',
    defaultIcon: UserCheck,
    defaultBg: 'bg-green-50',
    defaultColor: 'text-green-600',
  },
  logout: {
    category: 'authentication',
    type: 'logout',
    defaultIcon: User,
    defaultBg: 'bg-gray-50',
    defaultColor: 'text-gray-600',
  },
  'password-reset': {
    category: 'security',
    type: 'password-reset',
    defaultIcon: Lock,
    defaultBg: 'bg-purple-50',
    defaultColor: 'text-purple-600',
  },
  'failed-login': {
    category: 'security',
    type: 'failed-login',
    defaultIcon: AlertTriangle,
    defaultBg: 'bg-orange-50',
    defaultColor: 'text-orange-600',
  },
  'suspicious-activity': {
    category: 'security',
    type: 'suspicious-activity',
    defaultIcon: Shield,
    defaultBg: 'bg-red-50',
    defaultColor: 'text-red-600',
  },
  'user-created': {
    category: 'user-management',
    type: 'user-created',
    defaultIcon: UserCheck,
    defaultBg: 'bg-blue-50',
    defaultColor: 'text-blue-600',
  },
  'user-updated': {
    category: 'user-management',
    type: 'user-updated',
    defaultIcon: Settings,
    defaultBg: 'bg-blue-50',
    defaultColor: 'text-blue-600',
  },
  'approval-pending': {
    category: 'user-management',
    type: 'approval-pending',
    defaultIcon: Clock,
    defaultBg: 'bg-yellow-50',
    defaultColor: 'text-yellow-600',
  },
  'system-update': {
    category: 'system',
    type: 'system-update',
    defaultIcon: Settings,
    defaultBg: 'bg-gray-50',
    defaultColor: 'text-gray-600',
  },
  'report-generated': {
    category: 'system',
    type: 'report-generated',
    defaultIcon: FileText,
    defaultBg: 'bg-indigo-50',
    defaultColor: 'text-indigo-600',
  },
};

// ============================================================================
// AUDIT LOG → ACTIVITY MAPPING
// ============================================================================

interface DisplayActivity {
  id: string;
  type: string;
  title: string;
  subtitle?: string;
  timestamp: string;
}

/**
 * Pull a human-readable name out of a populated `userId` reference. Falls back
 * to the role label so we never render "undefined".
 */
function actorDisplay(userId: AuditLog['userId']): string {
  if (!userId || typeof userId === 'string') return '';
  const actor = userId as AuditLogActor;
  const fullName = `${toTitleCase(actor.firstName ?? '')} ${toTitleCase(
    actor.lastName ?? ''
  )}`.trim();
  return fullName || actor.email || '';
}

/**
 * Map a backend audit log into the UI shape expected by the activity rows.
 *
 * The backend emits domain-specific actions like STUDENT_LOGIN_SUCCESS or
 * CREATE_TEACHER. We collapse them into the small visual taxonomy in
 * ACTIVITY_TYPES so the icon/color scheme stays manageable.
 */
function mapAuditLog(log: AuditLog): DisplayActivity {
  const actor = actorDisplay(log.userId) || log.role || 'Unknown';
  const action = log.action || '';

  // -- Authentication ------------------------------------------------------
  if (/STUDENT_LOGIN_SUCCESS/.test(action)) {
    return {
      id: log._id,
      type: 'student-login',
      title: `Student login: ${actor}`,
      subtitle: log.ip ? `From ${log.ip}` : undefined,
      timestamp: log.timestamp,
    };
  }
  if (/(TEACHER|ADMIN)_LOGIN_SUCCESS/.test(action)) {
    return {
      id: log._id,
      type: 'teacher-login',
      title: `Teacher login: ${actor}`,
      subtitle: log.ip ? `From ${log.ip}` : undefined,
      timestamp: log.timestamp,
    };
  }
  if (/SUPER_ADMIN.*LOGIN_SUCCESS/.test(action)) {
    return {
      id: log._id,
      type: 'teacher-login',
      title: `Super admin login: ${actor}`,
      subtitle: log.ip ? `From ${log.ip}` : undefined,
      timestamp: log.timestamp,
    };
  }
  if (/_LOGOUT$/.test(action)) {
    return {
      id: log._id,
      type: 'logout',
      title: `Logout: ${actor}`,
      timestamp: log.timestamp,
    };
  }

  // -- Security ------------------------------------------------------------
  if (/LOGIN_FAILED|LOGIN_UNAUTHORIZED|LOGIN_INVALID_TOKEN/.test(action)) {
    return {
      id: log._id,
      type: 'failed-login',
      title: 'Failed login attempt detected',
      subtitle: log.ip
        ? `IP: ${log.ip}${log.failureReason ? ` · ${log.failureReason}` : ''}`
        : log.failureReason,
      timestamp: log.timestamp,
    };
  }
  if (/ACCOUNT_LOCKED|BLOCKED_IP|OTP_MAX_ATTEMPTS/.test(action)) {
    return {
      id: log._id,
      type: 'suspicious-activity',
      title: action.includes('BLOCKED_IP')
        ? 'IP address blocked'
        : 'Account locked',
      subtitle: log.ip ? `IP: ${log.ip}` : actor,
      timestamp: log.timestamp,
    };
  }
  if (/PASSWORD/.test(action)) {
    return {
      id: log._id,
      type: 'password-reset',
      title: action.includes('RESET')
        ? 'Password reset'
        : 'Password change',
      subtitle: actor,
      timestamp: log.timestamp,
    };
  }

  // -- User management -----------------------------------------------------
  if (/^CREATE_(STUDENT|TEACHER|ADMIN)|^BULK_CREATE_STUDENTS/.test(action)) {
    return {
      id: log._id,
      type: 'user-created',
      title: action.includes('BULK')
        ? 'Bulk student accounts created'
        : `New ${
            action.includes('TEACHER')
              ? 'teacher'
              : action.includes('ADMIN')
              ? 'admin'
              : 'student'
          } account created`,
      subtitle: actor ? `By ${actor}` : undefined,
      timestamp: log.timestamp,
    };
  }
  if (/^UPDATE_STUDENT|PROFILE_UPDATE|AVATAR_UPLOAD/.test(action)) {
    return {
      id: log._id,
      type: 'user-updated',
      title: 'User profile updated',
      subtitle: actor,
      timestamp: log.timestamp,
    };
  }
  if (/^DELETE_USER|FORCE_LOGOUT_USER/.test(action)) {
    return {
      id: log._id,
      type: 'user-updated',
      title: action.includes('DELETE')
        ? 'User account removed'
        : 'User force-logged out',
      subtitle: actor ? `By ${actor}` : undefined,
      timestamp: log.timestamp,
    };
  }
  if (/APPROVE_REQUEST|DENY_REQUEST|REQUEST$/.test(action)) {
    return {
      id: log._id,
      type: 'approval-pending',
      title: action.includes('APPROVE')
        ? 'Request approved'
        : action.includes('DENY')
        ? 'Request denied'
        : 'New approval request',
      subtitle: actor ? `By ${actor}` : undefined,
      timestamp: log.timestamp,
    };
  }

  // -- System / financial fallback ----------------------------------------
  if (/PAYMENT|BROADCAST_NOTIFICATION/.test(action)) {
    return {
      id: log._id,
      type: 'system-update',
      title: action.includes('BROADCAST')
        ? 'Broadcast notification sent'
        : 'Payment activity',
      subtitle: actor,
      timestamp: log.timestamp,
    };
  }

  // Generic fallback — show the raw action in a friendly way.
  return {
    id: log._id,
    type: 'system-update',
    title: action.replace(/_/g, ' ').toLowerCase(),
    subtitle: actor,
    timestamp: log.timestamp,
  };
}

// ============================================================================
// TIME FORMATTING
// ============================================================================

/**
 * Render a relative timestamp ("a few secs ago") that matches the original
 * design without pulling in another date library.
 */
function relativeTime(iso: string): string {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return '';
  const diffSec = Math.max(0, Math.floor((Date.now() - then) / 1000));

  if (diffSec < 30) return 'a few secs ago';
  if (diffSec < 60) return `${diffSec}s ago`;
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin} min${diffMin === 1 ? '' : 's'} ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr} hr${diffHr === 1 ? '' : 's'} ago`;
  const diffDay = Math.floor(diffHr / 24);
  if (diffDay < 7) return `${diffDay} day${diffDay === 1 ? '' : 's'} ago`;
  return new Date(iso).toLocaleDateString();
}

// ============================================================================
// COMPONENT
// ============================================================================

interface LiveActivityProps {
  isFullView?: boolean;
  onSeeAll?: () => void;
  onBack?: () => void;
}

const LiveActivity: React.FC<LiveActivityProps> = ({
  isFullView = false,
  onSeeAll,
  onBack,
}) => {
  const [activities, setActivities] = useState<DisplayActivity[]>([]);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [errored, setErrored] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        // Pull a wider page in the full view so "See all" is meaningful;
        // otherwise just enough to fill the panel.
        const limit = isFullView ? 50 : 10;
        const res = await getAuditLogs({ page: 1, limit });
        if (cancelled) return;
        if (res?.success && res.data) {
          const mapped = (res.data.logs || []).map(mapAuditLog);
          setActivities(mapped);
          setHasMore(Boolean(res.data.pagination?.hasMore));
          setErrored(false);
        } else {
          setErrored(true);
        }
      } catch {
        if (!cancelled) setErrored(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [isFullView]);

  const displayedActivities = isFullView ? activities : activities.slice(0, 5);

  return (
    <div className='bg-white rounded-xl shadow-sm h-full'>
      {/* Header */}
      <div className='flex items-center justify-between p-4 border-b border-gray-100'>
        <div className='flex items-center gap-3'>
          {isFullView && onBack && (
            <button
              onClick={onBack}
              className='text-gray-600 hover:text-gray-900 transition-colors'
            >
              <ArrowLeft className='w-5 h-5' />
            </button>
          )}
          <h2 className='text-lg font-semibold text-gray-900'>
            {isFullView ? 'All Activities' : 'Live activity'}
          </h2>
        </div>

        {!isFullView &&
          onSeeAll &&
          !loading &&
          (activities.length > 5 || hasMore) && (
            <button
              onClick={onSeeAll}
              className='text-sm text-blue-600 cursor-pointer hover:text-blue-700 font-medium'
            >
              See all
            </button>
          )}
      </div>

      {/* Activity List */}
      <div
        className={`p-4 space-y-3 overflow-y-auto no-scrollbar ${
          isFullView ? 'max-h-[calc(100vh-200px)]' : 'max-h-[400px]'
        }`}
      >
        {loading ? (
          // Skeleton rows match the row layout below for zero layout shift.
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className='flex items-start gap-3 p-2'>
              <Skeleton className='w-8 h-8 rounded-lg flex-shrink-0' />
              <div className='flex-1 space-y-2'>
                <Skeleton className='h-4 w-3/4' />
                <Skeleton className='h-3 w-1/2' />
              </div>
              <Skeleton className='h-3 w-16' />
            </div>
          ))
        ) : errored ? (
          <div className='text-center py-8'>
            <p className='text-sm text-gray-500'>
              Couldn&apos;t load recent activity. Try refreshing.
            </p>
          </div>
        ) : displayedActivities.length === 0 ? (
          <div className='text-center py-8'>
            <p className='text-sm text-gray-500'>No recent activities</p>
          </div>
        ) : (
          displayedActivities.map((activity) => {
            const activityType =
              ACTIVITY_TYPES[activity.type] ?? ACTIVITY_TYPES['system-update'];
            const IconComponent = activityType.defaultIcon;

            return (
              <div
                key={activity.id}
                className='flex items-start gap-3 group hover:bg-gray-50 rounded-lg p-2 transition-colors cursor-pointer'
              >
                {/* Icon with background */}
                <div
                  className={`${activityType.defaultBg} rounded-lg p-2 flex-shrink-0`}
                >
                  <IconComponent
                    className={`w-4 h-4 ${activityType.defaultColor}`}
                  />
                </div>

                {/* Content */}
                <div className='flex-1 min-w-0'>
                  <div className='flex items-start justify-between gap-2'>
                    <div className='flex-1'>
                      <h4 className='text-sm font-medium text-gray-900 line-clamp-1 capitalize'>
                        {activity.title}
                      </h4>
                      {activity.subtitle && (
                        <p className='text-xs text-gray-500 line-clamp-1 mt-0.5'>
                          {activity.subtitle}
                        </p>
                      )}
                    </div>
                    <p className='text-xs text-gray-400 flex-shrink-0 whitespace-nowrap'>
                      {relativeTime(activity.timestamp)}
                    </p>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default LiveActivity;
