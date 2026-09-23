/**
 * Curriculum Service
 *
 * The subject catalogue and per-grade curricula.
 *
 * Note the response envelopes: every call here returns its payload nested under
 * a named key (`{ subjects }`, `{ subject }`, `{ curriculum, exists }`) rather
 * than flat. That's what the controller sends; assuming flat is how the staff
 * profile ended up greeting people by email address.
 */

import apiClient, { ApiResponse } from './client';
import { API } from './endpoints';

// ============================================================================
// TYPES
// ============================================================================

/**
 * Academic subject or non-academic activity — one type, distinguished by
 * `kind`. See the note on the backend model: they differ in one field, and a
 * second type would have meant a second of everything else.
 */
export type SubjectKind = 'subject' | 'activity';

export interface Subject {
  _id: string;
  name: string;
  code?: string;
  kind: SubjectKind;
  /** 6-digit hex. Drives the timetable colour everywhere this subject appears. */
  colour: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export type Requirement = 'core' | 'elective';

/**
 * One row of a curriculum.
 *
 * `subject` arrives populated from GET (so the editor can render a name and a
 * colour) but is sent back as a bare id string on SAVE. Hence the union — the
 * alternative is two near-identical types that drift.
 */
export interface CurriculumEntry {
  subject: Subject | string;
  requirement: Requirement;
}

export interface ClassCurriculum {
  _id?: string;
  grade: string;
  subjects: CurriculumEntry[];
  /**
   * Activities are a plain list, not entries — they carry no core/elective
   * status, so there is no requirement field on them to set wrongly. Populated
   * on GET, sent back as bare ids on SAVE, same as `subjects`.
   */
  activities: Array<Subject | string>;
  note: string;
  updatedAt?: string;
}

// ============================================================================
// SUBJECTS
// ============================================================================

/** Omit `kind` to get both subjects and activities. */
export const getSubjects = async (opts?: {
  includeArchived?: boolean;
  kind?: SubjectKind;
}): Promise<ApiResponse<{ subjects: Subject[] }>> => {
  const params: Record<string, string> = {};
  if (opts?.includeArchived) params.includeArchived = 'true';
  if (opts?.kind) params.kind = opts.kind;
  return apiClient.get(
    API.SUPER_ADMIN.SUBJECTS.LIST,
    Object.keys(params).length ? params : undefined
  );
};

export const createSubject = async (data: {
  name: string;
  code?: string;
  colour: string;
  kind?: SubjectKind;
}): Promise<ApiResponse<{ subject: Subject }>> =>
  apiClient.post(API.SUPER_ADMIN.SUBJECTS.CREATE, data);

export const updateSubject = async (
  subjectId: string,
  data: Partial<Pick<Subject, 'name' | 'code' | 'colour' | 'isActive'>>
): Promise<ApiResponse<{ subject: Subject }>> =>
  apiClient.put(API.SUPER_ADMIN.SUBJECTS.UPDATE(subjectId), data);

/** Archives. The subject stays on past timetables and results. */
export const archiveSubject = async (
  subjectId: string
): Promise<ApiResponse<{ subject: Subject; curriculaStillUsingIt: number }>> =>
  apiClient.delete(API.SUPER_ADMIN.SUBJECTS.ARCHIVE(subjectId));

// ============================================================================
// CURRICULUM
// ============================================================================

/**
 * One curriculum per grade, whatever the session — Basic 1 studies what Basic 1
 * studies. Always resolves to an object; `exists: false` distinguishes "not set
 * up yet" from "set up and empty", so the editor opens the same way either way.
 */
export const getCurriculum = async (
  grade: string
): Promise<ApiResponse<{ curriculum: ClassCurriculum; exists: boolean }>> =>
  apiClient.get(API.SUPER_ADMIN.CURRICULUM.GET, { grade });

export const saveCurriculum = async (data: {
  grade: string;
  /** Bare subject ids here, not the populated objects GET returns. */
  subjects: Array<{ subject: string; requirement: Requirement }>;
  /** Bare ids too. The backend rejects any that aren't kind: 'activity'. */
  activities: string[];
  note?: string;
}): Promise<ApiResponse<{ curriculum: ClassCurriculum }>> =>
  apiClient.put(API.SUPER_ADMIN.CURRICULUM.SAVE, data);

/**
 * What a destructive edit would touch. Fetched before showing the confirmation
 * so it can state real numbers rather than a vague "this may affect records".
 *
 * Omit `grade` for a catalogue-wide change (archiving or renaming a subject);
 * pass it when removing the subject from one class's curriculum.
 */
export interface CurriculumImpact {
  subject: string;
  grade: string | null;
  students: number;
  teachers: number;
  papers: number;
  periods: number;
  /** False means nothing is affected — the dialog can be a plain confirm. */
  any: boolean;
}

export const getCurriculumImpact = async (
  subject: string,
  grade?: string
): Promise<ApiResponse<{ impact: CurriculumImpact }>> =>
  apiClient.get(API.SUPER_ADMIN.CURRICULUM.IMPACT, {
    subject,
    ...(grade ? { grade } : {}),
  });

/**
 * Narrows the populated-or-id union at the point of use.
 *
 * Returns null for a bare id. Callers render nothing rather than a blank row —
 * a subject archived after the curriculum was saved comes back unpopulated,
 * and the editor shouldn't crash on it.
 */
export const subjectOf = (entry: CurriculumEntry): Subject | null =>
  typeof entry.subject === 'string' ? null : entry.subject;

/** Same, for the plain activity list. */
export const activityOf = (entry: Subject | string): Subject | null =>
  typeof entry === 'string' ? null : entry;

/** The id, whether the value arrived populated or bare. */
export const idOf = (value: Subject | string | undefined): string =>
  typeof value === 'string' ? value : (value?._id ?? '');

const curriculumService = {
  getSubjects,
  createSubject,
  updateSubject,
  archiveSubject,
  getCurriculum,
  getCurriculumImpact,
  saveCurriculum,
};

export default curriculumService;
