'use client';

import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import {
  Upload,
  File,
  X,
  CheckCircle2,
  AlertCircle,
  FileText,
  Image as ImageIcon,
  FileSpreadsheet,
  Tag,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from './button';
import { Progress } from './progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './select';

export const KYC_DOCUMENT_CATEGORIES = [
  'National ID',
  'Passport',
  'Utility Bill',
  'Customer Application Form',
  'Other',
] as const;

export type KycDocumentCategory = (typeof KYC_DOCUMENT_CATEGORIES)[number];

export interface UploadedFile {
  name: string;
  size: number;
  type: string;
  url: string;
  localUrl?: string;
  category?: string;
}

interface FileUploadProps {
  value?: UploadedFile[];
  onChange?: (files: UploadedFile[]) => void;
  maxFiles?: number;
  maxSizeMB?: number;
  strictKycFormats?: boolean;
  enableCategory?: boolean;
  defaultCategory?: KycDocumentCategory;
  label?: string;
  required?: boolean;
  disabled?: boolean;
}

const DEFAULT_ACCEPTED_TYPES: Record<string, string[]> = {
  'application/pdf': ['.pdf'],
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
  'application/msword': ['.doc'],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
  'image/tiff': ['.tiff', '.tif'],
};

const STRICT_KYC_ACCEPTED_TYPES: Record<string, string[]> = {
  'application/pdf': ['.pdf'],
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
};

function getFileIcon(type: string) {
  if (type.startsWith('image/')) return <ImageIcon className="h-5 w-5 text-blue-500" />;
  if (type === 'application/pdf') return <FileText className="h-5 w-5 text-red-500" />;
  if (type.includes('word') || type.includes('doc'))
    return <FileSpreadsheet className="h-5 w-5 text-blue-600" />;
  return <File className="h-5 w-5 text-slate-500" />;
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export function FileUpload({
  value = [],
  onChange,
  maxFiles = 5,
  maxSizeMB = 5,
  strictKycFormats = false,
  enableCategory = true,
  defaultCategory = 'National ID',
  label = 'Supporting KYC Documents',
  required = false,
  disabled = false,
}: FileUploadProps) {
  const [uploading, setUploading] = useState<Record<string, number>>({});
  const [errors, setErrors] = useState<string[]>([]);
  const [pendingCategory, setPendingCategory] = useState<string>(defaultCategory);

  const acceptedMimeMap = strictKycFormats
    ? STRICT_KYC_ACCEPTED_TYPES
    : DEFAULT_ACCEPTED_TYPES;

  const onDrop = useCallback(
    async (accepted: File[], rejected: any[]) => {
      const newErrors: string[] = [];

      if (rejected.length > 0) {
        rejected.forEach((r) => {
          r.errors.forEach((e: any) => {
            if (e.code === 'file-too-large')
              newErrors.push(`${r.file.name}: exceeds ${maxSizeMB}MB limit`);
            else if (e.code === 'file-invalid-type')
              newErrors.push(
                `${r.file.name}: unsupported file format (accepted: ${
                  strictKycFormats ? 'PDF, JPG, PNG' : 'PDF, JPG, PNG, DOCX'
                })`
              );
            else newErrors.push(`${r.file.name}: ${e.message}`);
          });
        });
      }

      if (value.length + accepted.length > maxFiles) {
        newErrors.push(`Maximum ${maxFiles} files allowed`);
        setErrors(newErrors);
        return;
      }

      setErrors(newErrors);

      const newFiles: UploadedFile[] = [];

      for (const file of accepted) {
        const localUrl = URL.createObjectURL(file);
        setUploading((prev) => ({ ...prev, [file.name]: 0 }));

        try {
          const formData = new FormData();
          formData.append('file', file);

          const xhr = new XMLHttpRequest();

          const uploadPromise = new Promise<string>((resolve, reject) => {
            xhr.upload.addEventListener('progress', (event) => {
              if (event.lengthComputable) {
                const progress = Math.round((event.loaded / event.total) * 100);
                setUploading((prev) => ({ ...prev, [file.name]: progress }));
              }
            });

            xhr.addEventListener('load', () => {
              if (xhr.status >= 200 && xhr.status < 300) {
                try {
                  const response = JSON.parse(xhr.responseText);
                  if (response.success && response.url) {
                    resolve(response.url);
                  } else {
                    reject(new Error(response.error || 'Upload failed'));
                  }
                } catch {
                  reject(new Error('Invalid response'));
                }
              } else {
                reject(new Error('Upload failed'));
              }
            });

            xhr.addEventListener('error', () => reject(new Error('Network error')));
            xhr.addEventListener('abort', () => reject(new Error('Upload aborted')));

            xhr.open('POST', '/api/upload');
            xhr.send(formData);
          });

          const url = await uploadPromise;

          setUploading((prev) => {
            const next = { ...prev };
            delete next[file.name];
            return next;
          });

          newFiles.push({
            name: file.name,
            size: file.size,
            type: file.type,
            url,
            localUrl,
            category: pendingCategory || defaultCategory,
          });
        } catch (e: any) {
          setUploading((prev) => {
            const next = { ...prev };
            delete next[file.name];
            return next;
          });
          setErrors((prev) => [...prev, `Failed to upload ${file.name}: ${e.message}`]);
        }
      }

      onChange?.([...value, ...newFiles]);
    },
    [
      value,
      onChange,
      maxFiles,
      maxSizeMB,
      strictKycFormats,
      pendingCategory,
      defaultCategory,
    ]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: acceptedMimeMap,
    maxSize: maxSizeMB * 1024 * 1024,
    disabled,
    multiple: maxFiles > 1,
  });

  const removeFile = (idx: number) => {
    const next = [...value];
    if (next[idx].localUrl) URL.revokeObjectURL(next[idx].localUrl!);
    next.splice(idx, 1);
    onChange?.(next);
  };

  const updateFileCategory = (idx: number, category: string) => {
    const next = value.map((item, i) => (i === idx ? { ...item, category } : item));
    onChange?.(next);
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <label className="text-sm font-medium text-foreground">{label}</label>
          {required && <span className="text-sm text-destructive">*</span>}
        </div>
        <span className="text-xs text-muted-foreground">
          {strictKycFormats ? 'PDF, JPG, PNG' : 'PDF, JPG, PNG, DOCX'} · Max {maxSizeMB}MB per
          file · Up to {maxFiles} files
        </span>
      </div>

      {/* Default Category Selector for Next Upload */}
      {enableCategory && (
        <div className="flex flex-col gap-2 rounded-xl border border-border/70 bg-muted/20 p-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 text-xs font-medium text-foreground">
            <Tag className="h-3.5 w-3.5 text-primary" />
            <span>Document Category for Upload:</span>
          </div>
          <Select value={pendingCategory} onValueChange={setPendingCategory}>
            <SelectTrigger className="h-8 w-full rounded-lg text-xs sm:w-64">
              <SelectValue placeholder="Select document category" />
            </SelectTrigger>
            <SelectContent>
              {KYC_DOCUMENT_CATEGORIES.map((cat) => (
                <SelectItem key={cat} value={cat} className="text-xs">
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Drop zone */}
      <div
        {...getRootProps()}
        className={cn(
          'relative flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed px-6 py-7',
          'transition-all duration-200',
          isDragActive
            ? 'scale-[1.01] border-primary bg-primary/5'
            : 'border-border bg-muted/30 hover:border-primary/50 hover:bg-primary/[0.02]',
          disabled && 'cursor-not-allowed opacity-50'
        )}
      >
        <input {...getInputProps()} />
        <div
          className={cn(
            'flex h-12 w-12 items-center justify-center rounded-xl transition-all duration-200',
            isDragActive ? 'scale-110 bg-primary/15' : 'bg-muted'
          )}
        >
          <Upload
            className={cn(
              'h-6 w-6 transition-colors',
              isDragActive ? 'text-primary' : 'text-muted-foreground'
            )}
          />
        </div>
        <div className="text-center">
          <p className="text-sm font-medium text-foreground">
            {isDragActive ? 'Drop KYC files here' : 'Drag & drop or click to upload'}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Accepted formats: {strictKycFormats ? 'PDF, JPG, PNG' : 'PDF, JPG, PNG, DOC, DOCX'}{' '}
            (Max {maxSizeMB}MB per file)
          </p>
        </div>
      </div>

      {/* Upload progress */}
      {Object.entries(uploading).map(([name, progress]) => (
        <div
          key={name}
          className="flex items-center gap-3 rounded-xl border border-border bg-muted/30 px-4 py-3"
        >
          <File className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-medium text-foreground">{name}</p>
            <Progress value={progress} className="mt-1.5 h-1.5" />
          </div>
          <span className="flex-shrink-0 text-xs text-muted-foreground">{progress}%</span>
        </div>
      ))}

      {/* Uploaded files with per-file category selector */}
      {value.length > 0 && (
        <div className="space-y-2">
          {value.map((file, idx) => (
            <div
              key={`${file.name}-${idx}`}
              className="group flex flex-wrap items-center gap-3 rounded-xl border border-border bg-card px-4 py-3 transition-all hover:shadow-sm"
            >
              <div className="flex-shrink-0">{getFileIcon(file.type)}</div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-foreground">{file.name}</p>
                <p className="text-xs text-muted-foreground">{formatSize(file.size)}</p>
              </div>

              {enableCategory && (
                <div className="w-48">
                  <Select
                    value={file.category || defaultCategory}
                    onValueChange={(val) => updateFileCategory(idx, val)}
                  >
                    <SelectTrigger className="h-8 rounded-lg text-xs">
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                      {KYC_DOCUMENT_CATEGORIES.map((cat) => (
                        <SelectItem key={cat} value={cat} className="text-xs">
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-emerald-500" />
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                onClick={() => removeFile(idx)}
                type="button"
                aria-label={`Remove ${file.name}`}
              >
                <X className="h-3.5 w-3.5" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Errors */}
      {errors.length > 0 && (
        <div className="space-y-1.5">
          {errors.map((err, i) => (
            <div key={i} className="flex items-center gap-2 text-xs text-destructive">
              <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
              <span>{err}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
