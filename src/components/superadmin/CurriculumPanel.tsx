'use client';

/**
 * Curriculum — what a grade studies, and what it does besides.
 *
 * Lives inside the Timetable section as a tab, because a curriculum is the
 * list a timetable is built from. It used to be its own sidebar entry, which
 * put two halves of the same job in two places.
 *
 * READ-ONLY BY DEFAULT
 * Pick a grade and you see what's assigned to it — nothing at all until you
 * assign something, and Basic 1 tells you nothing about Basic 2. `Edit` is
 * what reveals the pickers and the remove buttons. The first version of this
 * screen was a permanent checklist of all 21 subjects that saved wholesale;
 * that reads as "untick the ones you don't want" rather than "assign the ones
 * you do", and it stops scaling the moment the catalogue grows.
 *
 * TWO LISTS, ONE MODEL
 * Subjects carry core/elective. Activities don't — they're optional by
 * definition, so there is no toggle on them to set wrongly. Both are Subject
 * documents distinguished by `kind`; see the backend model for why.
 */

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Archive,
  Check,
  Loader2,
  Pencil,
  Plus,
  Save,
  X,
} from 'lucide-react';
import { GRADE_LEVELS } from '@/Constants/classes';
import {
  archiveSubject,
  createSubject,
  getCurriculum,
  getSubjects,
  idOf,
  saveCurriculum,
  updateSubject,
  type Requirement,
  type Subject,
  type SubjectKind,
} from '@/lib/api/curriculum.service';
import { getApiErrorMessage } from '@/lib/api/client';
import { Skeleton } from '@/components/ui/skeleton';
import ColourPicker from '@/components/shared/ColourPicker';
import ImpactWarningDialog from '@/components/superadmin/ImpactWarningDialog';
import { SUBJECT_COLOURS, nameOfColour } from '@/Constants/subjectColours';

type Pane = 'assign' | 'catalogue';

/**
 * Which colours are spoken for, as hex -> subject name.
 *
 * Only ACTIVE subjects hold a colour: archiving frees it, and the backend's
 * unique index is scoped the same way. Built here rather than fetched so the
 * grid updates the moment a subject is added or archived.
 */
const takenColours = (catalogue: Subject[]): Record<string, string> =>
  Object.fromEntries(
    catalogue
      .filter((s) => s.isActive)
      .map((s) => [s.colour.toLowerCase(), s.name])
  );

/** The first colour nobody is using, so the form opens on something valid. */
const firstFreeColour = (catalogue: Subject[]): string => {
  const taken = takenColours(catalogue);
  return SUBJECT_COLOURS.find((c) => !taken[c.hex.toLowerCase()])?.hex ?? '';
};

const CurriculumPanel: React.FC = () => {
  const [pane, setPane] = useState<Pane>('assign');

  const [catalogue, setCatalogue] = useState<Subject[]>([]);
  const [loadingCatalogue, setLoadingCatalogue] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const loadCatalogue = useCallback(async () => {
    setLoadingCatalogue(true);
    try {
      const res = await getSubjects({ includeArchived: true });
      if (res?.success && res.data) setCatalogue(res.data.subjects || []);
      else setError(res?.message || 'Could not load the catalogue.');
    } catch (err) {
      setError(getApiErrorMessage(err, 'Could not load the catalogue.'));
    } finally {
      setLoadingCatalogue(false);
    }
  }, []);

  useEffect(() => {
    loadCatalogue();
  }, [loadCatalogue]);

  const active = useMemo(
    () => catalogue.filter((s) => s.isActive),
    [catalogue]
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        {(
          [
            ['assign', 'Assign to a class'],
            ['catalogue', 'Subjects & activities'],
          ] as Array<[Pane, string]>
        ).map(([key, label]) => (
          <button
            key={key}
            onClick={() => {
              setPane(key);
              setError('');
              setNotice('');
            }}
            className={`text-sm px-3 py-2 rounded-lg border transition-colors ${
              pane === key
                ? 'border-primary-green bg-primary-green text-white'
                : 'border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-2.5">
          {error}
        </div>
      )}
      {notice && (
        <div className="bg-green-50 border border-green-200 text-green-800 text-sm rounded-lg px-4 py-2.5">
          {notice}
        </div>
      )}

      {pane === 'assign' ? (
        <AssignPane
          catalogue={active}
          loadingCatalogue={loadingCatalogue}
          setError={setError}
          setNotice={setNotice}
        />
      ) : (
        <CataloguePane
          catalogue={catalogue}
          loading={loadingCatalogue}
          onChanged={loadCatalogue}
          setError={setError}
          setNotice={setNotice}
        />
      )}
    </div>
  );
};

// ============================================================================
// ASSIGN TO A CLASS
// ============================================================================

const AssignPane: React.FC<{
  catalogue: Subject[];
  loadingCatalogue: boolean;
  setError: (v: string) => void;
  setNotice: (v: string) => void;
}> = ({ catalogue, loadingCatalogue, setError, setNotice }) => {
  const [grade, setGrade] = useState<string>(GRADE_LEVELS[0]);
  /** Pending removal, held until the impact warning is confirmed. */
  const [confirming, setConfirming] = useState<{
    id: string;
    name: string;
    kind: 'subject' | 'activity';
  } | null>(null);

  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  /** subjectId -> requirement, for academic subjects only. */
  const [subjects, setSubjects] = useState<Record<string, Requirement>>({});
  /** Plain set of activity ids. */
  const [activities, setActivities] = useState<string[]>([]);

  const subjectPool = useMemo(
    () => catalogue.filter((s) => s.kind === 'subject'),
    [catalogue]
  );
  const activityPool = useMemo(
    () => catalogue.filter((s) => s.kind === 'activity'),
    [catalogue]
  );
  const byId = useMemo(
    () => new Map(catalogue.map((s) => [s._id, s])),
    [catalogue]
  );

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getCurriculum(grade);
      if (res?.success && res.data) {
        const next: Record<string, Requirement> = {};
        for (const entry of res.data.curriculum.subjects || []) {
          const id = idOf(entry.subject);
          if (id) next[id] = entry.requirement;
        }
        setSubjects(next);
        setActivities(
          (res.data.curriculum.activities || []).map(idOf).filter(Boolean)
        );
      } else {
        setError(res?.message || 'Could not load that class.');
      }
    } catch (err) {
      setError(getApiErrorMessage(err, 'Could not load that class.'));
    } finally {
      setLoading(false);
    }
  }, [grade, setError]);

  // Reloading on every grade/session change is what makes Basic 2 look empty
  // when only Basic 1 has been set up — the state is never carried across.
  useEffect(() => {
    setEditing(false);
    load();
  }, [load]);

  const save = async () => {
    setSaving(true);
    setError('');
    setNotice('');
    try {
      const res = await saveCurriculum({
        grade,
        subjects: Object.entries(subjects).map(([subject, requirement]) => ({
          subject,
          requirement,
        })),
        activities,
      });
      if (res?.success) {
        setNotice(res.message || 'Saved.');
        setEditing(false);
        await load();
      } else {
        setError(res?.message || 'Could not save.');
      }
    } catch (err) {
      setError(getApiErrorMessage(err, 'Could not save.'));
    } finally {
      setSaving(false);
    }
  };

  const assignedSubjects = Object.keys(subjects)
    .map((id) => byId.get(id))
    .filter((s): s is Subject => Boolean(s));
  const assignedActivities = activities
    .map((id) => byId.get(id))
    .filter((s): s is Subject => Boolean(s));

  const empty =
    assignedSubjects.length === 0 && assignedActivities.length === 0;

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl border border-gray-100 p-4 flex flex-wrap items-end gap-3">
        <label className="block">
          <span className="text-xs text-gray-500 mb-1 block">Class</span>
          <select
            value={grade}
            onChange={(e) => setGrade(e.target.value)}
            className={input}
          >
            {GRADE_LEVELS.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
        </label>
        <div className="flex-1" />

        {editing ? (
          <>
            <button
              onClick={save}
              disabled={saving}
              className="flex items-center gap-1.5 text-sm px-3 py-2.5 rounded-lg bg-primary-green text-white hover:bg-primary-green-hover disabled:opacity-50"
            >
              {saving ? (
                <Loader2 size={15} className="animate-spin" />
              ) : (
                <Save size={15} />
              )}
              {saving ? 'Saving…' : 'Done'}
            </button>
            <button
              onClick={() => {
                // Discard by re-reading — the local edits are never the source
                // of truth, so cancelling is just a reload.
                setEditing(false);
                load();
              }}
              disabled={saving}
              className="flex items-center gap-1.5 text-sm px-3 py-2.5 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              <X size={15} /> Cancel
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => setEditing(true)}
              className="flex items-center gap-1.5 text-sm px-3 py-2.5 rounded-lg bg-primary-green text-white hover:bg-primary-green-hover"
            >
              <Pencil size={15} /> Edit
            </button>
          </>
        )}
      </div>

      {loading || loadingCatalogue ? (
        <div className="bg-white rounded-xl border border-gray-100 p-4 space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-6 w-full" />
          ))}
        </div>
      ) : empty && !editing ? (
        <div className="bg-white rounded-xl border border-gray-100 p-8 text-center">
          <p className="text-sm text-gray-600">
            Nothing assigned to <span className="font-medium">{grade}</span>{' '}
            yet.
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Click Edit to choose its subjects and activities. Each class is set
            up separately.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <AssignList
            title="Subjects"
            assigned={assignedSubjects}
            pool={subjectPool}
            editing={editing}
            emptyHint="No subjects yet."
            requirementOf={(id) => subjects[id]}
            onSetRequirement={(id, r) =>
              setSubjects((s) => ({ ...s, [id]: r }))
            }
            onAdd={(id) => setSubjects((s) => ({ ...s, [id]: 'core' }))}
            /* Removal goes through the impact warning — adding one is
               harmless, taking one away is what reaches into records. */
            onRemove={(id) =>
              setConfirming({
                id,
                name: byId.get(id)?.name ?? 'this subject',
                kind: 'subject',
              })
            }
          />
          <AssignList
            title="Activities"
            assigned={assignedActivities}
            pool={activityPool}
            editing={editing}
            emptyHint="No activities yet — things like Coloring or Reading."
            onAdd={(id) => setActivities((a) => [...a, id])}
            onRemove={(id) =>
              setConfirming({
                id,
                name: byId.get(id)?.name ?? 'this activity',
                kind: 'activity',
              })
            }
          />
        </div>
      )}

      {confirming && (
        <ImpactWarningDialog
          subjectId={confirming.id}
          subjectName={confirming.name}
          grade={grade}
          title={`Remove ${confirming.name} from ${grade}?`}
          action="Remove"
          detail={`New ${grade} students will no longer be given ${confirming.name}. Nothing already recorded is deleted.`}
          onCancel={() => setConfirming(null)}
          onConfirm={() => {
            // Removes it from the DRAFT only — the change reaches the server
            // when Done is pressed, same as every other edit here.
            if (confirming.kind === 'subject') {
              setSubjects((s) => {
                const next = { ...s };
                delete next[confirming.id];
                return next;
              });
            } else {
              setActivities((a) => a.filter((x) => x !== confirming.id));
            }
            setConfirming(null);
          }}
        />
      )}
    </div>
  );
};

/**
 * One assigned list. Shared by Subjects and Activities — the only difference is
 * whether `requirementOf` is supplied, which is what draws the core/elective
 * toggle. Passing it for activities would be the bug this shape prevents.
 */
const AssignList: React.FC<{
  title: string;
  assigned: Subject[];
  pool: Subject[];
  editing: boolean;
  emptyHint: string;
  requirementOf?: (id: string) => Requirement | undefined;
  onSetRequirement?: (id: string, r: Requirement) => void;
  onAdd: (id: string) => void;
  onRemove: (id: string) => void;
}> = ({
  title,
  assigned,
  pool,
  editing,
  emptyHint,
  requirementOf,
  onSetRequirement,
  onAdd,
  onRemove,
}) => {
  const [picking, setPicking] = useState('');
  const assignedIds = new Set(assigned.map((s) => s._id));
  const available = pool.filter((s) => !assignedIds.has(s._id));

  return (
    <section className="bg-white rounded-xl border border-gray-100">
      <header className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-900">{title}</h3>
        <span className="text-xs text-gray-400">{assigned.length}</span>
      </header>

      <div className="divide-y divide-gray-100">
        {assigned.length === 0 ? (
          <p className="px-4 py-6 text-sm text-gray-400">{emptyHint}</p>
        ) : (
          assigned.map((s) => {
            const requirement = requirementOf?.(s._id);
            return (
              <div key={s._id} className="flex items-center gap-3 px-4 py-2.5">
                <span
                  className="w-3 h-3 rounded-full shrink-0"
                  style={{ backgroundColor: s.colour }}
                  aria-hidden="true"
                />
                <span className="text-sm text-gray-900 flex-1 min-w-0 truncate">
                  {s.name}
                </span>

                {requirementOf &&
                  (editing ? (
                    <div className="flex rounded-lg border border-gray-200 overflow-hidden">
                      {(['core', 'elective'] as Requirement[]).map((r) => (
                        <button
                          key={r}
                          onClick={() => onSetRequirement?.(s._id, r)}
                          className={`text-xs px-2.5 py-1 capitalize transition-colors ${
                            requirement === r
                              ? 'bg-gray-900 text-white'
                              : 'text-gray-600 hover:bg-gray-50'
                          }`}
                        >
                          {r}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full ${
                        requirement === 'core'
                          ? 'bg-gray-900 text-white'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {requirement}
                    </span>
                  ))}

                {editing && (
                  <button
                    onClick={() => onRemove(s._id)}
                    title={`Remove ${s.name}`}
                    className="text-gray-400 hover:text-red-600 p-1"
                  >
                    <X size={15} />
                  </button>
                )}
              </div>
            );
          })
        )}
      </div>

      {editing && (
        <div className="px-4 py-3 border-t border-gray-100 flex items-center gap-2">
          <select
            value={picking}
            onChange={(e) => setPicking(e.target.value)}
            className={`${input} flex-1`}
          >
            <option value="">
              {available.length ? `Add ${title.toLowerCase()}…` : 'Nothing left to add'}
            </option>
            {available.map((s) => (
              <option key={s._id} value={s._id}>
                {s.name}
              </option>
            ))}
          </select>
          <button
            onClick={() => {
              if (!picking) return;
              onAdd(picking);
              // Reset so the same entry can't be added twice by a double click
              // — the pool filter would hide it, but the select would still be
              // holding its id.
              setPicking('');
            }}
            disabled={!picking}
            className="flex items-center gap-1.5 text-sm px-3 py-2.5 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 disabled:opacity-40"
          >
            <Plus size={15} /> Add
          </button>
        </div>
      )}
    </section>
  );
};

// ============================================================================
// CATALOGUE
// ============================================================================

const CataloguePane: React.FC<{
  catalogue: Subject[];
  loading: boolean;
  onChanged: () => Promise<void> | void;
  setError: (v: string) => void;
  setNotice: (v: string) => void;
}> = ({ catalogue, loading, onChanged, setError, setNotice }) => {
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [colour, setColour] = useState('');
  const [kind, setKind] = useState<SubjectKind>('subject');
  const [creating, setCreating] = useState(false);
  const [busyId, setBusyId] = useState('');
  /** Which row has its colour grid open. */
  const [recolouring, setRecolouring] = useState('');
  /** Pending archive, held until the impact warning is confirmed. */
  const [archiving, setArchiving] = useState<Subject | null>(null);

  const taken = takenColours(catalogue);

  // Open on a free colour, and move off one that gets taken while the form is
  // sitting there — otherwise the first submit is refused for a colour the
  // admin never consciously chose.
  useEffect(() => {
    if (!colour || taken[colour.toLowerCase()]) {
      setColour(firstFreeColour(catalogue));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [catalogue]);

  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setNotice('');
    if (!name.trim()) {
      setError('A name is required.');
      return;
    }
    if (!colour) {
      setError('Every colour is in use. Archive something first.');
      return;
    }
    setCreating(true);
    try {
      const res = await createSubject({
        name: name.trim(),
        code: code.trim() || undefined,
        colour,
        kind,
      });
      if (res?.success) {
        setName('');
        setCode('');
        setColour(firstFreeColour(catalogue));
        setNotice(kind === 'activity' ? 'Activity added.' : 'Subject added.');
        await onChanged();
      } else {
        setError(res?.message || 'Could not add that.');
      }
    } catch (err) {
      setError(getApiErrorMessage(err, 'Could not add that.'));
    } finally {
      setCreating(false);
    }
  };

  const recolour = async (s: Subject, next: string) => {
    setBusyId(s._id);
    try {
      const res = await updateSubject(s._id, { colour: next });
      if (res?.success) await onChanged();
      else setError(res?.message || 'Could not save that colour.');
    } catch (err) {
      setError(getApiErrorMessage(err, 'Could not save that colour.'));
    } finally {
      setBusyId('');
    }
  };

  const toggleArchive = async (s: Subject) => {
    setError('');
    setNotice('');
    setBusyId(s._id);
    try {
      const res = s.isActive
        ? await archiveSubject(s._id)
        : // Restoring puts a subject back in the pickers — nothing is lost, so
          // it needs no warning.
          await updateSubject(s._id, { isActive: true });
      if (res?.success) {
        setNotice(res.message || (s.isActive ? 'Archived.' : 'Restored.'));
        await onChanged();
      } else {
        setError(res?.message || 'Could not change that.');
      }
    } catch (err) {
      setError(getApiErrorMessage(err, 'Could not change that.'));
    } finally {
      setBusyId('');
    }
  };

  const groups: Array<[SubjectKind, string]> = [
    ['subject', 'Subjects'],
    ['activity', 'Activities'],
  ];

  return (
    <div className="space-y-4">
      <form
        onSubmit={add}
        className="bg-white rounded-xl border border-gray-100 p-4 flex flex-wrap items-end gap-3"
      >
        <label className="block">
          <span className="text-xs text-gray-500 mb-1 block">Type</span>
          <select
            value={kind}
            onChange={(e) => setKind(e.target.value as SubjectKind)}
            className={input}
          >
            <option value="subject">Subject</option>
            <option value="activity">Activity</option>
          </select>
        </label>
        <label className="block flex-1 min-w-[180px]">
          <span className="text-xs text-gray-500 mb-1 block">Name</span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={
              kind === 'activity' ? 'e.g. Coloring' : 'e.g. Further Mathematics'
            }
            className={input}
          />
        </label>
        <label className="block w-24">
          <span className="text-xs text-gray-500 mb-1 block">Code</span>
          <input
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="FMT"
            className={input}
          />
        </label>
        <button
          type="submit"
          disabled={creating}
          className="flex items-center gap-1.5 text-sm px-3 py-2.5 rounded-lg bg-primary-green text-white hover:bg-primary-green-hover disabled:opacity-50"
        >
          {creating ? (
            <Loader2 size={15} className="animate-spin" />
          ) : (
            <Plus size={15} />
          )}
          Add
        </button>

        <div className="w-full">
          <span className="text-xs text-gray-500 mb-2 block">Colour</span>
          <ColourPicker value={colour} onChange={setColour} taken={taken} />
        </div>
      </form>

      {groups.map(([groupKind, label]) => {
        const rows = catalogue.filter((s) => s.kind === groupKind);
        return (
          <section
            key={groupKind}
            className="bg-white rounded-xl border border-gray-100"
          >
            <header className="px-4 py-3 border-b border-gray-100">
              <h3 className="text-sm font-medium text-gray-900">
                {label}{' '}
                <span className="text-gray-400 font-normal">
                  ({rows.filter((r) => r.isActive).length})
                </span>
              </h3>
            </header>
            <div className="divide-y divide-gray-100">
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="p-3">
                    <Skeleton className="h-6 w-full" />
                  </div>
                ))
              ) : rows.length === 0 ? (
                <p className="px-4 py-6 text-sm text-gray-400">
                  None yet.
                  {groupKind === 'subject' && (
                    <>
                      {' '}
                      Run{' '}
                      <code className="text-xs bg-gray-100 px-1 py-0.5 rounded">
                        scripts/setup/seed-subjects.js
                      </code>{' '}
                      to load the standard list.
                    </>
                  )}
                </p>
              ) : (
                rows.map((s) => (
                  <div
                    key={s._id}
                    className={`flex items-center gap-3 px-4 py-2.5 ${
                      s.isActive ? '' : 'opacity-50'
                    }`}
                  >
                    <button
                      type="button"
                      disabled={busyId === s._id || !s.isActive}
                      onClick={() =>
                        setRecolouring(recolouring === s._id ? '' : s._id)
                      }
                      title={`${nameOfColour(s.colour)} — click to change`}
                      className="h-7 w-7 rounded ring-1 ring-black/10 shrink-0 disabled:cursor-not-allowed"
                      style={{ backgroundColor: s.colour }}
                    />
                    <span className="text-sm text-gray-900 flex-1 min-w-0 truncate">
                      {s.name}
                      {s.code && (
                        <span className="text-gray-400 text-xs ml-2">
                          {s.code}
                        </span>
                      )}
                      {!s.isActive && (
                        <span className="text-xs ml-2 text-gray-500">
                          (archived)
                        </span>
                      )}
                    </span>
                    <button
                      onClick={() =>
                        s.isActive ? setArchiving(s) : toggleArchive(s)
                      }
                      disabled={busyId === s._id}
                      className="text-xs px-2.5 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50 flex items-center gap-1"
                    >
                      {busyId === s._id ? (
                        <Loader2 size={13} className="animate-spin" />
                      ) : (
                        <Archive size={13} />
                      )}
                      {s.isActive ? 'Archive' : 'Restore'}
                    </button>
                  </div>
                ))
              )}
            </div>

            {rows.some((r) => r._id === recolouring) && (
              <div className="px-4 py-3 border-t border-gray-100 bg-gray-50">
                <p className="text-xs text-gray-500 mb-2">
                  New colour for{' '}
                  <span className="font-medium">
                    {rows.find((r) => r._id === recolouring)?.name}
                  </span>
                </p>
                <ColourPicker
                  value={rows.find((r) => r._id === recolouring)?.colour ?? ''}
                  allow={rows.find((r) => r._id === recolouring)?.colour}
                  taken={takenColours(catalogue)}
                  onChange={(hex) => {
                    const row = rows.find((r) => r._id === recolouring);
                    if (row) recolour(row, hex);
                    setRecolouring('');
                  }}
                />
              </div>
            )}
          </section>
        );
      })}

      {archiving && (
        <ImpactWarningDialog
          subjectId={archiving._id}
          subjectName={archiving.name}
          title={`Archive ${archiving.name}?`}
          action="Archive"
          detail={`It disappears from every class's pickers and from new timetables. Nothing already recorded is deleted — past papers, results and timetables keep naming it, and you can restore it at any time.`}
          onCancel={() => setArchiving(null)}
          onConfirm={async () => {
            await toggleArchive(archiving);
            setArchiving(null);
          }}
        />
      )}
    </div>
  );
};

const input =
  'w-full text-sm border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500';

export default CurriculumPanel;
