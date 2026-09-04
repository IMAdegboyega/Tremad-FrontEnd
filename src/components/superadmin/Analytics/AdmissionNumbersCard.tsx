'use client';

/**
 * Admission Numbers — pool status + generator.
 *
 * Students are issued an admission number (YYNNN, e.g. 26001) from a pre-minted
 * pool. If the pool for the current year is empty, creating a student fails with
 * "No available admission numbers" — so this card surfaces how many are left and
 * lets an admin mint more without touching the API by hand.
 */

import React, { useCallback, useEffect, useState } from 'react';
import { Loader2, RefreshCw, Ticket, AlertTriangle } from 'lucide-react';
import {
  getAdmissionPoolStatus,
  generateAdmissionPool,
} from '@/lib/api/superAdmin.service';
import { getApiErrorMessage } from '@/lib/api/client';

interface PoolStats {
  year: number;
  available: number;
  assigned: number;
  total: number;
}

const LOW_WATERMARK = 10;

const AdmissionNumbersCard: React.FC = () => {
  const currentYear = new Date().getFullYear();

  const [stats, setStats] = useState<PoolStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [count, setCount] = useState(100);
  const [generating, setGenerating] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const fetchStatus = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getAdmissionPoolStatus();
      if (res.success && res.data) {
        // Backend returns { year, statistics: { available: { count } }, total }.
        // Tolerate a flat shape too, since the declared type claims one.
        const d = res.data as unknown as {
          year?: number | string;
          total?: number;
          available?: number;
          assigned?: number;
          statistics?: Record<string, { count?: number }>;
        };
        setStats({
          year: Number(d.year) || currentYear,
          available: d.statistics?.available?.count ?? d.available ?? 0,
          assigned: d.statistics?.assigned?.count ?? d.assigned ?? 0,
          total: d.total ?? 0,
        });
      } else {
        setError(res.message || 'Could not load admission numbers.');
      }
    } catch (err) {
      setError(getApiErrorMessage(err, 'Could not load admission numbers.'));
    } finally {
      setLoading(false);
    }
  }, [currentYear]);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  const handleGenerate = async () => {
    if (generating) return;
    setGenerating(true);
    setError(null);
    setNotice(null);
    try {
      const res = await generateAdmissionPool(stats?.year ?? currentYear, count);
      if (res.success) {
        setNotice(`Generated ${count} admission number${count === 1 ? '' : 's'}.`);
        await fetchStatus();
      } else {
        setError(res.message || 'Could not generate admission numbers.');
      }
    } catch (err) {
      setError(getApiErrorMessage(err, 'Could not generate admission numbers.'));
    } finally {
      setGenerating(false);
    }
  };

  const available = stats?.available ?? 0;
  const isEmpty = !loading && available === 0;
  const isLow = !loading && available > 0 && available <= LOW_WATERMARK;

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-5">
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <Ticket className="w-5 h-5 text-primary-green" />
          <div>
            <h3 className="text-sm font-semibold text-gray-900">Admission numbers</h3>
            <p className="text-xs text-gray-500">
              {stats?.year ?? currentYear} session pool
            </p>
          </div>
        </div>
        <button
          onClick={fetchStatus}
          disabled={loading}
          className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
          title="Refresh"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Counts */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="text-center p-2 rounded-lg bg-gray-50">
          <p
            className={`text-xl font-semibold ${
              isEmpty ? 'text-red-600' : isLow ? 'text-yellow-600' : 'text-gray-900'
            }`}
          >
            {loading ? '—' : available}
          </p>
          <p className="text-[11px] text-gray-500">Available</p>
        </div>
        <div className="text-center p-2 rounded-lg bg-gray-50">
          <p className="text-xl font-semibold text-gray-900">
            {loading ? '—' : stats?.assigned ?? 0}
          </p>
          <p className="text-[11px] text-gray-500">Assigned</p>
        </div>
        <div className="text-center p-2 rounded-lg bg-gray-50">
          <p className="text-xl font-semibold text-gray-900">
            {loading ? '—' : stats?.total ?? 0}
          </p>
          <p className="text-[11px] text-gray-500">Total</p>
        </div>
      </div>

      {(isEmpty || isLow) && (
        <div
          className={`flex items-start gap-2 p-3 rounded-lg mb-3 ${
            isEmpty ? 'bg-red-50 border border-red-200' : 'bg-yellow-50 border border-yellow-200'
          }`}
        >
          <AlertTriangle
            className={`w-4 h-4 mt-0.5 shrink-0 ${isEmpty ? 'text-red-600' : 'text-yellow-600'}`}
          />
          <p className={`text-xs ${isEmpty ? 'text-red-700' : 'text-yellow-700'}`}>
            {isEmpty
              ? 'No numbers left — new students cannot be created until you generate more.'
              : `Only ${available} left. Generate more before the next intake.`}
          </p>
        </div>
      )}

      {error && (
        <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-xs text-red-600">{error}</p>
        </div>
      )}
      {notice && (
        <div className="mb-3 p-3 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-xs text-green-700">{notice}</p>
        </div>
      )}

      {/* Generate */}
      <div className="flex items-end gap-2">
        <div className="flex-1">
          <label className="block text-[11px] font-medium text-gray-600 mb-1">
            How many to generate
          </label>
          <input
            type="number"
            min={1}
            max={900}
            value={count}
            onChange={(e) =>
              setCount(Math.min(900, Math.max(1, Number(e.target.value) || 1)))
            }
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>
        <button
          onClick={handleGenerate}
          disabled={generating}
          className="flex items-center gap-2 px-4 py-2 text-sm text-white bg-primary-green rounded-lg hover:bg-primary-green-hover disabled:opacity-60 min-h-[38px]"
        >
          {generating && <Loader2 className="w-4 h-4 animate-spin" />}
          {generating ? 'Generating…' : 'Generate'}
        </button>
      </div>
      <p className="text-[11px] text-gray-400 mt-2">
        Numbers are issued in order (e.g. {String(stats?.year ?? currentYear).slice(-2)}001,{' '}
        {String(stats?.year ?? currentYear).slice(-2)}002…). Max 900 per session.
      </p>
    </div>
  );
};

export default AdmissionNumbersCard;
