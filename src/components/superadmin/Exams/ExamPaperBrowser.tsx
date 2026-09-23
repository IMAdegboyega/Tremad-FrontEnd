'use client';

/**
 * Exam papers, browsed as Year > Class > Subject > Term > papers.
 *
 * ONE recursive view, not four screens. The path is held as four optional
 * values and handed straight to the server, which infers the depth from which
 * of them arrived — so going deeper is appending a value and going back is
 * dropping one. Breadcrumbs are the path itself.
 *
 * Shared by the admin and staff portals; `as` only decides which routes it
 * calls. The scoping is entirely server-side — this component never filters,
 * because a client-side filter is a suggestion, not a permission.
 *
 * WHY THERE ARE NO "NEW FOLDER" CONTROLS
 * There are no folders. Each level is a distinct value of a field on the
 * papers, so a folder can't be created empty, renamed into a duplicate, or
 * deleted out from under its contents. Uploading a paper to SS 1 > Physics is
 * what brings that folder into being.
 */

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  ChevronRight,
  Download,
  FileText,
  FolderOpen,
  Loader2,
  Move,
  Trash2,
  Upload,
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import {
  browseExamPapers,
  deleteExamPaper,
  type BrowseEntry,
  type BrowseLevel,
  type ExamPaper,
} from '@/lib/api/examPaper.service';
import { getApiErrorMessage } from '@/lib/api/client';
import UploadPaperDialog from './UploadPaperDialog';
import MovePaperDialog from './MovePaperDialog';

interface Path {
  academicYear?: string;
  grade?: string;
  subject?: string;
  term?: string;
}

/** Human labels for each crumb, kept beside the path so we don't refetch to name it. */
interface Crumb {
  key: keyof Path;
  value: string;
  label: string;
}

const ExamPaperBrowser: React.FC<{ as?: 'admin' | 'staff' }> = ({
  as = 'admin',
}) => {
  const [path, setPath] = useState<Path>({});
  const [crumbs, setCrumbs] = useState<Crumb[]>([]);
  const [level, setLevel] = useState<BrowseLevel>('year');
  const [entries, setEntries] = useState<BrowseEntry[]>([]);
  const [papers, setPapers] = useState<ExamPaper[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [uploadOpen, setUploadOpen] = useState(false);
  const [moving, setMoving] = useState<ExamPaper | null>(null);
  const [busyId, setBusyId] = useState('');
  /** Set when a class has no curriculum for this session — see the empty state. */
  /** Set when a class has no curriculum at all — see the empty state. */
  const [gap, setGap] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await browseExamPapers(path, as);
      if (res?.success && res.data) {
        setLevel(res.data.level);
        setEntries(res.data.entries || []);
        setPapers(res.data.papers || []);
        setGap(Boolean(res.data.curriculumMissing));
      } else {
        setError(res?.message || 'Could not open that.');
      }
    } catch (err) {
      setError(getApiErrorMessage(err, 'Could not open that.'));
    } finally {
      setLoading(false);
    }
  }, [path, as]);

  useEffect(() => {
    load();
  }, [load]);

  /** The field this level's entries set when opened. */
  const fieldForLevel: Record<BrowseLevel, keyof Path | null> = {
    year: 'academicYear',
    grade: 'grade',
    subject: 'subject',
    term: 'term',
    papers: null,
  };

  const open = (entry: BrowseEntry) => {
    const field = fieldForLevel[level];
    if (!field) return;
    setPath((p) => ({ ...p, [field]: entry.key }));
    setCrumbs((c) => [...c, { key: field, value: entry.key, label: entry.label }]);
  };

  /** Truncating the crumbs truncates the path — the two can't disagree. */
  const goTo = (index: number) => {
    const next = crumbs.slice(0, index);
    setCrumbs(next);
    setPath(
      next.reduce<Path>((acc, c) => ({ ...acc, [c.key]: c.value }), {})
    );
  };

  const remove = async (paper: ExamPaper) => {
    setBusyId(paper._id);
    setError('');
    try {
      const res = await deleteExamPaper(paper._id, as);
      if (res?.success) await load();
      else setError(res?.message || 'Could not delete that paper.');
    } catch (err) {
      setError(getApiErrorMessage(err, 'Could not delete that paper.'));
    } finally {
      setBusyId('');
    }
  };

  const canUpload = useMemo(
    // Everything a paper needs is known once you're inside a subject.
    () => Boolean(path.academicYear && path.grade && path.subject),
    [path]
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <nav className="flex items-center gap-1 text-sm min-w-0" aria-label="Breadcrumb">
          <button
            onClick={() => goTo(0)}
            className={`px-1.5 py-1 rounded hover:bg-gray-100 ${
              crumbs.length ? 'text-gray-500' : 'text-gray-900 font-medium'
            }`}
          >
            Exam papers
          </button>
          {crumbs.map((c, i) => (
            <React.Fragment key={`${c.key}-${c.value}`}>
              <ChevronRight size={14} className="text-gray-300 shrink-0" />
              <button
                onClick={() => goTo(i + 1)}
                className={`px-1.5 py-1 rounded hover:bg-gray-100 truncate max-w-[10rem] ${
                  i === crumbs.length - 1
                    ? 'text-gray-900 font-medium'
                    : 'text-gray-500'
                }`}
              >
                {c.label}
              </button>
            </React.Fragment>
          ))}
        </nav>

        {canUpload && (
          <button
            onClick={() => setUploadOpen(true)}
            className="flex items-center gap-1.5 text-sm px-3 py-2 rounded-lg bg-primary-green text-white hover:bg-primary-green-hover"
          >
            <Upload size={15} /> Upload paper
          </button>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-2.5">
          {error}
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-xl" />
          ))}
        </div>
      ) : level === 'papers' ? (
        <PaperList
          papers={papers}
          as={as}
          busyId={busyId}
          onMove={setMoving}
          onDelete={remove}
        />
      ) : entries.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 p-10 text-center">
          {/*
            The one dead end this design can produce: subject folders come from
            the class curriculum, so a session nobody has set up yet shows an
            empty class. Say that, and offer the fix here rather than sending
            the admin off to find the Curriculum tab.
          */}
          {gap ? (
            <>
              <p className="text-sm text-gray-600">
                {crumbs.find((c) => c.key === 'grade')?.label ?? 'This class'}{' '}
                has no curriculum set up.
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Subject folders come from the curriculum, so there&apos;s
                nothing to show until one exists. Set it up under Timetable
                &rarr; Curriculum — it applies to every session.
              </p>
            </>
          ) : (
            <>
              <p className="text-sm text-gray-500">Nothing here yet.</p>
              {as === 'staff' && level === 'grade' && (
                <p className="text-xs text-gray-400 mt-1">
                  You only see the classes you&apos;re assigned to.
                </p>
              )}
            </>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {entries.map((e) => (
            <button
              key={e.key}
              onClick={() => open(e)}
              className={`group text-left bg-white rounded-xl border p-4 transition-colors hover:border-green-300 ${
                // An empty folder is dimmed, not hidden. At subject level these
                // come from the class CURRICULUM, so "Physics — 0 papers" is
                // the school's missing paper, not an absent folder.
                e.count === 0 ? 'border-gray-100 opacity-60' : 'border-gray-100'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <FolderOpen
                  size={20}
                  className="shrink-0"
                  style={{ color: e.colour || '#9CA3AF' }}
                />
                {e.offCurriculum && (
                  <span
                    title="Papers are filed here but this subject isn't on the class curriculum — possibly misfiled."
                    className="text-amber-500"
                  >
                    <AlertTriangle size={14} />
                  </span>
                )}
              </div>
              <p className="mt-2 text-sm font-medium text-gray-900 truncate">
                {e.label}
              </p>
              <p className="text-xs text-gray-400">
                {e.count === 0
                  ? 'No papers'
                  : `${e.count} paper${e.count === 1 ? '' : 's'}`}
              </p>
            </button>
          ))}
        </div>
      )}

      {uploadOpen && path.academicYear && path.grade && path.subject && (
        <UploadPaperDialog
          as={as}
          academicYear={path.academicYear}
          grade={path.grade}
          subject={path.subject}
          /** Pre-selected when already inside a term. */
          term={path.term as 'First' | 'Second' | 'Third' | undefined}
          subjectLabel={
            crumbs.find((c) => c.key === 'subject')?.label ?? 'this subject'
          }
          onClose={() => setUploadOpen(false)}
          onUploaded={async () => {
            setUploadOpen(false);
            await load();
          }}
        />
      )}

      {moving && (
        <MovePaperDialog
          paper={moving}
          onClose={() => setMoving(null)}
          onMoved={async () => {
            setMoving(null);
            await load();
          }}
        />
      )}
    </div>
  );
};

const PaperList: React.FC<{
  papers: ExamPaper[];
  as: 'admin' | 'staff';
  busyId: string;
  onMove: (p: ExamPaper) => void;
  onDelete: (p: ExamPaper) => void;
}> = ({ papers, as, busyId, onMove, onDelete }) => {
  if (!papers.length) {
    return (
      <div className="bg-white rounded-xl border border-gray-100 p-10 text-center">
        <p className="text-sm text-gray-500">No papers for this term yet.</p>
        <p className="text-xs text-gray-400 mt-1">
          Use Upload paper to add one.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-100 divide-y divide-gray-100">
      {papers.map((p) => {
        const who = p.uploadedBy
          ? `${p.uploadedBy.firstName ?? ''} ${p.uploadedBy.lastName ?? ''}`.trim() ||
            p.uploadedBy.email
          : 'Unknown';
        return (
          <div key={p._id} className="flex items-center gap-3 p-3">
            <FileText size={18} className="text-gray-400 shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-gray-900 truncate">
                {p.title}
              </p>
              <p className="text-xs text-gray-400 truncate">
                {p.paperType} · {who} ·{' '}
                {new Date(p.createdAt).toLocaleDateString()}
                {p.movedAt ? ' · moved by an admin' : ''}
              </p>
            </div>
            <a
              href={p.file.url}
              target="_blank"
              rel="noopener noreferrer"
              title="Open"
              className="text-gray-400 hover:text-gray-700 p-1.5"
            >
              <Download size={15} />
            </a>
            {as === 'admin' && (
              <button
                onClick={() => onMove(p)}
                title="Move to another class, subject or term"
                className="text-gray-400 hover:text-blue-600 p-1.5"
              >
                <Move size={15} />
              </button>
            )}
            <button
              onClick={() => onDelete(p)}
              disabled={busyId === p._id}
              title="Delete"
              className="text-gray-400 hover:text-red-600 p-1.5 disabled:opacity-50"
            >
              {busyId === p._id ? (
                <Loader2 size={15} className="animate-spin" />
              ) : (
                <Trash2 size={15} />
              )}
            </button>
          </div>
        );
      })}
    </div>
  );
};

export default ExamPaperBrowser;
