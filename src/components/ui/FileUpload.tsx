
'use client';

import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, File, X, CheckCircle2, AlertCircle, FileText, Image as ImageIcon, FileSpreadsheet } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from './button';
import { Progress } from './progress';

export interface UploadedFile {
  name: string;
  size: number;
  type: string;
  url: string;       // final URL after upload (Firebase or local)
  localUrl?: string; // preview blob URL
}

interface FileUploadProps {
  value?: UploadedFile[];
  onChange?: (files: UploadedFile[]) => void;
  maxFiles?: number;
  maxSizeMB?: number;
  accept?: string[];
  label?: string;
  required?: boolean;
  disabled?: boolean;
}

const ACCEPTED_TYPES: Record<string, string[]> = {
  'application/pdf': ['.pdf'],
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
  'application/msword': ['.doc'],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
  'image/tiff': ['.tiff', '.tif'],
};

function getFileIcon(type: string) {
  if (type.startsWith('image/')) return <ImageIcon className="h-5 w-5 text-blue-500" />;
  if (type === 'application/pdf') return <FileText className="h-5 w-5 text-red-500" />;
  if (type.includes('word') || type.includes('doc')) return <FileSpreadsheet className="h-5 w-5 text-blue-600" />;
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
  maxSizeMB = 10,
  label = 'Supporting Documents',
  required = false,
  disabled = false,
}: FileUploadProps) {
  const [uploading, setUploading] = useState<Record<string, number>>({});
  const [errors, setErrors] = useState<string[]>([]);

  const onDrop = useCallback(
    async (accepted: File[], rejected: any[]) => {
      const newErrors: string[] = [];

      if (rejected.length > 0) {
        rejected.forEach(r => {
          r.errors.forEach((e: any) => {
            if (e.code === 'file-too-large') newErrors.push(`${r.file.name}: exceeds ${maxSizeMB}MB limit`);
            else if (e.code === 'file-invalid-type') newErrors.push(`${r.file.name}: unsupported file type`);
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

        // Simulate upload progress (in production, replace with Firebase Storage upload)
        setUploading(prev => ({ ...prev, [file.name]: 0 }));

        try {
          // Simulate upload with progress
          await new Promise<void>(resolve => {
            let progress = 0;
            const interval = setInterval(() => {
              progress += Math.random() * 30 + 10;
              if (progress >= 100) {
                progress = 100;
                clearInterval(interval);
                setUploading(prev => {
                  const next = { ...prev };
                  delete next[file.name];
                  return next;
                });
                resolve();
              } else {
                setUploading(prev => ({ ...prev, [file.name]: Math.floor(progress) }));
              }
            }, 150);
          });

          // In production: upload to Firebase Storage and get URL
          // const storageRef = ref(storage, `documents/${Date.now()}_${file.name}`);
          // const snapshot = await uploadBytes(storageRef, file);
          // const url = await getDownloadURL(snapshot.ref);

          newFiles.push({
            name: file.name,
            size: file.size,
            type: file.type,
            url: localUrl, // Replace with Firebase URL in production
            localUrl,
          });
        } catch {
          setErrors(prev => [...prev, `Failed to upload ${file.name}`]);
        }
      }

      onChange?.([...value, ...newFiles]);
    },
    [value, onChange, maxFiles, maxSizeMB]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ACCEPTED_TYPES,
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

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-1.5">
        <label className="text-sm font-medium text-foreground">
          {label}
        </label>
        {required && <span className="text-destructive text-sm">*</span>}
        <span className="text-xs text-muted-foreground ml-auto">
          PDF, JPG, PNG, DOCX · max {maxSizeMB}MB · up to {maxFiles} files
        </span>
      </div>

      {/* Drop zone */}
      <div
        {...getRootProps()}
        className={cn(
          'relative flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed px-6 py-8 cursor-pointer',
          'transition-all duration-200',
          isDragActive
            ? 'border-primary bg-primary/5 scale-[1.01]'
            : 'border-border hover:border-primary/50 hover:bg-primary/2 bg-muted/30',
          disabled && 'opacity-50 cursor-not-allowed'
        )}
      >
        <input {...getInputProps()} />
        <div
          className={cn(
            'w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-200',
            isDragActive ? 'bg-primary/15 scale-110' : 'bg-muted'
          )}
        >
          <Upload className={cn('h-6 w-6 transition-colors', isDragActive ? 'text-primary' : 'text-muted-foreground')} />
        </div>
        <div className="text-center">
          <p className="text-sm font-medium text-foreground">
            {isDragActive ? 'Drop files here' : 'Drag & drop or click to upload'}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Supported: PDF, JPG, PNG, DOC, DOCX
          </p>
        </div>
      </div>

      {/* Upload progress */}
      {Object.entries(uploading).map(([name, progress]) => (
        <div key={name} className="flex items-center gap-3 rounded-xl border bg-muted/30 px-4 py-3">
          <File className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium truncate">{name}</p>
            <Progress value={progress} className="h-1.5 mt-1.5" />
          </div>
          <span className="text-xs text-muted-foreground flex-shrink-0">{progress}%</span>
        </div>
      ))}

      {/* Uploaded files */}
      {value.length > 0 && (
        <div className="space-y-2">
          {value.map((file, idx) => (
            <div
              key={`${file.name}-${idx}`}
              className="flex items-center gap-3 rounded-xl border bg-card px-4 py-3 transition-all hover:shadow-sm group"
            >
              <div className="flex-shrink-0">{getFileIcon(file.type)}</div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{file.name}</p>
                <p className="text-xs text-muted-foreground">{formatSize(file.size)}</p>
              </div>
              <CheckCircle2 className="h-4 w-4 text-emerald-500 flex-shrink-0 group-hover:hidden" />
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 rounded-lg hidden group-hover:flex text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                onClick={() => removeFile(idx)}
                type="button"
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
