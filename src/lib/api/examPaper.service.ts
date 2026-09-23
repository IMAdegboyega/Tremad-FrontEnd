/**
 * Exam Paper Service
 *
 * Browsed as Year > Class > Subject > Term, but there are no folder endpoints:
 * the tree is derived from fields on each paper, so ONE `browse` call serves
 * every level and the depth falls out of which arguments you pass.
 *
 * The same endpoints back both portals. A teacher's requests are scoped
 * server-side to their own classes and subjects — the client doesn't filter,
 * and shouldn't try to.
 */

import apiClient, { ApiResponse } from './client';
import { API } from './endpoints';

export type BrowseLevel = 'year' | 'grade' | 'subject' | 'term' | 'papers';
export type Term = 'First' | 'Second' | 'Third';
export type PaperType =
  | 'Mid-term'
  | 'Exam'
  | 'Mock'
  | 'Assignment'
  | 'Other';

/** One row at whatever level you're looking at. */
export interface BrowseEntry {
  /** What to pass back down to open it — a year, a grade, a subject id, a term. */
  key: string;
  label: string;
  /** Papers beneath this entry. Zero is meaningful, not a reason to hide it. */
  count: number;
  /** Subject level only. */
  colour?: string | null;
  /**
   * Subject level only: papers were filed here but the class curriculum
   * doesn't list this subject — usually a misfile worth an admin's attention.
   */
  offCurriculum?: boolean;
}

export interface ExamPaper {
  _id: string;
  academicYear: string;
  grade: string;
  subject: { _id: string; name: string; colour?: string } | string;
  term: Term;
  paperType: PaperType;
  title: string;
  file: {
    url: string;
    publicId?: string;
    mimeType?: string;
    sizeBytes?: number;
    originalName?: string;
  };
  uploadedBy?: {
    _id: string;
    firstName?: string;
    lastName?: string;
    email?: string;
  } | null;
  movedAt?: string | null;
  createdAt: string;
}

export interface BrowseResult {
  level: BrowseLevel;
  entries: BrowseEntry[];
  /** Only populated at the leaf level. */
  papers?: ExamPaper[];
  /**
   * Subject level only. True when this class has no curriculum for this
   * session — the subject folders are derived from the curriculum, so there is
   * genuinely nothing to show until one exists.
   */
  curriculumMissing?: boolean;
  /**
   * The most recent session that DOES have a curriculum for this class, so the
   * empty state can offer to copy it forward instead of being a dead end.
   */
  copyFrom?: string | null;
}

/**
 * Walk the tree. Pass what you know; the server infers how deep you are.
 *
 *   browse({})                                      -> years
 *   browse({ academicYear })                        -> classes
 *   browse({ academicYear, grade })                 -> subjects
 *   browse({ academicYear, grade, subject })        -> terms
 *   browse({ academicYear, grade, subject, term })  -> papers
 */
export const browseExamPapers = async (
  path: {
    academicYear?: string;
    grade?: string;
    subject?: string;
    term?: string;
  },
  /** 'staff' routes through the teacher portal's scoped copy. */
  as: 'admin' | 'staff' = 'admin'
): Promise<ApiResponse<BrowseResult>> => {
  const params = Object.fromEntries(
    Object.entries(path).filter(([, v]) => Boolean(v))
  ) as Record<string, string>;
  return apiClient.get(
    as === 'staff' ? API.TEACHER.EXAM_PAPERS.BROWSE : API.SUPER_ADMIN.EXAM_PAPERS.BROWSE,
    Object.keys(params).length ? params : undefined
  );
};

/**
 * Upload a paper.
 *
 * Multipart, and the field name must be `files` — that's what the existing
 * Cloudinary middleware listens for. The coordinates ride alongside the file
 * rather than being encoded in a path, because they're data, not a location.
 */
export const uploadExamPaper = async (
  file: File,
  meta: {
    academicYear: string;
    grade: string;
    subject: string;
    term: Term;
    paperType?: PaperType;
    title?: string;
  },
  as: 'admin' | 'staff' = 'admin'
): Promise<ApiResponse<{ paper: ExamPaper }>> => {
  const form = new FormData();
  form.append('files', file);
  Object.entries(meta).forEach(([k, v]) => {
    if (v) form.append(k, String(v));
  });
  return apiClient.upload(
    as === 'staff' ? API.TEACHER.EXAM_PAPERS.UPLOAD : API.SUPER_ADMIN.EXAM_PAPERS.UPLOAD,
    form
  );
};

/**
 * Move or retitle a paper. Admin only.
 *
 * Send only what changes. Because the hierarchy is fields rather than folders,
 * moving a misfiled paper is this one call — no reparenting, and nothing can
 * be orphaned by it.
 */
export const updateExamPaper = async (
  paperId: string,
  changes: Partial<{
    academicYear: string;
    grade: string;
    subject: string;
    term: Term;
    paperType: PaperType;
    title: string;
  }>
): Promise<ApiResponse<{ paper: ExamPaper }>> =>
  apiClient.patch(API.SUPER_ADMIN.EXAM_PAPERS.ONE(paperId), changes);

export const deleteExamPaper = async (
  paperId: string,
  as: 'admin' | 'staff' = 'admin'
): Promise<ApiResponse<null>> =>
  apiClient.delete(
    as === 'staff'
      ? API.TEACHER.EXAM_PAPERS.ONE(paperId)
      : API.SUPER_ADMIN.EXAM_PAPERS.ONE(paperId)
  );

/** The subject may arrive populated or as a bare id. */
export const subjectNameOf = (p: ExamPaper): string =>
  typeof p.subject === 'string' ? '' : p.subject.name;

const examPaperService = {
  browseExamPapers,
  uploadExamPaper,
  updateExamPaper,
  deleteExamPaper,
};

export default examPaperService;
