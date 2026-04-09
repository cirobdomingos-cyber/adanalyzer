"use client";

import { useCallback } from "react";
import { useDropzone } from "react-dropzone";

interface ImageUploadProps {
  file: File | null;
  preview: string | null;
  onFileChange: (file: File, preview: string) => void;
  onClear: () => void;
}

export function ImageUpload({
  file,
  preview,
  onFileChange,
  onClear,
}: ImageUploadProps) {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const dropped = acceptedFiles[0];
      if (!dropped) return;
      const url = URL.createObjectURL(dropped);
      onFileChange(dropped, url);
    },
    [onFileChange]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/jpeg": [],
      "image/png": [],
      "image/webp": [],
      "image/gif": [],
    },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024,
  });

  if (preview && file) {
    return (
      <div className="relative">
        <div className="relative w-full overflow-hidden rounded-xl border border-gray-200 bg-gray-50">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={preview}
            alt="Ad creative preview"
            className="mx-auto max-h-64 w-auto object-contain p-2"
          />
        </div>
        <div className="mt-2 flex items-center justify-between">
          <span className="text-xs text-gray-500 truncate max-w-[200px]">
            {file.name}
          </span>
          <button
            type="button"
            onClick={onClear}
            className="text-xs text-red-500 hover:text-red-700 transition-colors ml-2 shrink-0"
          >
            Remove
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      {...getRootProps()}
      aria-label="Upload ad creative image"
      className={`
        flex cursor-pointer flex-col items-center justify-center gap-3
        rounded-xl border-2 border-dashed p-10 text-center transition-colors
        ${
          isDragActive
            ? "border-primary bg-primary-light"
            : "border-gray-200 bg-gray-50 hover:border-primary hover:bg-primary-light"
        }
      `}
    >
      <input {...getInputProps()} />
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-sm">
        <svg
          className={`h-6 w-6 ${isDragActive ? "text-primary" : "text-gray-400"}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
          />
        </svg>
      </div>
      {isDragActive ? (
        <p className="text-sm font-medium text-primary">Drop the image here</p>
      ) : (
        <>
          <p className="text-sm font-medium text-gray-700">
            Drag your ad creative or{" "}
            <span className="text-primary">click to select</span>
          </p>
          <p className="text-xs text-gray-400">PNG, JPG, WebP — up to 10MB</p>
        </>
      )}
    </div>
  );
}
