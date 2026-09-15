'use client';

/**
 * /apply — the entire public surface behind "Apply for admission".
 *
 * Six tabs in one route rather than six pages: a parent deciding whether to
 * apply wants the fees and the book list in the same breath as the form, and
 * bouncing them between URLs to find out what a term costs loses them.
 *
 * The one piece of real flow control here is the payment round trip. The
 * applicant leaves for Paystack and comes back to `/apply?ref=TRA-26-0041`,
 * so on mount we look for that parameter and verify before showing anything
 * else — otherwise they'd land on a blank form and assume they'd lost the lot.
 */

import React, { Suspense, useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  ClipboardList,
  FileText,
  Loader2,
  Mail,
  MapPin,
  MessageSquare,
  Phone,
  Receipt,
  Search,
  Wallet,
} from 'lucide-react';
import { GRADE_LEVELS } from '@/Constants/classes';
import { NIGERIAN_STATES, getLGAsForState } from '@/Constants/NigeriaStates';
import { getApiErrorMessage } from '@/lib/api/client';
import TremadLoader from '@/components/shared/TremadLoader';
import {
  getPublicSettings,
  getPublicContent,
  submitApplication,
  submitContactMessage,
  trackApplication,
  verifyApplicationPayment,
  type ApplicationInput,
  type ApplicationStatusResult,
  type ContentDoc,
  type ContentKind,
  type PublicSettings,
} from '@/lib/api/public.service';

type Tab = 'apply' | 'track' | 'books' | 'scheme' | 'bills' | 'contact';

const TABS: Array<{ id: Tab; label: string; icon: React.ReactNode }> = [
  { id: 'apply', label: 'Apply', icon: <ClipboardList size={15} /> },
  { id: 'track', label: 'Track application', icon: <Search size={15} /> },
  { id: 'books', label: 'Book list', icon: <BookOpen size={15} /> },
  { id: 'scheme', label: 'Scheme of work', icon: <FileText size={15} /> },
  { id: 'bills', label: 'School fees', icon: <Receipt size={15} /> },
  { id: 'contact', label: 'Contact us', icon: <MessageSquare size={15} /> },
];

const naira = (n: number | null | undefined) =>
  n === null || n === undefined
    ? '—'
    : `₦${Number(n).toLocaleString('en-NG', { maximumFractionDigits: 2 })}`;

// ============================================================================

function ApplyPageInner() {
  const searchParams = useSearchParams();
  const returningRef = searchParams.get('ref');

  const [tab, setTab] = useState<Tab>('apply');
  const [settings, setSettings] = useState<PublicSettings | null>(null);

  // Payment round-trip state. `verifying` blocks the whole page: showing a
  // form underneath a "confirming your payment" banner invites a double submit.
  const [verifying, setVerifying] = useState(!!returningRef);
  const [verified, setVerified] = useState<{
    reference: string;
    paid: boolean;
    message: string;
  } | null>(null);

  useEffect(() => {
    getPublicSettings()
      .then((res) => {
        if (res?.success && res.data) setSettings(res.data);
      })
      .catch(() => {
        /* the page still works without settings; the fee just shows as — */
      });
  }, []);

  useEffect(() => {
    if (!returningRef) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await verifyApplicationPayment(returningRef);
        if (cancelled) return;
        setVerified({
          reference: returningRef,
          paid: !!res?.data?.paid,
          message:
            res?.message ||
            (res?.data?.paid
              ? 'Payment confirmed.'
              : 'We could not confirm that payment yet.'),
        });
      } catch (err) {
        if (!cancelled) {
          setVerified({
            reference: returningRef,
            paid: false,
            message: getApiErrorMessage(
              err,
              'We could not confirm that payment. Use "Track application" with your reference.'
            ),
          });
        }
      } finally {
        if (!cancelled) setVerifying(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [returningRef]);

  if (verifying) {
    // Not deferred: they've just come back from the gateway and the screen
    // would otherwise be blank while we check. This is the one wait where an
    // immediate loader is reassuring rather than noisy.
    return (
      <TremadLoader message="Confirming your payment. Please don't close this page." />
    );
  }

  if (verified) {
    return (
      <Shell>
        <div className="bg-white rounded-2xl p-8 sm:p-12 text-center shadow-sm">
          {verified.paid ? (
            <>
              <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 size={28} className="text-green-700" />
              </div>
              <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-2">
                Application submitted
              </h1>
              <p className="text-gray-600 mb-6">{verified.message}</p>
            </>
          ) : (
            <>
              <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-2">
                Payment not confirmed
              </h1>
              <p className="text-gray-600 mb-6">{verified.message}</p>
            </>
          )}

          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 inline-block mb-6">
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
              Your reference
            </p>
            <p className="text-lg font-mono font-semibold text-gray-900">
              {verified.reference}
            </p>
          </div>

          <p className="text-sm text-gray-500 mb-6">
            Keep this reference — it&apos;s how you check your status.
          </p>

          <button
            onClick={() => {
              setVerified(null);
              setTab('track');
            }}
            className="bg-primary-green text-white px-6 py-3 rounded-lg font-medium hover:bg-primary-green-hover"
          >
            Track my application
          </button>
        </div>
      </Shell>
    );
  }

  return (
    <Shell>
      {/* Tabs */}
      <div className="flex gap-1 overflow-x-auto bg-white rounded-xl p-1.5 mb-5 shadow-sm">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-1.5 text-sm px-3.5 py-2 rounded-lg whitespace-nowrap transition-colors ${
              tab === t.id
                ? 'bg-primary-green text-white font-medium'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            {t.icon}
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'apply' && <ApplyForm settings={settings} />}
      {tab === 'track' && <TrackApplication />}
      {tab === 'books' && <ContentTab kind="books" />}
      {tab === 'scheme' && <ContentTab kind="scheme" />}
      {tab === 'bills' && <ContentTab kind="bills" />}
      {tab === 'contact' && <ContactForm settings={settings} />}
    </Shell>
  );
}

// ============================================================================

const Shell = ({ children }: { children: React.ReactNode }) => (
  <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
    <div className="flex items-center justify-between gap-4 mb-6">
      <Link
        href="/"
        className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
      >
        <ArrowLeft size={16} /> Back to homepage
      </Link>
      <div className="flex items-center gap-2">
        <Image src="/icon/logo.svg" alt="Tremad Schools" width={32} height={32} />
        <span className="font-medium text-sm sm:text-base text-gray-900">
          TREMAD SCHOOLS
        </span>
      </div>
    </div>
    {children}
  </div>
);

// ============================================================================
// APPLY
// ============================================================================

const EMPTY_APPLICATION = {
  firstName: '',
  lastName: '',
  dateOfBirth: '',
  gender: '',
  classApplyingFor: '',
  previousSchool: '',
  guardianName: '',
  guardianRelationship: '',
  guardianPhone: '',
  guardianEmail: '',
  address: '',
  city: '',
  state: '',
  preferredContact: 'call' as const,
  notes: '',
};

const ApplyForm = ({ settings }: { settings: PublicSettings | null }) => {
  const [form, setForm] = useState({ ...EMPTY_APPLICATION });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const set = (key: keyof typeof form, value: string) => {
    setForm((f) => ({ ...f, [key]: value }));
    if (error) setError('');
  };

  // A state change invalidates the chosen LGA — it belongs to the old state.
  const setState = (state: string) =>
    setForm((f) => ({ ...f, state, city: '' }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (
      !form.firstName.trim() ||
      !form.lastName.trim() ||
      !form.classApplyingFor ||
      !form.guardianName.trim() ||
      !form.guardianPhone.trim() ||
      !form.guardianEmail.trim()
    ) {
      setError('Please fill in every field marked with *.');
      return;
    }

    setSubmitting(true);
    try {
      const payload: ApplicationInput = {
        ...form,
        gender: form.gender || undefined,
        dateOfBirth: form.dateOfBirth || undefined,
      };
      const res = await submitApplication(payload);

      if (res?.success && res.data?.authorizationUrl) {
        // Leave for the gateway. We come back to /apply?ref=… and verify there.
        window.location.href = res.data.authorizationUrl;
        return;
      }
      setError(res?.message || 'Could not start your application.');
    } catch (err) {
      setError(getApiErrorMessage(err, 'Could not start your application.'));
    } finally {
      setSubmitting(false);
    }
  };

  const feeLine = settings
    ? `A non-refundable form fee of ${naira(settings.formFee)} is payable before your application is submitted.`
    : 'A non-refundable form fee is payable before your application is submitted.';

  return (
    <form onSubmit={submit} className="bg-white rounded-2xl p-5 sm:p-8 shadow-sm">
      <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-1">
        Apply for admission
      </h1>
      <p className="text-sm text-gray-500 mb-5">{feeLine}</p>

      {settings && !settings.paymentAvailable && (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 text-sm rounded-lg px-4 py-3 mb-5">
          Online payment isn&apos;t available at the moment. Please contact the
          school on {settings.contact.phone || 'the number on our homepage'} to
          apply.
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3 mb-5">
          {error}
        </div>
      )}

      <Section title="Applicant">
        <Grid>
          <Field label="First name *">
            <input value={form.firstName} onChange={(e) => set('firstName', e.target.value)} className={input} />
          </Field>
          <Field label="Last name *">
            <input value={form.lastName} onChange={(e) => set('lastName', e.target.value)} className={input} />
          </Field>
          <Field label="Date of birth">
            <input type="date" value={form.dateOfBirth} onChange={(e) => set('dateOfBirth', e.target.value)} className={input} />
          </Field>
          <Field label="Gender">
            <select value={form.gender} onChange={(e) => set('gender', e.target.value)} className={input}>
              <option value="">Select</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
          </Field>
          <Field label="Class applying for *">
            <select value={form.classApplyingFor} onChange={(e) => set('classApplyingFor', e.target.value)} className={input}>
              <option value="">Select a class</option>
              {GRADE_LEVELS.map((g) => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          </Field>
          <Field label="Previous school">
            <input value={form.previousSchool} onChange={(e) => set('previousSchool', e.target.value)} placeholder="If any" className={input} />
          </Field>
        </Grid>
      </Section>

      <Section title="Parent or guardian">
        <Grid>
          <Field label="Full name *">
            <input value={form.guardianName} onChange={(e) => set('guardianName', e.target.value)} className={input} />
          </Field>
          <Field label="Relationship">
            <select value={form.guardianRelationship} onChange={(e) => set('guardianRelationship', e.target.value)} className={input}>
              <option value="">Select</option>
              {['Father', 'Mother', 'Guardian', 'Grandparent', 'Sibling', 'Other'].map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </Field>
          <Field label="Phone number *">
            <input value={form.guardianPhone} onChange={(e) => set('guardianPhone', e.target.value)} className={input} />
          </Field>
          <Field label="Email *">
            <input type="email" value={form.guardianEmail} onChange={(e) => set('guardianEmail', e.target.value)} className={input} />
          </Field>
          <Field label="State">
            <select value={form.state} onChange={(e) => setState(e.target.value)} className={input}>
              <option value="">Select a state</option>
              {NIGERIAN_STATES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </Field>
          <Field label="Local government">
            <select value={form.city} onChange={(e) => set('city', e.target.value)} className={input} disabled={!form.state}>
              <option value="">{form.state ? 'Select an LGA' : 'Pick a state first'}</option>
              {getLGAsForState(form.state).map((l) => (
                <option key={l} value={l}>{l}</option>
              ))}
            </select>
          </Field>
        </Grid>
        <Field label="Home address">
          <input value={form.address} onChange={(e) => set('address', e.target.value)} className={input} />
        </Field>
      </Section>

      <Section title="How should we reach you?">
        <div className="flex flex-wrap gap-2 mb-4">
          {(
            [
              { id: 'call', label: 'Phone call', icon: <Phone size={14} /> },
              { id: 'email', label: 'Email', icon: <Mail size={14} /> },
              { id: 'visit', label: 'School visit', icon: <MapPin size={14} /> },
            ] as const
          ).map((o) => (
            <button
              key={o.id}
              type="button"
              onClick={() => set('preferredContact', o.id)}
              className={`flex items-center gap-1.5 text-sm px-3.5 py-2 rounded-lg border transition-colors ${
                form.preferredContact === o.id
                  ? 'bg-primary-green text-white border-primary-green'
                  : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
              }`}
            >
              {o.icon} {o.label}
            </button>
          ))}
        </div>
        <Field label="Anything else we should know?">
          <textarea value={form.notes} onChange={(e) => set('notes', e.target.value)} rows={3} className={input} />
        </Field>
      </Section>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-5 border-t border-gray-100">
        <p className="text-xs text-gray-500 flex items-center gap-1.5">
          <Wallet size={14} />
          You&apos;ll be taken to a secure payment page to pay{' '}
          {settings ? naira(settings.formFee) : 'the form fee'}.
        </p>
        <button
          type="submit"
          disabled={submitting || (settings ? !settings.paymentAvailable : false)}
          className="bg-primary-green text-white px-6 py-3 rounded-lg font-medium hover:bg-primary-green-hover disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {submitting && <Loader2 size={16} className="animate-spin" />}
          {submitting ? 'Starting payment…' : 'Pay & submit application'}
        </button>
      </div>
    </form>
  );
};

// ============================================================================
// TRACK
// ============================================================================

const STATUS_COPY: Record<string, { label: string; tone: string; blurb: string }> = {
  payment_pending: {
    label: 'Payment pending',
    tone: 'bg-amber-50 text-amber-800 border-amber-200',
    blurb: "We've saved your form but haven't received the fee yet.",
  },
  submitted: {
    label: 'Submitted',
    tone: 'bg-blue-50 text-blue-800 border-blue-200',
    blurb: "We've received your application and it's in the queue.",
  },
  under_review: {
    label: 'Under review',
    tone: 'bg-blue-50 text-blue-800 border-blue-200',
    blurb: 'Our admissions team is reviewing your application.',
  },
  invited: {
    label: 'Invited',
    tone: 'bg-purple-50 text-purple-800 border-purple-200',
    blurb: "You've been invited in — check your email or phone for details.",
  },
  offered: {
    label: 'Offered a place',
    tone: 'bg-green-50 text-green-800 border-green-200',
    blurb: 'Congratulations — a place has been offered. The school will be in touch.',
  },
  declined: {
    label: 'Not successful',
    tone: 'bg-gray-100 text-gray-700 border-gray-200',
    blurb: 'Unfortunately we could not offer a place this time.',
  },
  withdrawn: {
    label: 'Withdrawn',
    tone: 'bg-gray-100 text-gray-700 border-gray-200',
    blurb: 'This application was withdrawn.',
  },
};

const TrackApplication = () => {
  const [reference, setReference] = useState('');
  const [result, setResult] = useState<ApplicationStatusResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const look = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setResult(null);
    if (!reference.trim()) {
      setError('Enter your reference number.');
      return;
    }
    setLoading(true);
    try {
      const res = await trackApplication(reference.trim());
      if (res?.success && res.data) setResult(res.data);
      else setError(res?.message || 'No application found with that reference.');
    } catch (err) {
      setError(getApiErrorMessage(err, 'No application found with that reference.'));
    } finally {
      setLoading(false);
    }
  };

  const copy = result ? STATUS_COPY[result.status] : null;

  return (
    <div className="bg-white rounded-2xl p-5 sm:p-8 shadow-sm">
      <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-1">
        Track your application
      </h1>
      <p className="text-sm text-gray-500 mb-5">
        Enter the reference we gave you, e.g. TRA-26-0041.
      </p>

      <form onSubmit={look} className="flex flex-col sm:flex-row gap-2 mb-5">
        <input
          value={reference}
          onChange={(e) => setReference(e.target.value.toUpperCase())}
          placeholder="TRA-26-0041"
          className={`${input} font-mono sm:max-w-xs`}
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-primary-green text-white px-5 py-2.5 rounded-lg font-medium hover:bg-primary-green-hover disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
          Check status
        </button>
      </form>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
          {error}
        </div>
      )}

      {result && copy && (
        <div className="border border-gray-200 rounded-xl p-5">
          <div className="flex flex-wrap items-center gap-3 mb-3">
            <span className={`text-sm font-medium px-3 py-1 rounded-full border ${copy.tone}`}>
              {copy.label}
            </span>
            <span className="font-mono text-sm text-gray-500">{result.reference}</span>
          </div>
          <p className="text-gray-700 mb-4">{copy.blurb}</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
            <Detail label="Applicant" value={result.firstName} />
            <Detail label="Class" value={result.classApplyingFor} />
            <Detail
              label="Submitted"
              value={
                result.submittedAt
                  ? new Date(result.submittedAt).toLocaleDateString('en-GB')
                  : 'Not yet'
              }
            />
          </div>
        </div>
      )}
    </div>
  );
};

// ============================================================================
// CONTENT (books / scheme / bills)
// ============================================================================

const KIND_COPY: Record<
  ContentKind,
  { title: string; blurb: string; empty: string; columns: [string, string, string] }
> = {
  books: {
    title: 'Book list',
    blurb: 'Required and recommended texts for each class.',
    empty: "The book list for this class hasn't been published yet.",
    columns: ['Book', 'Author', 'Price'],
  },
  scheme: {
    title: 'Scheme of work',
    blurb: 'What each class covers, subject by subject.',
    empty: "The scheme of work for this class hasn't been published yet.",
    columns: ['Subject', 'Term', 'Topics'],
  },
  bills: {
    title: 'School fees',
    blurb: 'Fees payable per class. Fresh and returning students differ.',
    empty: "Fees for this class haven't been published yet.",
    columns: ['Item', 'When', 'Amount'],
  },
};

const ContentTab = ({ kind }: { kind: ContentKind }) => {
  const [className, setClassName] = useState<string>(GRADE_LEVELS[0]);
  const [studentType, setStudentType] = useState<'fresh' | 'returning'>('fresh');
  const [docs, setDocs] = useState<ContentDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const copy = KIND_COPY[kind];

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getPublicContent(kind, {
        className,
        ...(kind === 'bills' ? { studentType } : {}),
      });
      if (res?.success && res.data) setDocs(res.data.content || []);
      else setError(res?.message || 'Could not load this page.');
    } catch (err) {
      setError(getApiErrorMessage(err, 'Could not load this page.'));
    } finally {
      setLoading(false);
    }
  }, [kind, className, studentType]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="bg-white rounded-2xl p-5 sm:p-8 shadow-sm">
      <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-1">
        {copy.title}
      </h1>
      <p className="text-sm text-gray-500 mb-5">{copy.blurb}</p>

      <div className="flex flex-wrap gap-3 mb-5">
        <label className="block">
          <span className="text-xs text-gray-500 mb-1 block">Class</span>
          <select
            value={className}
            onChange={(e) => setClassName(e.target.value)}
            className={`${input} sm:w-48`}
          >
            {GRADE_LEVELS.map((g) => (
              <option key={g} value={g}>{g}</option>
            ))}
          </select>
        </label>

        {kind === 'bills' && (
          <label className="block">
            <span className="text-xs text-gray-500 mb-1 block">Student type</span>
            <select
              value={studentType}
              onChange={(e) => setStudentType(e.target.value as 'fresh' | 'returning')}
              className={`${input} sm:w-48`}
            >
              <option value="fresh">Fresh student</option>
              <option value="returning">Returning student</option>
            </select>
          </label>
        )}
      </div>

      {loading ? (
        <div className="space-y-2">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-11 bg-gray-100 rounded-lg animate-pulse" />
          ))}
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
          {error}
        </div>
      ) : docs.length === 0 ? (
        <div className="text-center py-12 text-gray-400">{copy.empty}</div>
      ) : (
        <div className="space-y-6">
          {docs.map((doc) => (
            <div key={doc._id}>
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                <p className="font-medium text-gray-900">
                  {doc.className}
                  <span className="text-gray-400 font-normal"> · {doc.academicYear}</span>
                  {kind === 'bills' && doc.studentType !== 'all' && (
                    <span className="text-gray-400 font-normal">
                      {' '}· {doc.studentType === 'fresh' ? 'Fresh' : 'Returning'}
                    </span>
                  )}
                </p>
                {kind !== 'scheme' && doc.total > 0 && (
                  <p className="text-sm font-semibold text-gray-900">
                    Total: {naira(doc.total)}
                  </p>
                )}
              </div>

              {doc.note && (
                <p className="text-sm text-gray-500 bg-gray-50 rounded-lg px-3 py-2 mb-2">
                  {doc.note}
                </p>
              )}

              <div className="overflow-x-auto border border-gray-100 rounded-xl">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-gray-500 border-b border-gray-100 bg-gray-50">
                      <th className="px-4 py-2.5 font-medium">{copy.columns[0]}</th>
                      <th className="px-4 py-2.5 font-medium">{copy.columns[1]}</th>
                      <th className="px-4 py-2.5 font-medium text-right">{copy.columns[2]}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {doc.items.map((item) => (
                      <tr key={item._id} className="border-b border-gray-50 last:border-0">
                        <td className="px-4 py-2.5 text-gray-900">
                          {item.title}
                          {item.optional && (
                            <span className="ml-2 text-xs text-gray-400">(optional)</span>
                          )}
                        </td>
                        <td className="px-4 py-2.5 text-gray-600">
                          {kind === 'books'
                            ? item.subtitle || '—'
                            : item.term || '—'}
                        </td>
                        <td className="px-4 py-2.5 text-right text-gray-900">
                          {kind === 'scheme'
                            ? item.note || '—'
                            : naira(item.amount)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ============================================================================
// CONTACT
// ============================================================================

const ContactForm = ({ settings }: { settings: PublicSettings | null }) => {
  const [form, setForm] = useState({
    kind: 'enquiry' as 'enquiry' | 'complaint' | 'feedback',
    name: '',
    email: '',
    phone: '',
    preferredContact: 'email' as 'visit' | 'call' | 'email',
    subject: '',
    message: '',
    relatedStudentName: '',
  });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState('');
  const [error, setError] = useState('');

  const set = (key: keyof typeof form, value: string) => {
    setForm((f) => ({ ...f, [key]: value }));
    if (error) setError('');
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      setError('Name, email and message are required.');
      return;
    }
    setSending(true);
    try {
      const res = await submitContactMessage(form);
      if (res?.success) {
        setSent(res.message || 'Thank you — your message has been received.');
        setForm((f) => ({ ...f, subject: '', message: '', relatedStudentName: '' }));
      } else {
        setError(res?.message || 'Could not send your message.');
      }
    } catch (err) {
      setError(getApiErrorMessage(err, 'Could not send your message.'));
    } finally {
      setSending(false);
    }
  };

  const c = settings?.contact;
  const socials = [
    { label: 'WhatsApp', value: c?.whatsapp },
    { label: 'Instagram', value: c?.instagram },
    { label: 'Facebook', value: c?.facebook },
    { label: 'X / Twitter', value: c?.twitter },
  ].filter((s) => s.value);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
      <div className="lg:col-span-2 bg-white rounded-2xl p-5 sm:p-8 shadow-sm">
        <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-1">
          Contact us
        </h1>
        <p className="text-sm text-gray-500 mb-5">
          Ask a question, raise a complaint, or tell us how we&apos;re doing.
        </p>

        {sent && (
          <div className="bg-green-50 border border-green-200 text-green-800 text-sm rounded-lg px-4 py-3 mb-5">
            {sent}
          </div>
        )}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3 mb-5">
            {error}
          </div>
        )}

        <form onSubmit={submit} className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {(['enquiry', 'complaint', 'feedback'] as const).map((k) => (
              <button
                key={k}
                type="button"
                onClick={() => set('kind', k)}
                className={`text-sm px-3.5 py-2 rounded-lg border capitalize transition-colors ${
                  form.kind === k
                    ? 'bg-primary-green text-white border-primary-green'
                    : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                }`}
              >
                {k}
              </button>
            ))}
          </div>

          <Grid>
            <Field label="Your name *">
              <input value={form.name} onChange={(e) => set('name', e.target.value)} className={input} />
            </Field>
            <Field label="Email *">
              <input type="email" value={form.email} onChange={(e) => set('email', e.target.value)} className={input} />
            </Field>
            <Field label="Phone">
              <input value={form.phone} onChange={(e) => set('phone', e.target.value)} className={input} />
            </Field>
            <Field label="Preferred reply">
              <select
                value={form.preferredContact}
                onChange={(e) => set('preferredContact', e.target.value)}
                className={input}
              >
                <option value="email">Email</option>
                <option value="call">Phone call</option>
                <option value="visit">School visit</option>
              </select>
            </Field>
          </Grid>

          {form.kind === 'complaint' && (
            <Field label="Student this concerns">
              <input
                value={form.relatedStudentName}
                onChange={(e) => set('relatedStudentName', e.target.value)}
                placeholder="Your child's name, if relevant"
                className={input}
              />
            </Field>
          )}

          <Field label="Subject">
            <input value={form.subject} onChange={(e) => set('subject', e.target.value)} className={input} />
          </Field>
          <Field label="Message *">
            <textarea value={form.message} onChange={(e) => set('message', e.target.value)} rows={5} className={input} />
          </Field>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={sending}
              className="bg-primary-green text-white px-6 py-2.5 rounded-lg font-medium hover:bg-primary-green-hover disabled:opacity-50 flex items-center gap-2"
            >
              {sending && <Loader2 size={16} className="animate-spin" />}
              {sending ? 'Sending…' : 'Send message'}
            </button>
          </div>
        </form>
      </div>

      <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm h-fit">
        <h2 className="font-semibold text-gray-900 mb-4">Reach us directly</h2>
        <div className="space-y-3 text-sm">
          {c?.phone && (
            <a href={`tel:${c.phone}`} className="flex items-center gap-2.5 text-gray-700 hover:text-green-700">
              <Phone size={15} className="text-gray-400 shrink-0" /> {c.phone}
            </a>
          )}
          {c?.email && (
            <a href={`mailto:${c.email}`} className="flex items-center gap-2.5 text-gray-700 hover:text-green-700 break-all">
              <Mail size={15} className="text-gray-400 shrink-0" /> {c.email}
            </a>
          )}
          {c?.address && (
            <p className="flex items-start gap-2.5 text-gray-700">
              <MapPin size={15} className="text-gray-400 shrink-0 mt-0.5" /> {c.address}
            </p>
          )}
          {!c?.phone && !c?.email && !c?.address && (
            <p className="text-gray-400">
              Contact details haven&apos;t been published yet.
            </p>
          )}
        </div>

        {socials.length > 0 && (
          <>
            <h3 className="font-medium text-gray-900 mt-5 mb-2 text-sm">Follow us</h3>
            <div className="flex flex-col gap-2 text-sm">
              {socials.map((s) => (
                <a
                  key={s.label}
                  href={s.value as string}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-green-700 hover:underline"
                >
                  {s.label}
                </a>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

// ============================================================================
// SHARED BITS
// ============================================================================

const input =
  'w-full text-sm border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500 disabled:bg-gray-50 disabled:text-gray-400';

const Grid = ({ children }: { children: React.ReactNode }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">{children}</div>
);

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <label className="block">
    <span className="text-xs text-gray-500 mb-1 block">{label}</span>
    {children}
  </label>
);

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="mb-6">
    <h2 className="text-sm font-semibold text-gray-900 mb-3 pb-2 border-b border-gray-100">
      {title}
    </h2>
    <div className="space-y-4">{children}</div>
  </div>
);

const Detail = ({ label, value }: { label: string; value?: string | null }) => (
  <div>
    <p className="text-xs text-gray-500">{label}</p>
    <p className="text-gray-900 mt-0.5">{value || '—'}</p>
  </div>
);

/**
 * useSearchParams needs a Suspense boundary, otherwise the whole route opts
 * out of static rendering and Next warns at build time.
 */
export default function ApplyPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-5xl mx-auto px-4 py-20 text-center text-gray-400">
          Loading…
        </div>
      }
    >
      <ApplyPageInner />
    </Suspense>
  );
}
