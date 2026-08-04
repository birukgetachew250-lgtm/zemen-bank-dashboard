'use client';

import React, { useState, useEffect } from 'react';
import {
  User, Shield, Film, History, CheckCircle2, XCircle,
  Fingerprint, ScanFace as ScanFaceIcon, Phone, Mail,
  Building, CreditCard, Calendar, Hash,
} from 'lucide-react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import SimilarityGauge from './SimilarityGauge';
import ProtectedMedia from './ProtectedMedia';

interface LinkingDetailModalProps {
  requestId: string;
  isOpen: boolean;
  onClose: () => void;
  mode: 'view' | 'review' | 'approve';
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

export default function LinkingDetailModal({
  requestId,
  isOpen,
  onClose,
  mode,
  onActionComplete,
}: LinkingDetailModalProps) {
  const [detail, setDetail]       = useState<LinkingDetail | null>(null);
  const [loading, setLoading]     = useState(true);
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

    fetch(`/api/online-linking/${requestId}`)
      .then((r) => r.json())
      .then((data) => setDetail(data))
      .catch(() => setActionError('Failed to load request details'))
      .finally(() => setLoading(false));
  }, [isOpen, requestId]);

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

  const InfoRow = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: React.ReactNode }) => (
    <div className="flex items-start gap-3 py-3 border-b last:border-0">
      <div className="text-muted-foreground mt-0.5">{icon}</div>
      <div className="flex-1 min-w-0">
        <p className="text-[11px] text-muted-foreground uppercase tracking-wider mb-0.5">{label}</p>
        <p className="text-sm font-medium break-words">{value || '—'}</p>
      </div>
    </div>
  );

  const BoolBadge = ({ val, trueText, falseText }: { val: number | boolean; trueText: string; falseText: string }) => (
    <Badge variant={val ? "default" : "destructive"} className="gap-1.5">
      {val ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
      {val ? trueText : falseText}
    </Badge>
  );

  return (
    <Dialog open={isOpen} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col p-0 gap-0">
        <DialogHeader className="px-6 py-4 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <ScanFaceIcon size={20} className="text-primary" />
              </div>
              <div>
                <DialogTitle>Online Linking Request</DialogTitle>
                <DialogDescription>ID: {requestId.substring(0, 12)}…</DialogDescription>
              </div>
            </div>
            {detail && (
              <Badge variant={detail.Status === 'Approved' ? 'default' : detail.Status === 'Rejected' ? 'destructive' : 'secondary'}>
                {detail.Status}
              </Badge>
            )}
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-20 text-muted-foreground">
              Loading...
            </div>
          ) : !detail ? (
            <div className="text-center py-20 text-muted-foreground">Failed to load details.</div>
          ) : (
            <Tabs defaultValue="info" className="w-full">
              <div className="px-6 border-b">
                <TabsList className="h-12 w-full justify-start bg-transparent">
                  <TabsTrigger value="info" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-4 py-3">
                    <User size={16} className="mr-2" /> Personal Info
                  </TabsTrigger>
                  <TabsTrigger value="verification" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-4 py-3">
                    <Shield size={16} className="mr-2" /> Verification
                  </TabsTrigger>
                  <TabsTrigger value="media" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-4 py-3">
                    <Film size={16} className="mr-2" /> Media
                  </TabsTrigger>
                  <TabsTrigger value="audit" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-4 py-3">
                    <History size={16} className="mr-2" /> Audit Trail
                  </TabsTrigger>
                </TabsList>
              </div>

              <div className="p-6">
                <TabsContent value="info" className="mt-0 outline-none">
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
                          value={<span className="text-destructive">{detail.RejectionReason}</span>}
                        />
                      )}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="verification" className="mt-0 outline-none space-y-8">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    <div className="border rounded-xl p-5 text-center">
                      <p className="text-xs text-muted-foreground uppercase tracking-wider mb-3">Fayda Verified</p>
                      <BoolBadge val={detail.FaydaVerified} trueText="Verified" falseText="Not Verified" />
                    </div>
                    <div className="border rounded-xl p-5 text-center">
                      <p className="text-xs text-muted-foreground uppercase tracking-wider mb-3">Liveness Check</p>
                      <BoolBadge val={detail.LivenessCheckPassed} trueText="Passed" falseText="Failed" />
                    </div>
                    <div className="border rounded-xl p-5 text-center">
                      <p className="text-xs text-muted-foreground uppercase tracking-wider mb-3">Face Match</p>
                      <BoolBadge val={detail.IsMatch} trueText="Match" falseText="No Match" />
                    </div>
                  </div>

                  <div className="flex flex-col items-center">
                    <SimilarityGauge score={detail.SimilarityScore ?? 0} size={160} label="Probe vs Reference Match" />
                  </div>

                  {detail.VideoWord && (
                    <div className="border rounded-xl p-5 bg-muted/20">
                      <p className="text-xs text-muted-foreground uppercase tracking-wider mb-3">Video Verification Details</p>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground text-xs">Word Spoken</span>
                          <p className="font-medium mt-1">{detail.VideoWord}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground text-xs">Duration</span>
                          <p className="font-medium mt-1">{detail.VideoDurationSeconds}s</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground text-xs">File Size</span>
                          <p className="font-medium mt-1">
                            {detail.VideoSizeBytes ? `${(detail.VideoSizeBytes / (1024 * 1024)).toFixed(2)} MB` : '—'}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {detail.FaydaData && (
                    <div className="border rounded-xl p-5 bg-muted/20">
                      <p className="text-xs text-muted-foreground uppercase tracking-wider mb-3">Fayda Response Data</p>
                      <pre className="text-xs overflow-x-auto whitespace-pre-wrap max-h-60">
                        {typeof detail.FaydaData === 'string'
                          ? detail.FaydaData
                          : JSON.stringify(detail.FaydaData, null, 2)}
                      </pre>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="media" className="mt-0 outline-none space-y-8">
                  <div>
                    <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
                      <ScanFaceIcon size={16} className="text-primary" /> Reference Image (ID Photo)
                    </h3>
                    <div className="border rounded-xl p-4 flex justify-center bg-muted/10">
                      <ProtectedMedia src={`/api/online-linking/${requestId}/media?type=reference`} type="image" alt="Reference Image" />
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
                      <ScanFaceIcon size={16} className="text-primary" /> Probe Image (Live Capture)
                    </h3>
                    <div className="border rounded-xl p-4 flex justify-center bg-muted/10">
                      <ProtectedMedia src={`/api/online-linking/${requestId}/media?type=probe`} type="image" alt="Probe Image" />
                    </div>
                  </div>

                  {detail.hasVideo && (
                    <div>
                      <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
                        <Film size={16} className="text-primary" /> Liveness Video
                      </h3>
                      <div className="border rounded-xl p-4 flex justify-center bg-muted/10">
                        <ProtectedMedia src={`/api/online-linking/${requestId}/media?type=video`} type="video" alt="Liveness Video" />
                      </div>
                    </div>
                  )}

                  {detail.SignatureUrl && (
                    <div>
                      <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
                        <Fingerprint size={16} className="text-primary" /> Signature
                      </h3>
                      <div className="border rounded-xl p-4 flex justify-center bg-muted/10">
                        <ProtectedMedia src={detail.SignatureUrl} type="image" alt="Signature" />
                      </div>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="audit" className="mt-0 outline-none">
                  {detail.reviews && detail.reviews.length > 0 ? (
                    <div className="space-y-3">
                      {detail.reviews.map((review, i) => (
                        <div key={review.Id || i} className="border rounded-xl p-4 flex items-start gap-4">
                          <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
                            review.Action === 'Approved' ? 'bg-emerald-500/15 text-emerald-600' :
                            review.Action === 'Rejected' ? 'bg-red-500/15 text-red-600' : 'bg-sky-500/15 text-sky-600'
                          }`}>
                            {review.Action === 'Approved' ? <CheckCircle2 size={16} /> :
                             review.Action === 'Rejected' ? <XCircle size={16} /> : <History size={16} />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-sm font-medium">{review.ReviewerName}</span>
                              <Badge variant="outline" className="text-[10px] uppercase">{review.Action}</Badge>
                            </div>
                            <p className="text-xs text-muted-foreground mt-0.5">{review.ReviewerEmail}</p>
                            {review.Notes && (
                              <p className="text-sm mt-2 bg-muted/30 rounded-lg p-2.5 border">
                                {review.Notes}
                              </p>
                            )}
                            <p className="text-xs text-muted-foreground mt-2">
                              {review.ReviewedAt ? new Date(review.ReviewedAt).toLocaleString() : '—'}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 text-muted-foreground">
                      <History size={32} className="mx-auto mb-3 opacity-50" />
                      <p>No review history yet</p>
                    </div>
                  )}
                </TabsContent>
              </div>
            </Tabs>
          )}
        </div>

        {/* Action Footer */}
        {!loading && detail && (mode === 'review' || mode === 'approve') && (
          <div className="px-6 py-4 border-t bg-muted/20 space-y-4">
            {actionError && (
              <div className="px-3 py-2 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                {actionError}
              </div>
            )}

            <div className="space-y-2">
              <Label>{mode === 'review' ? 'Review Notes' : 'Notes'}</Label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={mode === 'review' ? 'Add review observations…' : 'Optional notes…'}
                rows={2}
              />
            </div>

            {mode === 'approve' && (
              <div className="space-y-2">
                <Label>Rejection Reason <span className="text-muted-foreground font-normal">(required if rejecting)</span></Label>
                <Textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Explain the reason for rejection…"
                  rows={2}
                />
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-2">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>

              {mode === 'review' && (
                <Button onClick={handleReview} disabled={actionLoading}>
                  {actionLoading ? 'Submitting…' : 'Submit Review'}
                </Button>
              )}

              {mode === 'approve' && (
                <>
                  <Button variant="destructive" onClick={() => handleApprove('reject')} disabled={actionLoading}>
                    {actionLoading ? 'Processing…' : 'Reject'}
                  </Button>
                  <Button onClick={() => handleApprove('approve')} disabled={actionLoading}>
                    {actionLoading ? 'Processing…' : 'Approve & Link'}
                  </Button>
                </>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
