'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  User, Shield, Film, History, CheckCircle2, XCircle,
  Fingerprint, ScanFace as ScanFaceIcon, Phone, Mail,
  Building, CreditCard, Calendar, Hash, ArrowLeft,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import SimilarityGauge from '@/components/online-linking/SimilarityGauge';
import ProtectedMedia from '@/components/online-linking/ProtectedMedia';

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

export default function OnlineLinkingDetailPage({ params }: { params: { id: string } }) {
  const requestId = params.id;
  const router = useRouter();
  const searchParams = useSearchParams();
  const mode = searchParams.get('mode') || 'view';

  const [detail, setDetail]       = useState<LinkingDetail | null>(null);
  const [loading, setLoading]     = useState(true);
  const [notes, setNotes]         = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [actionLoading, setActionLoading]     = useState(false);
  const [actionError, setActionError]         = useState('');

  useEffect(() => {
    if (!requestId) return;
    setLoading(true);
    fetch(`/api/online-linking/${requestId}`)
      .then((r) => r.json())
      .then((data) => setDetail(data))
      .catch(() => setActionError('Failed to load request details'))
      .finally(() => setLoading(false));
  }, [requestId]);

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
      router.push('/online-linking/review');
    } catch (err: any) {
      setActionError(err.message);
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
      router.push('/online-linking/approve');
    } catch (err: any) {
      setActionError(err.message);
      setActionLoading(false);
    }
  };

  const InfoRow = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: React.ReactNode }) => (
    <div className="flex items-center justify-between py-3 border-b last:border-0">
      <div className="flex items-center gap-2 text-muted-foreground">
        {icon}
        <span className="text-sm font-medium">{label}</span>
      </div>
      <span className="text-sm text-foreground text-right">{value || '—'}</span>
    </div>
  );

  const BoolBadge = ({ val, trueText, falseText }: { val: number | boolean; trueText: string; falseText: string }) => (
    <Badge variant={val ? "default" : "destructive"} className="gap-1 shadow-sm px-2 py-0.5">
      {val ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
      {val ? trueText : falseText}
    </Badge>
  );

  if (loading) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
        <p className="text-muted-foreground">Loading Request Data...</p>
      </div>
    );
  }

  if (!detail) {
    return (
      <div className="w-full h-full p-8">
        <Button variant="ghost" onClick={() => router.back()} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
        <Card className="p-12 text-center text-muted-foreground">Failed to load request details.</Card>
      </div>
    );
  }

  return (
    <div className="w-full h-full p-4 md:p-8 pt-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => router.back()} className="rounded-full shadow-sm">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-3xl font-bold tracking-tight">Request Details</h2>
              <Badge variant={detail.Status === 'Approved' ? 'default' : detail.Status === 'Rejected' ? 'destructive' : 'secondary'} className="px-3 py-1 text-sm shadow-sm">
                {detail.Status}
              </Badge>
            </div>
            <p className="text-muted-foreground mt-1 text-sm font-mono">{requestId}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* Left Column: Info & Audit */}
        <div className="xl:col-span-5 space-y-6">
          <Card className="shadow-md border-muted/50 overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-sky-500 to-indigo-500" />
            <CardHeader className="pb-4">
              <CardTitle className="text-xl flex items-center gap-2">
                <User className="h-5 w-5 text-primary" /> Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
              <InfoRow icon={<User size={16} />}       label="Full Name"      value={detail.FullName} />
              <InfoRow icon={<Hash size={16} />}       label="CIF"            value={detail.Cif} />
              <InfoRow icon={<Fingerprint size={16} />} label="National ID"   value={detail.NationalId} />
              <InfoRow icon={<Calendar size={16} />}   label="Date of Birth"  value={detail.DateOfBirth} />
              <InfoRow icon={<Phone size={16} />}      label="Phone"          value={detail.Phone} />
              <InfoRow icon={<Mail size={16} />}       label="Email"          value={detail.Email || '—'} />
              <InfoRow icon={<Building size={16} />}   label="Home Branch"    value={detail.HomeBranch} />
              <InfoRow icon={<CreditCard size={16} />} label="Account Number" value={detail.AccountNumber} />
              <InfoRow icon={<CreditCard size={16} />} label="Account Type"   value={detail.AccountType} />
              <InfoRow
                icon={<Calendar size={16} />}
                label="Submitted At"
                value={detail.SubmittedAt ? new Date(detail.SubmittedAt).toLocaleString() : '—'}
              />
              {detail.RejectionReason && (
                <div className="py-3 mt-2 bg-destructive/10 text-destructive px-4 rounded-md border border-destructive/20 text-sm">
                  <strong>Rejection Reason:</strong> {detail.RejectionReason}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="shadow-md border-muted/50">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl flex items-center gap-2">
                <History className="h-5 w-5 text-primary" /> Audit Trail
              </CardTitle>
            </CardHeader>
            <CardContent>
              {detail.reviews && detail.reviews.length > 0 ? (
                <div className="space-y-4">
                  {detail.reviews.map((review, i) => (
                    <div key={review.Id || i} className="flex gap-4 relative">
                      {i !== detail.reviews.length - 1 && (
                        <div className="absolute left-4 top-10 bottom-0 w-px bg-border -ml-px" />
                      )}
                      <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center shrink-0 shadow-sm z-10 border border-background">
                        {review.Action === 'Approved' ? <CheckCircle2 size={16} className="text-emerald-500" /> :
                         review.Action === 'Rejected' ? <XCircle size={16} className="text-red-500" /> : <History size={16} className="text-sky-500" />}
                      </div>
                      <div className="flex-1 pb-4">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-semibold text-sm">{review.ReviewerName}</span>
                          <span className="text-xs text-muted-foreground">{review.ReviewedAt ? new Date(review.ReviewedAt).toLocaleString() : '—'}</span>
                        </div>
                        <div className="text-xs text-muted-foreground mb-2">{review.ReviewerEmail} &bull; {review.Action}</div>
                        {review.Notes && (
                          <div className="bg-muted/50 p-3 rounded-lg text-sm border shadow-sm">
                            {review.Notes}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-muted-foreground bg-muted/20 rounded-lg border border-dashed">
                  <p>No audit history available.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Verification & Media */}
        <div className="xl:col-span-7 space-y-6">
          <Card className="shadow-md border-muted/50 overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-emerald-400 to-teal-500" />
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl flex items-center gap-2">
                  <Shield className="h-5 w-5 text-emerald-500" /> Identity Verification
                </CardTitle>
                <div className="flex items-center gap-2">
                  <BoolBadge val={detail.FaydaVerified} trueText="Fayda Match" falseText="No Fayda" />
                  <BoolBadge val={detail.LivenessCheckPassed} trueText="Live User" falseText="Liveness Failed" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="flex flex-col lg:flex-row gap-8 items-center lg:items-start justify-center bg-muted/10 p-6 rounded-xl border border-muted">
                {/* Gauge */}
                <div className="flex-shrink-0 flex flex-col items-center">
                  <SimilarityGauge score={detail.SimilarityScore ?? 0} size={160} label="Probe vs Reference Match" />
                  <Badge variant={detail.IsMatch ? 'default' : 'destructive'} className="mt-4 shadow-sm">
                    {detail.IsMatch ? 'Face Match Verified' : 'Face Match Failed'}
                  </Badge>
                </div>

                {/* Images side-by-side */}
                <div className="flex gap-4 items-center w-full max-w-lg">
                  <div className="flex-1 flex flex-col items-center">
                    <span className="text-xs font-semibold text-muted-foreground uppercase mb-2 flex items-center gap-1">
                      <ScanFaceIcon size={12}/> Reference (ID)
                    </span>
                    <div className="w-full aspect-[3/4] bg-background border shadow-inner rounded-xl overflow-hidden flex items-center justify-center relative group">
                      <ProtectedMedia src={`/api/online-linking/${requestId}/media?type=reference`} type="image" alt="Reference Image" />
                    </div>
                  </div>
                  <div className="flex-1 flex flex-col items-center">
                    <span className="text-xs font-semibold text-muted-foreground uppercase mb-2 flex items-center gap-1">
                      <ScanFaceIcon size={12}/> Probe (Live)
                    </span>
                    <div className="w-full aspect-[3/4] bg-background border shadow-inner rounded-xl overflow-hidden flex items-center justify-center relative group">
                      <ProtectedMedia src={`/api/online-linking/${requestId}/media?type=probe`} type="image" alt="Probe Image" />
                    </div>
                  </div>
                </div>
              </div>

              {detail.hasVideo && (
                <div className="mt-8">
                  <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                    <Film size={16} className="text-primary" /> Liveness Video
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-background border shadow-inner rounded-xl overflow-hidden flex items-center justify-center p-2">
                      <ProtectedMedia src={`/api/online-linking/${requestId}/media?type=video`} type="video" alt="Liveness Video" />
                    </div>
                    {detail.VideoWord && (
                      <div className="flex flex-col justify-center space-y-4">
                        <div className="bg-muted/20 p-4 rounded-lg border shadow-sm">
                          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Challenge Word</p>
                          <p className="text-2xl font-bold font-mono tracking-widest text-primary">{detail.VideoWord}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="bg-muted/20 p-4 rounded-lg border shadow-sm">
                            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Duration</p>
                            <p className="font-semibold">{detail.VideoDurationSeconds}s</p>
                          </div>
                          <div className="bg-muted/20 p-4 rounded-lg border shadow-sm">
                            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Size</p>
                            <p className="font-semibold">{detail.VideoSizeBytes ? `${(detail.VideoSizeBytes / (1024 * 1024)).toFixed(2)} MB` : '—'}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {detail.SignatureUrl && (
                <div className="mt-8">
                  <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                    <Fingerprint size={16} className="text-primary" /> Digital Signature
                  </h3>
                  <div className="w-full max-w-sm h-32 bg-background border shadow-inner rounded-xl overflow-hidden flex items-center justify-center p-2">
                    <ProtectedMedia src={detail.SignatureUrl} type="image" alt="Signature" />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Action Footer (Only shows if mode = review or approve) */}
          {(mode === 'review' || mode === 'approve') && (
            <Card className="shadow-lg border-primary/20 bg-muted/10 sticky bottom-6 z-10 backdrop-blur-sm">
              <CardContent className="pt-6 space-y-4">
                {actionError && (
                  <div className="px-4 py-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm font-medium">
                    {actionError}
                  </div>
                )}
                <div className="space-y-2">
                  <Label>{mode === 'review' ? 'Review Notes (Optional)' : 'Approval Notes (Optional)'}</Label>
                  <Textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder={mode === 'review' ? 'Add observations here before submitting review…' : 'Add internal notes…'}
                    rows={2}
                    className="bg-background shadow-sm"
                  />
                </div>
                {mode === 'approve' && (
                  <div className="space-y-2">
                    <Label className="text-destructive font-semibold">Rejection Reason <span className="text-muted-foreground font-normal">(Required if rejecting)</span></Label>
                    <Textarea
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      placeholder="Explain to the customer why the request was rejected…"
                      rows={2}
                      className="bg-background shadow-sm border-destructive/30 focus-visible:ring-destructive/30"
                    />
                  </div>
                )}
                <div className="flex items-center justify-end gap-3 pt-4">
                  <Button variant="outline" onClick={() => router.back()} className="shadow-sm">
                    Cancel
                  </Button>
                  {mode === 'review' && (
                    <Button size="lg" onClick={handleReview} disabled={actionLoading} className="shadow-sm">
                      {actionLoading ? 'Submitting Review…' : 'Submit Review'}
                    </Button>
                  )}
                  {mode === 'approve' && (
                    <>
                      <Button size="lg" variant="destructive" onClick={() => handleApprove('reject')} disabled={actionLoading} className="shadow-sm">
                        {actionLoading ? 'Processing…' : 'Reject Request'}
                      </Button>
                      <Button size="lg" onClick={() => handleApprove('approve')} disabled={actionLoading} className="shadow-sm bg-emerald-600 hover:bg-emerald-700">
                        {actionLoading ? 'Processing…' : 'Approve & Link Account'}
                      </Button>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
