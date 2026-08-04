'use client';

import React, { useState, useEffect } from 'react';
import {
  X, User, Shield, Film, History, CheckCircle2, XCircle,
  Fingerprint, ScanFace as ScanFaceIcon, Phone, Mail,
  Building, CreditCard, Calendar, Hash,
} from 'lucide-react';
import SimilarityGauge from './SimilarityGauge';
import ProtectedMedia from './ProtectedMedia';

interface LinkingDetailModalProps {
  requestId: string;
  isOpen: boolean;
  onClose: () => void;
  /** Which mode to operate in */
  mode: 'view' | 'review' | 'approve';
  /** Called after successful review or approval action */
  onActionComplete?: () => void;
}

interface LinkingDetail {
  Id: string;
  Cif: string;
  FullName: string;
  DateOfBirth: string;
  NationalId: string;
  Phone: string;
  Email: string;
  HomeBranch: string;
  FaydaVerified: number;
  FaydaData: any;
  LivenessCheckPassed: number;
  SimilarityScore: number;
  IsMatch: number;
  VideoWord: string;
  VideoDurationSeconds: number;
  VideoSizeBytes: number;
  SignatureUrl: string;
  AccountNumber: string;
  AccountType: string;
  Status: string;
  SubmittedAt: string;
  ReviewedAt: string;
  ApprovedAt: string;
  RejectedAt: string;
  RejectionReason: string;
  hasVideo: boolean;
  hasReferenceImage: boolean;
  hasProbeImage: boolean;
  reviews: Array<{
    Id: string;
    ReviewerName: string;
    ReviewerEmail: string;
    Action: string;
    Notes: string;
    ReviewedAt: string;
  }>;
}

type TabKey = 'info' | 'verification' | 'media' | 'audit';

export default function LinkingDetailModal({
  requestId,
  isOpen,
  onClose,
  mode,
  onActionComplete,
}: LinkingDetailModalProps) {
  const [detail, setDetail]       = useState<LinkingDetail | null>(null);
  const [loading, setLoading]     = useState(true);
  const [activeTab, setActiveTab] = useState<TabKey>('info');
  const [notes, setNotes]         = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [actionLoading, setActionLoading]     = useState(false);
  const [actionError, setActionError]         = useState('');

  useEffect(() => {
    if (!isOpen || !requestId) return;
    setLoading(true);
    setActionError('');
    setNotes('');
    setRejectionReason('');
    setActiveTab('info');

    fetch(`/api/online-linking/${requestId}`)
      .then((r) => r.json())
      .then((data) => setDetail(data))
      .catch(() => setActionError('Failed to load request details'))
      .finally(() => setLoading(false));
  }, [isOpen, requestId]);

  if (!isOpen) return null;

  const tabs: { key: TabKey; label: string; icon: React.ReactNode }[] = [
    { key: 'info',         label: 'Personal Info',  icon: <User size={16} /> },
    { key: 'verification', label: 'Verification',   icon: <Shield size={16} /> },
    { key: 'media',        label: 'Media',           icon: <Film size={16} /> },
    { key: 'audit',        label: 'Audit Trail',     icon: <History size={16} /> },
  ];

  const handleReview = async () => {
    setActionLoading(true);
    setActionError('');
    try {
      const res = await fetch(`/api/online-linking/${requestId}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Review failed');
      onActionComplete?.();
      onClose();
    } catch (err: any) {
      setActionError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleApprove = async (action: 'approve' | 'reject') => {
    setActionLoading(true);
    setActionError('');
    try {
      const res = await fetch(`/api/online-linking/${requestId}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, notes, rejectionReason }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || `${action} failed`);
      onActionComplete?.();
      onClose();
    } catch (err: any) {
      setActionError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const statusColor: Record<string, string> = {
    Pending:  'bg-amber-500/20 text-amber-400 border-amber-500/30',
    Reviewed: 'bg-sky-500/20 text-sky-400 border-sky-500/30',
    Approved: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    Rejected: 'bg-red-500/20 text-red-400 border-red-500/30',
  };

  const InfoRow = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: React.ReactNode }) => (
    <div className="flex items-start gap-3 py-3 border-b border-white/5 last:border-0">
      <div className="text-white/40 mt-0.5">{icon}</div>
      <div className="flex-1 min-w-0">
        <p className="text-[11px] text-white/40 uppercase tracking-wider mb-0.5">{label}</p>
        <p className="text-sm text-white/90 break-words">{value || '—'}</p>
      </div>
    </div>
  );

  const BoolBadge = ({ val, trueText, falseText }: { val: number | boolean; trueText: string; falseText: string }) => (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
      val ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20' : 'bg-red-500/15 text-red-400 border-red-500/20'
    }`}>
      {val ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
      {val ? trueText : falseText}
    </span>
  );

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-[hsl(222,47%,11%)] border border-white/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500/20 to-violet-500/20 flex items-center justify-center border border-white/10">
              <ScanFaceIcon size={20} className="text-sky-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white" style={{ fontFamily: 'var(--font-outfit)' }}>
                Online Linking Request
              </h2>
              <p className="text-xs text-white/40 font-mono">{requestId.substring(0, 12)}…</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {detail && (
              <span className={`px-3 py-1 rounded-full text-xs font-medium border ${statusColor[detail.Status] || 'bg-white/10 text-white/60 border-white/10'}`}>
                {detail.Status}
              </span>
            )}
            <button onClick={onClose} className="text-white/40 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/5">
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex px-6 border-b border-white/10 bg-white/[0.01]">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-all border-b-2 -mb-px ${
                activeTab === tab.key
                  ? 'text-sky-400 border-sky-400'
                  : 'text-white/40 border-transparent hover:text-white/60'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-8 h-8 border-2 border-sky-400/30 border-t-sky-400 rounded-full animate-spin" />
            </div>
          ) : !detail ? (
            <div className="text-center py-20 text-white/40">Failed to load details.</div>
          ) : (
            <>
              {/* ── Personal Info Tab ── */}
              {activeTab === 'info' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
                  <div>
                    <InfoRow icon={<User size={14} />}       label="Full Name"      value={detail.FullName} />
                    <InfoRow icon={<Hash size={14} />}       label="CIF"            value={detail.Cif} />
                    <InfoRow icon={<Fingerprint size={14} />} label="National ID"   value={detail.NationalId} />
                    <InfoRow icon={<Calendar size={14} />}   label="Date of Birth"  value={detail.DateOfBirth} />
                    <InfoRow icon={<Phone size={14} />}      label="Phone"          value={detail.Phone} />
                    <InfoRow icon={<Mail size={14} />}       label="Email"          value={detail.Email || '—'} />
                  </div>
                  <div>
                    <InfoRow icon={<Building size={14} />}   label="Home Branch"    value={detail.HomeBranch} />
                    <InfoRow icon={<CreditCard size={14} />} label="Account Number" value={detail.AccountNumber} />
                    <InfoRow icon={<CreditCard size={14} />} label="Account Type"   value={detail.AccountType} />
                    <InfoRow
                      icon={<Calendar size={14} />}
                      label="Submitted At"
                      value={detail.SubmittedAt ? new Date(detail.SubmittedAt).toLocaleString() : '—'}
                    />
                    {detail.RejectionReason && (
                      <InfoRow
                        icon={<XCircle size={14} />}
                        label="Rejection Reason"
                        value={<span className="text-red-400">{detail.RejectionReason}</span>}
                      />
                    )}
                  </div>
                </div>
              )}

              {/* ── Verification Tab ── */}
              {activeTab === 'verification' && (
                <div className="space-y-8">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    <div className="bg-white/[0.03] border border-white/5 rounded-xl p-5 text-center">
                      <p className="text-xs text-white/40 uppercase tracking-wider mb-3">Fayda Verified</p>
                      <BoolBadge val={detail.FaydaVerified} trueText="Verified" falseText="Not Verified" />
                    </div>
                    <div className="bg-white/[0.03] border border-white/5 rounded-xl p-5 text-center">
                      <p className="text-xs text-white/40 uppercase tracking-wider mb-3">Liveness Check</p>
                      <BoolBadge val={detail.LivenessCheckPassed} trueText="Passed" falseText="Failed" />
                    </div>
                    <div className="bg-white/[0.03] border border-white/5 rounded-xl p-5 text-center">
                      <p className="text-xs text-white/40 uppercase tracking-wider mb-3">Face Match</p>
                      <BoolBadge val={detail.IsMatch} trueText="Match" falseText="No Match" />
                    </div>
                  </div>

                  {/* Similarity Score Gauge */}
                  <div className="flex flex-col items-center mt-6 mb-2">
                    <SimilarityGauge
                      score={detail.SimilarityScore ?? 0}
                      size={160}
                      label="Probe vs Reference Match"
                    />
                  </div>

                  {/* Video metadata */}
                  {detail.VideoWord && (
                    <div className="bg-white/[0.03] border border-white/5 rounded-xl p-5">
                      <p className="text-xs text-white/40 uppercase tracking-wider mb-3">Video Verification Details</p>
                      <div className="grid grid-cols-3 gap-4 text-sm text-white/70">
                        <div>
                          <span className="text-white/40 text-xs">Word Spoken</span>
                          <p className="font-medium text-white/90 mt-1">{detail.VideoWord}</p>
                        </div>
                        <div>
                          <span className="text-white/40 text-xs">Duration</span>
                          <p className="font-medium text-white/90 mt-1">{detail.VideoDurationSeconds}s</p>
                        </div>
                        <div>
                          <span className="text-white/40 text-xs">File Size</span>
                          <p className="font-medium text-white/90 mt-1">
                            {detail.VideoSizeBytes ? `${(detail.VideoSizeBytes / (1024 * 1024)).toFixed(2)} MB` : '—'}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Fayda Data (parsed JSON) */}
                  {detail.FaydaData && (
                    <div className="bg-white/[0.03] border border-white/5 rounded-xl p-5">
                      <p className="text-xs text-white/40 uppercase tracking-wider mb-3">Fayda Response Data</p>
                      <pre className="text-xs text-white/60 overflow-x-auto whitespace-pre-wrap max-h-60 custom-scrollbar">
                        {typeof detail.FaydaData === 'string'
                          ? detail.FaydaData
                          : JSON.stringify(detail.FaydaData, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              )}

              {/* ── Media Tab ── */}
              {activeTab === 'media' && (
                <div className="space-y-8">
                  {/* Reference Image */}
                  <div>
                    <h3 className="text-sm font-medium text-white/70 mb-3 flex items-center gap-2">
                      <ScanFaceIcon size={16} className="text-sky-400" />
                      Reference Image (ID Photo)
                    </h3>
                    <div className="bg-white/[0.03] border border-white/5 rounded-xl p-4 flex justify-center">
                      <ProtectedMedia
                        src={`/api/online-linking/${requestId}/media?type=reference`}
                        type="image"
                        alt="Reference Image"
                      />
                    </div>
                  </div>

                  {/* Probe Image */}
                  <div>
                    <h3 className="text-sm font-medium text-white/70 mb-3 flex items-center gap-2">
                      <ScanFaceIcon size={16} className="text-violet-400" />
                      Probe Image (Live Capture)
                    </h3>
                    <div className="bg-white/[0.03] border border-white/5 rounded-xl p-4 flex justify-center">
                      <ProtectedMedia
                        src={`/api/online-linking/${requestId}/media?type=probe`}
                        type="image"
                        alt="Probe Image"
                      />
                    </div>
                  </div>

                  {/* Video */}
                  {detail.hasVideo && (
                    <div>
                      <h3 className="text-sm font-medium text-white/70 mb-3 flex items-center gap-2">
                        <Film size={16} className="text-amber-400" />
                        Liveness Video
                      </h3>
                      <div className="bg-white/[0.03] border border-white/5 rounded-xl p-4 flex justify-center">
                        <ProtectedMedia
                          src={`/api/online-linking/${requestId}/media?type=video`}
                          type="video"
                          alt="Liveness Video"
                        />
                      </div>
                    </div>
                  )}

                  {/* Signature */}
                  {detail.SignatureUrl && (
                    <div>
                      <h3 className="text-sm font-medium text-white/70 mb-3 flex items-center gap-2">
                        <Fingerprint size={16} className="text-teal-400" />
                        Signature
                      </h3>
                      <div className="bg-white/[0.03] border border-white/5 rounded-xl p-4 flex justify-center">
                        <ProtectedMedia
                          src={detail.SignatureUrl}
                          type="image"
                          alt="Signature"
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ── Audit Trail Tab ── */}
              {activeTab === 'audit' && (
                <div>
                  {detail.reviews && detail.reviews.length > 0 ? (
                    <div className="space-y-3">
                      {detail.reviews.map((review, i) => (
                        <div
                          key={review.Id || i}
                          className="bg-white/[0.03] border border-white/5 rounded-xl p-4 flex items-start gap-4"
                        >
                          <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
                            review.Action === 'Approved'
                              ? 'bg-emerald-500/15 text-emerald-400'
                              : review.Action === 'Rejected'
                                ? 'bg-red-500/15 text-red-400'
                                : 'bg-sky-500/15 text-sky-400'
                          }`}>
                            {review.Action === 'Approved' ? <CheckCircle2 size={16} />
                              : review.Action === 'Rejected' ? <XCircle size={16} />
                              : <History size={16} />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-sm font-medium text-white/90">{review.ReviewerName}</span>
                              <span className={`px-2 py-0.5 rounded text-[10px] font-medium uppercase ${
                                review.Action === 'Approved'
                                  ? 'bg-emerald-500/15 text-emerald-400'
                                  : review.Action === 'Rejected'
                                    ? 'bg-red-500/15 text-red-400'
                                    : 'bg-sky-500/15 text-sky-400'
                              }`}>
                                {review.Action}
                              </span>
                            </div>
                            <p className="text-xs text-white/40 mt-0.5">{review.ReviewerEmail}</p>
                            {review.Notes && (
                              <p className="text-sm text-white/60 mt-2 bg-white/[0.03] rounded-lg p-2.5 border border-white/5">
                                {review.Notes}
                              </p>
                            )}
                            <p className="text-xs text-white/30 mt-2">
                              {review.ReviewedAt ? new Date(review.ReviewedAt).toLocaleString() : '—'}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 text-white/30">
                      <History size={32} className="mx-auto mb-3 opacity-50" />
                      <p>No review history yet</p>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {/* Action Footer */}
        {!loading && detail && (mode === 'review' || mode === 'approve') && (
          <div className="px-6 py-4 border-t border-white/10 bg-white/[0.02] space-y-3">
            {actionError && (
              <div className="px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                {actionError}
              </div>
            )}

            <div>
              <label className="text-xs text-white/40 uppercase tracking-wider mb-1.5 block">
                {mode === 'review' ? 'Review Notes' : 'Notes'}
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={mode === 'review' ? 'Add review observations…' : 'Optional notes…'}
                className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white/90 placeholder-white/30 focus:outline-none focus:border-sky-500/50 focus:ring-1 focus:ring-sky-500/20 resize-none"
                rows={2}
              />
            </div>

            {mode === 'approve' && (
              <div>
                <label className="text-xs text-white/40 uppercase tracking-wider mb-1.5 block">
                  Rejection Reason (required if rejecting)
                </label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Explain the reason for rejection…"
                  className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white/90 placeholder-white/30 focus:outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/20 resize-none"
                  rows={2}
                />
              </div>
            )}

            <div className="flex items-center justify-end gap-3">
              <button
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl text-sm text-white/60 hover:text-white hover:bg-white/5 transition-colors"
              >
                Cancel
              </button>

              {mode === 'review' && (
                <button
                  onClick={handleReview}
                  disabled={actionLoading}
                  className="px-6 py-2.5 rounded-xl text-sm font-medium bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-lg shadow-sky-500/20 hover:shadow-sky-500/40 transition-all disabled:opacity-50"
                >
                  {actionLoading ? 'Submitting…' : 'Submit Review'}
                </button>
              )}

              {mode === 'approve' && (
                <>
                  <button
                    onClick={() => handleApprove('reject')}
                    disabled={actionLoading}
                    className="px-6 py-2.5 rounded-xl text-sm font-medium bg-gradient-to-r from-red-500 to-rose-600 text-white shadow-lg shadow-red-500/20 hover:shadow-red-500/40 transition-all disabled:opacity-50"
                  >
                    {actionLoading ? 'Processing…' : 'Reject'}
                  </button>
                  <button
                    onClick={() => handleApprove('approve')}
                    disabled={actionLoading}
                    className="px-6 py-2.5 rounded-xl text-sm font-medium bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 transition-all disabled:opacity-50"
                  >
                    {actionLoading ? 'Processing…' : 'Approve & Link'}
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
