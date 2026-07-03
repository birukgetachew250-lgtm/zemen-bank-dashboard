
'use client';

import { useState } from 'react';
import { Download, Printer, ExternalLink, FileText, Image as ImageIcon, File, X, ZoomIn, ZoomOut } from 'lucide-react';
import { Button } from './button';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './dialog';

export interface DocumentMeta {
  name: string;
  url: string;
  type?: string;  // mime type
  size?: number;
  uploadedAt?: string;
}

interface DocumentViewerProps {
  documents: DocumentMeta[];
  className?: string;
}

function getDocIcon(type?: string) {
  if (!type) return <File className="h-5 w-5 text-muted-foreground" />;
  if (type.startsWith('image/')) return <ImageIcon className="h-5 w-5 text-blue-500" />;
  if (type === 'application/pdf') return <FileText className="h-5 w-5 text-red-500" />;
  return <File className="h-5 w-5 text-slate-500" />;
}

function formatSize(bytes?: number): string {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function isPreviewable(doc: DocumentMeta): boolean {
  const t = doc.type || '';
  return t.startsWith('image/') || t === 'application/pdf' || doc.url.match(/\.(jpg|jpeg|png|gif|webp|pdf)$/i) !== null;
}

export function DocumentViewer({ documents, className }: DocumentViewerProps) {
  const [selectedDoc, setSelectedDoc] = useState<DocumentMeta | null>(null);
  const [zoom, setZoom] = useState(1);

  if (!documents || documents.length === 0) return null;

  const handleDownload = (doc: DocumentMeta) => {
    const a = document.createElement('a');
    a.href = doc.url;
    a.download = doc.name;
    a.target = '_blank';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handlePrint = (doc: DocumentMeta) => {
    const printWindow = window.open(doc.url, '_blank');
    if (printWindow) {
      printWindow.addEventListener('load', () => {
        printWindow.print();
      });
    }
  };

  const isPdf = (doc: DocumentMeta) =>
    doc.type === 'application/pdf' || doc.url.toLowerCase().endsWith('.pdf');
  const isImage = (doc: DocumentMeta) =>
    (doc.type || '').startsWith('image/') || doc.url.match(/\.(jpg|jpeg|png|gif|webp)$/i);

  return (
    <div className={cn('space-y-3', className)}>
      <div className="flex items-center gap-2">
        <FileText className="h-4 w-4 text-muted-foreground" />
        <h4 className="text-sm font-semibold text-foreground">
          Supporting Documents ({documents.length})
        </h4>
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        {documents.map((doc, idx) => (
          <div
            key={idx}
            className={cn(
              'group flex items-center gap-3 rounded-xl border bg-card px-4 py-3',
              'transition-all duration-200 hover:shadow-md hover:border-primary/30'
            )}
          >
            <div className="flex-shrink-0">{getDocIcon(doc.type)}</div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{doc.name}</p>
              <div className="flex items-center gap-2 mt-0.5">
                {doc.size && <span className="text-xs text-muted-foreground">{formatSize(doc.size)}</span>}
                {doc.uploadedAt && (
                  <span className="text-xs text-muted-foreground">
                    · {new Date(doc.uploadedAt).toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
              {isPreviewable(doc) && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 rounded-lg"
                  onClick={() => { setSelectedDoc(doc); setZoom(1); }}
                  title="Preview"
                >
                  <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 rounded-lg"
                onClick={() => handleDownload(doc)}
                title="Download"
              >
                <Download className="h-3.5 w-3.5 text-muted-foreground" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 rounded-lg"
                onClick={() => handlePrint(doc)}
                title="Print"
              >
                <Printer className="h-3.5 w-3.5 text-muted-foreground" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Preview Dialog */}
      <Dialog open={!!selectedDoc} onOpenChange={() => setSelectedDoc(null)}>
        <DialogContent className="max-w-4xl w-full h-[90vh] flex flex-col p-0 overflow-hidden rounded-2xl">
          <DialogHeader className="flex flex-row items-center gap-3 px-4 py-3 border-b flex-shrink-0">
            <div className="flex-1 min-w-0">
              <DialogTitle className="text-sm font-semibold truncate">
                {selectedDoc?.name}
              </DialogTitle>
            </div>
            <div className="flex items-center gap-1">
              {selectedDoc && isImage(selectedDoc) && (
                <>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-lg"
                    onClick={() => setZoom(z => Math.max(0.5, z - 0.25))}
                  >
                    <ZoomOut className="h-4 w-4" />
                  </Button>
                  <span className="text-xs text-muted-foreground w-10 text-center">
                    {Math.round(zoom * 100)}%
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-lg"
                    onClick={() => setZoom(z => Math.min(3, z + 0.25))}
                  >
                    <ZoomIn className="h-4 w-4" />
                  </Button>
                </>
              )}
              {selectedDoc && (
                <>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-lg"
                    onClick={() => handleDownload(selectedDoc)}
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-lg"
                    onClick={() => handlePrint(selectedDoc)}
                  >
                    <Printer className="h-4 w-4" />
                  </Button>
                </>
              )}
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-lg"
                onClick={() => setSelectedDoc(null)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </DialogHeader>
          <div className="flex-1 overflow-auto flex items-start justify-center bg-muted/50 p-4">
            {selectedDoc && isPdf(selectedDoc) ? (
              <iframe
                src={selectedDoc.url}
                className="w-full h-full rounded-lg"
                title={selectedDoc.name}
              />
            ) : selectedDoc && isImage(selectedDoc) ? (
              <div className="overflow-auto flex items-center justify-center w-full h-full">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={selectedDoc.url}
                  alt={selectedDoc.name}
                  style={{ transform: `scale(${zoom})`, transformOrigin: 'center', transition: 'transform 0.2s ease' }}
                  className="max-w-full object-contain rounded-lg shadow-lg"
                />
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center gap-4 py-12">
                <File className="h-16 w-16 text-muted-foreground" />
                <div className="text-center">
                  <p className="text-sm font-medium">Preview not available</p>
                  <p className="text-xs text-muted-foreground mt-1">Download to view this file</p>
                </div>
                <Button
                  variant="outline"
                  onClick={() => selectedDoc && handleDownload(selectedDoc)}
                  className="rounded-xl"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download File
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
