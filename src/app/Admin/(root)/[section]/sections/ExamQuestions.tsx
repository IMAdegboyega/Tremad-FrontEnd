'use client';

/**
 * ExamQuestions — wired to real data.
 *
 * Replaces the hardcoded examQuestions array with live fetches from the new
 * exam endpoints. Adds real file upload via Cloudinary (handled server-side
 * by examFileUploadMiddleware). Folder + file CRUD is fully functional.
 *
 * UI structure stays the same so ExamQuestionsGrid / ExamQuestionDetail
 * don't need to change — adapters bridge the API shapes to the legacy
 * ExamQuestion / ExamFile interfaces those components expect.
 */

import React, { useCallback, useEffect, useState } from 'react';
import ExamQuestionsGrid from '@/components/superadmin/Exams/ExamQuestionsGrid';
import ExamQuestionDetail from '@/components/superadmin/Exams/ExamQuestionDetail';
import CreateNewFolderModal from '@/components/modals/CreateNewFolderModal';
import CreateFolderModal from '@/components/modals/CreateFolderModal';
import DeleteFileModal from '@/components/modals/DeleteFileModal';
import RenameModal from '@/components/modals/RenameModal';
import {
  listExamFolders,
  listExamFiles,
  createExamFolder,
  updateExamFolder,
  deleteExamFolder,
  uploadExamFiles,
  renameExamFile,
  deleteExamFile,
  type ExamFolder as ApiExamFolder,
  type ExamFile as ApiExamFile,
  type ExamFileUploader,
} from '@/lib/api/superAdmin.service';
import { toTitleCase } from '@/lib/utils';

// ============================================================================
// COMPONENT-SHAPE TYPES (preserve the legacy contract that subcomponents use)
// ============================================================================

export interface ExamQuestion {
  id: string;
  subject: string;
  questionCount: number;
  duration: string;
  lastModified: string;
  files?: ExamFile[];
}

export interface ExamFile {
  id: string;
  fileName: string;
  fileType: 'PDF' | 'Google docs' | 'Word' | 'Excel';
  source: string;
  uploadedBy: string;
  uploadDate: string;
}

// ============================================================================
// HELPERS
// ============================================================================

const formatDate = (iso?: string) => {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

/** Concise "13 Nov, 24 08PM" style label matching the legacy mock format. */
const formatLastModified = (iso?: string) => {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
    year: '2-digit',
  }) + ' ' + d.toLocaleTimeString(undefined, {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
};

const uploaderName = (
  uploadedBy: ApiExamFile['uploadedBy']
): string => {
  if (!uploadedBy) return 'Unknown';
  if (typeof uploadedBy === 'string') return 'Unknown';
  const u = uploadedBy as ExamFileUploader;
  const name = `${toTitleCase(u.firstName ?? '')} ${toTitleCase(
    u.lastName ?? ''
  )}`.trim();
  return name || u.email || 'Unknown';
};

/** The legacy ExamFile.fileType enum doesn't include CSV/Other — fold those into Word. */
const coerceFileType = (
  t: ApiExamFile['fileType']
): ExamFile['fileType'] => {
  if (t === 'PDF') return 'PDF';
  if (t === 'Excel') return 'Excel';
  if (t === 'Word') return 'Word';
  // CSV / Other → render as a generic "Word"-style icon so the row still renders.
  return 'Word';
};

const toComponentFile = (f: ApiExamFile): ExamFile => ({
  id: f._id,
  fileName: f.fileName,
  fileType: coerceFileType(f.fileType),
  source: f.source,
  uploadedBy: uploaderName(f.uploadedBy),
  uploadDate: formatDate(f.createdAt),
});

const toComponentFolder = (
  folder: ApiExamFolder,
  files?: ApiExamFile[]
): ExamQuestion => ({
  id: folder._id,
  subject: folder.subject,
  // We don't track question-counts separately yet — show file count instead so
  // the grid card has a useful number to display.
  questionCount: folder.questionCount,
  duration: '—',
  lastModified: formatLastModified(folder.lastModified),
  files: files?.map(toComponentFile),
});

// ============================================================================
// COMPONENT
// ============================================================================

const ExamQuestions: React.FC = () => {
  // --- View state ---
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);

  // --- Data ---
  const [folders, setFolders] = useState<ApiExamFolder[]>([]);
  const [filesInDetail, setFilesInDetail] = useState<ApiExamFile[]>([]);
  const [detailFolder, setDetailFolder] = useState<ApiExamFolder | null>(null);
  const [foldersLoading, setFoldersLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [foldersError, setFoldersError] = useState('');

  // --- Modal state ---
  const [showCreateFolderModal, setShowCreateFolderModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadTarget, setUploadTarget] = useState<string | null>(null);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<
    { kind: 'folder' | 'file'; id: string; name: string } | null
  >(null);

  const [showRenameModal, setShowRenameModal] = useState(false);
  const [renameTarget, setRenameTarget] = useState<
    { kind: 'folder' | 'file'; id: string; name: string } | null
  >(null);

  // ----- Data fetchers -----
  const fetchFolders = useCallback(async () => {
    setFoldersLoading(true);
    setFoldersError('');
    try {
      const res = await listExamFolders();
      if (res?.success && res.data) {
        setFolders(res.data.folders || []);
      } else {
        setFoldersError(res?.message || 'Failed to load folders.');
      }
    } catch (err: any) {
      setFoldersError(err?.message || 'Network error. Please try again.');
    } finally {
      setFoldersLoading(false);
    }
  }, []);

  const fetchDetail = useCallback(async (folderId: string) => {
    setDetailLoading(true);
    try {
      const res = await listExamFiles(folderId);
      if (res?.success && res.data) {
        setDetailFolder(res.data.folder);
        setFilesInDetail(res.data.files || []);
      }
    } catch {
      // Soft-fail: detail view will show whatever was last loaded.
    } finally {
      setDetailLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFolders();
  }, [fetchFolders]);

  useEffect(() => {
    if (selectedFolderId) {
      fetchDetail(selectedFolderId);
    } else {
      setDetailFolder(null);
      setFilesInDetail([]);
    }
  }, [selectedFolderId, fetchDetail]);

  // ----- Mutations -----

  const handleCreateFolder = async (
    subject: string,
    description?: string
  ) => {
    const res = await createExamFolder(subject, description);
    if (!res?.success) {
      throw new Error(res?.message || 'Could not create folder');
    }
    await fetchFolders();
  };

  const handleUpload = async (files: File[]) => {
    if (!uploadTarget || files.length === 0) return;
    try {
      const res = await uploadExamFiles(uploadTarget, files);
      if (!res?.success) {
        console.warn('Upload failed:', res?.message);
        return;
      }
      // Refresh both views: folders (file counts changed) and detail (new rows).
      await fetchFolders();
      if (selectedFolderId === uploadTarget) {
        await fetchDetail(uploadTarget);
      }
    } finally {
      setUploadTarget(null);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      if (deleteTarget.kind === 'folder') {
        await deleteExamFolder(deleteTarget.id);
        // If the user was viewing the deleted folder, bail out to the grid.
        if (selectedFolderId === deleteTarget.id) {
          setSelectedFolderId(null);
        }
      } else {
        await deleteExamFile(deleteTarget.id);
      }
      await fetchFolders();
      if (selectedFolderId) await fetchDetail(selectedFolderId);
    } catch (err) {
      console.warn('Delete failed:', err);
    } finally {
      setDeleteTarget(null);
    }
  };

  const handleConfirmRename = async (newName: string) => {
    if (!renameTarget || !newName.trim()) return;
    try {
      if (renameTarget.kind === 'folder') {
        await updateExamFolder(renameTarget.id, { subject: newName.trim() });
      } else {
        await renameExamFile(renameTarget.id, newName.trim());
      }
      await fetchFolders();
      if (selectedFolderId) await fetchDetail(selectedFolderId);
    } catch (err) {
      console.warn('Rename failed:', err);
    } finally {
      setRenameTarget(null);
    }
  };

  // ----- Modal openers (passed to subcomponents) -----

  const openCreateFolder = () => setShowCreateFolderModal(true);

  /**
   * The grid + detail components call this with a folderId/fileId. We can't
   * tell from the callback signature alone whether it's a folder or file, so
   * the grid passes folderIds (matching the folder _ids we sent down) and
   * the detail page passes fileIds (matching the file _ids we sent down).
   * We resolve which kind by checking our local lookups.
   */
  const openDeleteFromGrid = (folderId: string, name: string) => {
    setDeleteTarget({ kind: 'folder', id: folderId, name });
    setShowDeleteModal(true);
  };
  const openRenameFromGrid = (folderId: string, name: string) => {
    setRenameTarget({ kind: 'folder', id: folderId, name });
    setShowRenameModal(true);
  };
  const openDeleteFromDetail = (fileId: string, name: string) => {
    setDeleteTarget({ kind: 'file', id: fileId, name });
    setShowDeleteModal(true);
  };
  const openRenameFromDetail = (fileId: string, name: string) => {
    setRenameTarget({ kind: 'file', id: fileId, name });
    setShowRenameModal(true);
  };

  const openUploadInto = (folderId: string) => {
    setUploadTarget(folderId);
    setShowUploadModal(true);
  };

  // ----- Mapped data for components -----
  const componentFolders: ExamQuestion[] = folders.map((f) =>
    toComponentFolder(f)
  );

  const detailComponentFolder: ExamQuestion | null =
    detailFolder !== null
      ? toComponentFolder(detailFolder, filesInDetail)
      : null;

  // ============================================================================
  // SHARED MODALS
  // ============================================================================
  const renderModals = () => (
    <>
      <CreateFolderModal
        isOpen={showCreateFolderModal}
        onClose={() => setShowCreateFolderModal(false)}
        onCreate={handleCreateFolder}
      />

      <CreateNewFolderModal
        isOpen={showUploadModal}
        onClose={() => {
          setShowUploadModal(false);
          setUploadTarget(null);
        }}
        onUpload={handleUpload}
      />

      <DeleteFileModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setDeleteTarget(null);
        }}
        fileName={deleteTarget?.name ?? ''}
        onDelete={handleConfirmDelete}
      />

      <RenameModal
        isOpen={showRenameModal}
        onClose={() => {
          setShowRenameModal(false);
          setRenameTarget(null);
        }}
        currentName={renameTarget?.name ?? ''}
        onRename={handleConfirmRename}
      />
    </>
  );

  // ============================================================================
  // DETAIL VIEW
  // ============================================================================
  if (selectedFolderId && detailComponentFolder) {
    return (
      <>
        <ExamQuestionDetail
          subject={detailComponentFolder}
          onBack={() => setSelectedFolderId(null)}
          // The detail page lets the admin add more files to THIS folder.
          onCreateNewFolder={() => openUploadInto(selectedFolderId)}
          onDeleteFolder={openDeleteFromDetail}
          onRenameFolder={openRenameFromDetail}
        />
        {renderModals()}
      </>
    );
  }

  // ============================================================================
  // GRID VIEW
  // ============================================================================
  if (foldersLoading) {
    return (
      <div className='min-h-full bg-gray-50 p-2 sm:p-4 md:p-6'>
        <div className='mb-6'>
          <h1 className='text-xl sm:text-2xl font-semibold text-gray-900'>
            Exam questions
          </h1>
          <p className='text-xs sm:text-sm text-gray-500 mt-1'>
            Manage your exam questions effectively
          </p>
        </div>
        <div className='grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-4'>
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className='bg-white rounded-lg border border-gray-100 p-3 sm:p-4 h-32 animate-pulse'
            >
              <div className='w-10 h-10 bg-gray-200 rounded mb-3' />
              <div className='h-4 w-2/3 bg-gray-200 rounded mb-2' />
              <div className='h-3 w-1/2 bg-gray-100 rounded' />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (foldersError) {
    return (
      <div className='min-h-full bg-gray-50 p-6 text-center'>
        <p className='text-sm text-gray-500 mb-3'>{foldersError}</p>
        <button
          onClick={fetchFolders}
          className='text-sm font-medium text-green-700 hover:text-green-900'
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <>
      <ExamQuestionsGrid
        examQuestions={componentFolders}
        onViewDetails={(folderId) => setSelectedFolderId(folderId)}
        onCreateNewFolder={openCreateFolder}
        onDeleteFolder={openDeleteFromGrid}
        onRenameFolder={openRenameFromGrid}
      />
      {renderModals()}
    </>
  );
};

export default ExamQuestions;
