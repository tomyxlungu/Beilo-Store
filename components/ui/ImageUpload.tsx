'use client';

import { useRef, useState } from 'react';
import { ImagePlus, Loader2, RefreshCw, X } from 'lucide-react';
import { supabaseBrowser as supabase } from '@/lib/supabase/client';

const ACCEPT = 'image/jpeg,image/png,image/webp,image/gif';
const MAX_BYTES = 5 * 1024 * 1024; // matches the product-images bucket limit

interface ImageUploadProps {
  /** Current image URL ('' = none). Works with storage URLs and local paths. */
  value: string;
  onChange: (url: string) => void;
  /** Storage folder, e.g. 'homepage'. Defaults to 'admin'. */
  pathPrefix?: string;
  label?: string;
  hint?: string;
  /** Compact 64px thumbnail button for table/row use. */
  compact?: boolean;
}

/**
 * Upload-an-image-from-your-machine field for the admin console.
 * Uploads to the public product-images bucket (same flow as product
 * photos), shows a preview, and lets you replace or remove it.
 */
export default function ImageUpload({
  value,
  onChange,
  pathPrefix = 'admin',
  label,
  hint,
  compact = false,
}: ImageUploadProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  async function handleFile(file: File | undefined) {
    if (!file) return;
    setError('');

    if (!ACCEPT.split(',').includes(file.type)) {
      setError('Please choose a JPG, PNG, WebP or GIF image.');
      return;
    }
    if (file.size > MAX_BYTES) {
      setError('Image is too big — 5MB max.');
      return;
    }

    setUploading(true);
    try {
      const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
      const path = `${pathPrefix}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(path, file);
      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from('product-images').getPublicUrl(path);
      onChange(data.publicUrl);
    } catch (err: any) {
      setError(err?.message || 'Upload failed. Please try again.');
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  }

  const openPicker = () => fileRef.current?.click();

  if (compact) {
    return (
      <div style={{ flexShrink: 0 }}>
        <input
          ref={fileRef}
          type="file"
          accept={ACCEPT}
          onChange={(e) => handleFile(e.target.files?.[0])}
          style={{ display: 'none' }}
          aria-label={label || 'Upload image'}
        />
        <button
          type="button"
          onClick={openPicker}
          disabled={uploading}
          aria-label={value ? 'Replace image' : label || 'Upload image'}
          title={value ? 'Replace image' : label || 'Upload image'}
          style={{
            width: 64,
            height: 64,
            minWidth: 64,
            borderRadius: 10,
            border: '1.5px dashed var(--cloud-veil)',
            background: value ? `center/cover url("${value}")` : 'var(--canvas)',
            cursor: uploading ? 'wait' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--ironclad-grey)',
            padding: 0,
          }}
        >
          {!value &&
            (uploading ? <Loader2 size={20} style={{ animation: 'spin 1s linear infinite' }} /> : <ImagePlus size={20} />)}
        </button>
        {error && (
          <p role="alert" style={{ fontSize: 11, color: '#dc2626', marginTop: 4, maxWidth: 120 }}>{error}</p>
        )}
      </div>
    );
  }

  return (
    <div>
      {label && (
        <span style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>
          {label}
        </span>
      )}
      <input
        ref={fileRef}
        type="file"
        accept={ACCEPT}
        onChange={(e) => handleFile(e.target.files?.[0])}
        style={{ display: 'none' }}
        aria-label={label || 'Upload image'}
      />

      {value ? (
        <div style={{ position: 'relative', borderRadius: 12, overflow: 'hidden', border: '1px solid var(--cloud-veil)' }}>
          <img
            src={value}
            alt=""
            style={{ width: '100%', maxHeight: 180, objectFit: 'cover', display: 'block' }}
          />
          <div style={{ position: 'absolute', top: 8, right: 8, display: 'flex', gap: 8 }}>
            <button
              type="button"
              onClick={openPicker}
              disabled={uploading}
              aria-label="Replace image"
              title="Replace image"
              style={{
                minWidth: 44, minHeight: 44, borderRadius: 10, border: 'none',
                background: 'rgba(0,0,0,0.6)', color: '#fff', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              {uploading ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <RefreshCw size={16} />}
            </button>
            <button
              type="button"
              onClick={() => onChange('')}
              disabled={uploading}
              aria-label="Remove image"
              title="Remove image"
              style={{
                minWidth: 44, minHeight: 44, borderRadius: 10, border: 'none',
                background: 'rgba(0,0,0,0.6)', color: '#fff', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              <X size={16} />
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={openPicker}
          disabled={uploading}
          style={{
            width: '100%',
            padding: 28,
            borderRadius: 12,
            border: '1.5px dashed var(--cloud-veil)',
            background: 'var(--canvas)',
            cursor: uploading ? 'wait' : 'pointer',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
            color: 'var(--ironclad-grey)', fontSize: 13, fontWeight: 500, fontFamily: 'inherit',
          }}
        >
          {uploading ? (
            <>
              <Loader2 size={24} style={{ animation: 'spin 1s linear infinite' }} />
              <span>Uploading…</span>
            </>
          ) : (
            <>
              <ImagePlus size={24} strokeWidth={1.5} />
              <span>Click to upload from your machine</span>
              <span style={{ fontSize: 11, color: 'var(--moonlit-silver)' }}>
                JPG, PNG, WebP or GIF · 5MB max
              </span>
            </>
          )}
        </button>
      )}

      {hint && !error && (
        <p style={{ fontSize: 12, color: 'var(--ironclad-grey)', marginTop: 6 }}>{hint}</p>
      )}
      {error && (
        <p role="alert" style={{ fontSize: 12, color: '#dc2626', marginTop: 6 }}>{error}</p>
      )}
    </div>
  );
}
