'use client';

/**
 * Admin → Admissions.
 *
 * Two inboxes behind one screen: applications from /apply, and contact
 * messages (enquiries, complaints, feedback). They're together because they
 * arrive from the same public page and the same person triages both.
 *
 * Applications stuck in `payment_pending` are HIDDEN by default. Those are
 * abandoned checkouts — someone opened the form and never paid — and letting
 * them sit at the top of the list would bury real applications under noise.
 * The toggle is there when you want to see them.
 */

import React, { useCallback, useEffect, useState } from 'react';
import {
  ChevronLeft,
  Inbox,
  Loader2,
  Mail,
  MapPin,
  MessageSquare,
  Phone,
  RefreshCw,
  Search,
  Users,
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { getApiErrorMessage } from '@/lib/api/client';
import {
  getApplications,
  getApplication,
  updateApplicationStatus,
  getContactMessages,
  updateContactMessage,
  type Application,
  type ApplicationStatus,
  type ContactMessage,
} from '@/lib/api/superAdmin.service';

type View = 'applications' | 'messages';

const STATUS_TONE: Record<string, string> = {
  payment_pending: 'bg-amber-50 text-amber-700 border-amber-200',
  submitted: 'bg-blue-50 text-blue-700 border-blue-200',
  under_review: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  invited: 'bg-purple-50 text-purple-700 border-purple-200',
  offered: 'bg-green-50 text-green-700 border-green-200',
  declined: 'bg-gray-100 text-gray-600 border-gray-200',
  withdrawn: 'bg-gray-100 text-gray-600 border-gray-200',
};

const STATUS_LABEL: Record<string, string> = {
  payment_pending: 'Payment pending',
  submitted: 'Submitted',
  under_review: 'Under review',
  invited: 'Invited',
  offered: 'Offered',
  declined: 'Declined',
  withdrawn: 'Withdrawn',
};

const ACTIONABLE: ApplicationStatus[] = [
  'submitted',
  'under_review',
  'invited',
  'offered',
  'declined',
  'withdrawn',
];

const naira = (n?: number | null) =>
  n === null || n === undefined ? '—' : `₦${Number(n).toLocaleString('en-NG')}`;

const when = (iso?: string | null) =>
  iso ? new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';

const Admissions: React.FC = () => {
  const [view, setView] = useState<View>('applications');
  return (
    <div className="min-h-screen bg-gray-50 space-y-3 p-2 sm:p-4 md:p-6">
      <header className="mb-4">
        <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">Admissions</h1>
        <p className="text-xs sm:text-sm text-gray-500 mt-1">
          Applications and messages from the public site
        </p>
      </header>

      <div className="flex gap-1 bg-gray-100 p-1 rounded-lg w-fit mb-4">
        <button
          onClick={() => setView('applications')}
          className={`flex items-center gap-1.5 text-sm px-3.5 py-2 rounded-md ${
            view === 'applications' ? 'bg-white text-gray-900 shadow-sm font-medium' : 'text-gray-500'
          }`}
        >
          <Users size={15} /> Applications
        </button>
        <button
          onClick={() => setView('messages')}
          className={`flex items-center gap-1.5 text-sm px-3.5 py-2 rounded-md ${
            view === 'messages' ? 'bg-white text-gray-900 shadow-sm font-medium' : 'text-gray-500'
          }`}
        >
          <MessageSquare size={15} /> Messages
        </button>
      </div>

      {view === 'applications' ? <ApplicationsInbox /> : <MessagesInbox />}
    </div>
  );
};

// ============================================================================
// APPLICATIONS
// ============================================================================

const ApplicationsInbox = () => {
  const [items, setItems] = useState<Application[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [status, setStatus] = useState('');
  const [search, setSearch] = useState('');
  const [debounced, setDebounced] = useState('');
  const [includeUnpaid, setIncludeUnpaid] = useState(false);

  const [selected, setSelected] = useState<Application | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(search.trim()), 350);
    return () => clearTimeout(t);
  }, [search]);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getApplications({
        status: status || undefined,
        search: debounced || undefined,
        includeUnpaid: includeUnpaid || undefined,
        limit: 50,
      });
      if (res?.success && res.data) {
        setItems(res.data.applications || []);
        setCounts(res.data.counts || {});
      } else {
        setError(res?.message || 'Could not load applications.');
      }
    } catch (err) {
      setError(getApiErrorMessage(err, 'Could not load applications.'));
    } finally {
      setLoading(false);
    }
  }, [status, debounced, includeUnpaid]);

  useEffect(() => {
    load();
  }, [load]);

  if (selected) {
    return (
      <ApplicationDetail
        application={selected}
        onBack={() => setSelected(null)}
        onChanged={() => {
          setSelected(null);
          load();
        }}
      />
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-100">
      <div className="p-3 sm:p-4 flex flex-col sm:flex-row gap-3 border-b border-gray-100">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Name, reference, phone or email…"
            className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/30"
          />
        </div>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="text-sm border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-green-500/30"
        >
          <option value="">All statuses</option>
          {ACTIONABLE.map((s) => (
            <option key={s} value={s}>
              {STATUS_LABEL[s]}{counts[s] ? ` (${counts[s]})` : ''}
            </option>
          ))}
        </select>
        <button
          onClick={load}
          disabled={loading}
          className="flex items-center justify-center gap-2 text-sm px-3 py-2.5 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50"
        >
          <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
          <span className="hidden sm:inline">Refresh</span>
        </button>
      </div>

      <label className="flex items-center gap-2 px-4 py-2.5 text-xs text-gray-500 border-b border-gray-50">
        <input
          type="checkbox"
          checked={includeUnpaid}
          onChange={(e) => setIncludeUnpaid(e.target.checked)}
          className="rounded border-gray-300"
        />
        Show unpaid / abandoned forms
        {counts.payment_pending ? ` (${counts.payment_pending})` : ''}
      </label>

      <div className="overflow-x-auto">
        <table className="w-full text-sm min-w-[720px]">
          <thead>
            <tr className="text-left text-gray-500 bg-gray-50 border-b border-gray-100">
              <th className="px-4 py-3 font-medium">Applicant</th>
              <th className="px-4 py-3 font-medium">Reference</th>
              <th className="px-4 py-3 font-medium">Class</th>
              <th className="px-4 py-3 font-medium">Guardian</th>
              <th className="px-4 py-3 font-medium">Received</th>
              <th className="px-4 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="border-b border-gray-50">
                  {Array.from({ length: 6 }).map((__, j) => (
                    <td key={j} className="px-4 py-3"><Skeleton className="h-4 w-24" /></td>
                  ))}
                </tr>
              ))
            ) : error ? (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center">
                  <p className="text-sm text-red-600 mb-3">{error}</p>
                  <button onClick={load} className="px-4 py-2 text-sm text-white bg-primary-green rounded-lg">
                    Try again
                  </button>
                </td>
              </tr>
            ) : items.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-14 text-center text-gray-400">
                  <Inbox size={28} className="mx-auto text-gray-300 mb-2" />
                  No applications yet.
                </td>
              </tr>
            ) : (
              items.map((a) => (
                <tr
                  key={a._id}
                  onClick={() => setSelected(a)}
                  className="border-b border-gray-50 hover:bg-gray-50 cursor-pointer"
                >
                  <td className="px-4 py-3 font-medium text-gray-900">
                    {`${a.firstName} ${a.lastName}`.trim()}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-gray-600">{a.reference}</td>
                  <td className="px-4 py-3 text-gray-600">{a.classApplyingFor}</td>
                  <td className="px-4 py-3 text-gray-600">
                    <p>{a.guardianName}</p>
                    <p className="text-xs text-gray-400">{a.guardianPhone}</p>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{when(a.submittedAt || a.createdAt)}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2.5 py-1 rounded-full border ${STATUS_TONE[a.status] || ''}`}>
                      {STATUS_LABEL[a.status] || a.status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const ApplicationDetail = ({
  application,
  onBack,
  onChanged,
}: {
  application: Application;
  onBack: () => void;
  onChanged: () => void;
}) => {
  const [full, setFull] = useState<Application>(application);
  const [status, setStatus] = useState<ApplicationStatus>(
    ACTIONABLE.includes(application.status) ? application.status : 'submitted'
  );
  const [note, setNote] = useState(application.reviewNote || '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // The list only carries summary fields; pull the rest for the detail view.
  useEffect(() => {
    getApplication(application._id)
      .then((res) => {
        if (res?.success && res.data?.application) setFull(res.data.application);
      })
      .catch(() => {
        /* the summary we already have is enough to work with */
      });
  }, [application._id]);

  const save = async () => {
    setSaving(true);
    setError('');
    try {
      const res = await updateApplicationStatus(full._id, { status, reviewNote: note });
      if (res?.success) onChanged();
      else setError(res?.message || 'Could not update the application.');
    } catch (err) {
      setError(getApiErrorMessage(err, 'Could not update the application.'));
    } finally {
      setSaving(false);
    }
  };

  const contactIcon =
    full.preferredContact === 'call' ? <Phone size={14} /> :
    full.preferredContact === 'visit' ? <MapPin size={14} /> : <Mail size={14} />;

  return (
    <div className="space-y-4">
      <button onClick={onBack} className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900">
        <ChevronLeft size={16} /> Back to applications
      </button>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-2.5">{error}</div>
      )}

      <div className="bg-white rounded-lg border border-gray-100 p-4 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3 mb-5">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              {`${full.firstName} ${full.lastName}`.trim()}
            </h2>
            <p className="text-sm text-gray-500 font-mono">{full.reference}</p>
          </div>
          <span className={`text-xs px-2.5 py-1 rounded-full border ${STATUS_TONE[full.status] || ''}`}>
            {STATUS_LABEL[full.status] || full.status}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
          <Row label="Class applying for" value={full.classApplyingFor} />
          <Row label="Date of birth" value={full.dateOfBirth ? when(full.dateOfBirth) : ''} />
          <Row label="Gender" value={full.gender} />
          <Row label="Previous school" value={full.previousSchool} />
          <Row label="Guardian" value={full.guardianName} />
          <Row label="Relationship" value={full.guardianRelationship} />
          <Row label="Phone" value={full.guardianPhone} />
          <Row label="Email" value={full.guardianEmail} />
          <Row label="Address" value={[full.address, full.city, full.state].filter(Boolean).join(', ')} />
        </div>

        <div className="mt-4 pt-4 border-t border-gray-100 flex flex-wrap gap-4 text-sm">
          <span className="flex items-center gap-1.5 text-gray-600">
            {contactIcon} Prefers{' '}
            {full.preferredContact === 'call' ? 'a phone call' : full.preferredContact === 'visit' ? 'a school visit' : 'email'}
          </span>
          <span className="text-gray-600">
            Form fee: {naira(full.payment?.amount)}{' '}
            <span className={full.payment?.status === 'paid' ? 'text-green-700' : 'text-amber-700'}>
              ({full.payment?.status || 'pending'})
            </span>
          </span>
        </div>

        {full.notes && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <p className="text-xs text-gray-500 mb-1">From the applicant</p>
            <p className="text-sm text-gray-800">{full.notes}</p>
          </div>
        )}
      </div>

      <div className="bg-white rounded-lg border border-gray-100 p-4 sm:p-6">
        <h3 className="font-semibold text-gray-900 mb-3">Decision</h3>
        <div className="flex flex-col sm:flex-row gap-3">
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as ApplicationStatus)}
            className="text-sm border border-gray-200 rounded-lg px-3 py-2.5 sm:w-52 focus:outline-none focus:ring-2 focus:ring-green-500/30"
          >
            {ACTIONABLE.map((s) => (
              <option key={s} value={s}>{STATUS_LABEL[s]}</option>
            ))}
          </select>
          <input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Internal note (never shown to the applicant)"
            className="flex-1 text-sm border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-green-500/30"
          />
          <button
            onClick={save}
            disabled={saving}
            className="bg-primary-green text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-primary-green-hover disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {saving && <Loader2 size={15} className="animate-spin" />}
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
        <p className="text-xs text-gray-400 mt-2">
          The applicant sees this status on the tracking page — but never the note.
        </p>
      </div>
    </div>
  );
};

// ============================================================================
// MESSAGES
// ============================================================================

const KIND_TONE: Record<string, string> = {
  enquiry: 'bg-blue-50 text-blue-700',
  complaint: 'bg-red-50 text-red-700',
  feedback: 'bg-green-50 text-green-700',
};

const MessagesInbox = () => {
  const [items, setItems] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [kind, setKind] = useState('');
  const [status, setStatus] = useState('');
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getContactMessages({
        kind: kind || undefined,
        status: status || undefined,
        limit: 50,
      });
      if (res?.success && res.data) setItems(res.data.messages || []);
      else setError(res?.message || 'Could not load messages.');
    } catch (err) {
      setError(getApiErrorMessage(err, 'Could not load messages.'));
    } finally {
      setLoading(false);
    }
  }, [kind, status]);

  useEffect(() => {
    load();
  }, [load]);

  const setMessageStatus = async (id: string, next: string) => {
    setBusyId(id);
    // Optimistic: reading a message shouldn't feel like a round trip.
    setItems((prev) =>
      prev.map((m) => (m._id === id ? { ...m, status: next as ContactMessage['status'] } : m))
    );
    try {
      await updateContactMessage(id, { status: next });
    } catch {
      load();
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="space-y-3">
      <div className="bg-white rounded-lg border border-gray-100 p-3 sm:p-4 flex flex-wrap gap-3">
        <select
          value={kind}
          onChange={(e) => setKind(e.target.value)}
          className="text-sm border border-gray-200 rounded-lg px-3 py-2.5"
        >
          <option value="">All types</option>
          <option value="enquiry">Enquiries</option>
          <option value="complaint">Complaints</option>
          <option value="feedback">Feedback</option>
        </select>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="text-sm border border-gray-200 rounded-lg px-3 py-2.5"
        >
          <option value="">All statuses</option>
          <option value="new">New</option>
          <option value="read">Read</option>
          <option value="responded">Responded</option>
          <option value="closed">Closed</option>
        </select>
        <button
          onClick={load}
          disabled={loading}
          className="flex items-center gap-2 text-sm px-3 py-2.5 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50"
        >
          <RefreshCw size={15} className={loading ? 'animate-spin' : ''} /> Refresh
        </button>
      </div>

      {loading ? (
        <div className="space-y-2">
          {[0, 1, 2].map((i) => <Skeleton key={i} className="h-24 rounded-lg" />)}
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">{error}</div>
      ) : items.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-100 py-14 text-center text-gray-400">
          <Inbox size={28} className="mx-auto text-gray-300 mb-2" />
          No messages yet.
        </div>
      ) : (
        items.map((m) => (
          <div
            key={m._id}
            className={`bg-white rounded-lg border p-4 ${
              m.status === 'new' ? 'border-green-200 bg-green-50/30' : 'border-gray-100'
            }`}
          >
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${KIND_TONE[m.kind] || 'bg-gray-100 text-gray-600'}`}>
                {m.kind}
              </span>
              {m.priority === 'high' && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-700">High</span>
              )}
              <span className="text-sm font-medium text-gray-900">{m.name}</span>
              <span className="text-xs text-gray-400">{when(m.createdAt)}</span>
            </div>

            {m.subject && <p className="text-sm font-medium text-gray-800 mb-1">{m.subject}</p>}
            <p className="text-sm text-gray-600 mb-3 whitespace-pre-wrap">{m.message}</p>

            {m.relatedStudentName && (
              <p className="text-xs text-gray-500 mb-3">Concerns: {m.relatedStudentName}</p>
            )}

            <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 pt-3 border-t border-gray-50">
              <a href={`mailto:${m.email}`} className="flex items-center gap-1.5 hover:text-green-700">
                <Mail size={13} /> {m.email}
              </a>
              {m.phone && (
                <a href={`tel:${m.phone}`} className="flex items-center gap-1.5 hover:text-green-700">
                  <Phone size={13} /> {m.phone}
                </a>
              )}
              <span className="ml-auto flex items-center gap-2">
                {busyId === m._id && <Loader2 size={13} className="animate-spin" />}
                <select
                  value={m.status}
                  onChange={(e) => setMessageStatus(m._id, e.target.value)}
                  className="text-xs border border-gray-200 rounded-md px-2 py-1"
                >
                  <option value="new">New</option>
                  <option value="read">Read</option>
                  <option value="responded">Responded</option>
                  <option value="closed">Closed</option>
                </select>
              </span>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

const Row = ({ label, value }: { label: string; value?: string | null }) => (
  <div>
    <p className="text-xs text-gray-500">{label}</p>
    <p className="text-gray-900 mt-0.5">{value || '—'}</p>
  </div>
);

export default Admissions;
