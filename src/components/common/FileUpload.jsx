import { useRef } from 'react'
import { Upload, FileText } from 'lucide-react'

export default function FileUpload({
  file,
  onFileChange,
  onRemove,
  accept = '.pdf,.jpg,.jpeg,.png',
  label = 'Upload Proof for verification',
  className = '',
}) {
  const fileInputRef = useRef(null)

  return (
    <div className={`mt-1.5 ${className}`}>
      {file ? (
        <div className="flex items-center gap-2 text-sm font-body">
          <FileText className="h-4 w-4 text-[#6d5ed6]" />
          <span className="text-[#4f4f4f] truncate max-w-[160px]">{file.name}</span>
          <button
            onClick={onRemove}
            className="text-red-500 hover:text-red-700 font-medium cursor-pointer"
          >
            Remove
          </button>
        </div>
      ) : (
        <button
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-1.5 text-xs text-[#6d5ed6] font-medium font-body hover:text-[#5b4ec4] cursor-pointer"
        >
          <Upload className="h-4 w-4" />
          {label}
        </button>
      )}
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        onChange={(e) => onFileChange(e.target.files?.[0] || null)}
        accept={accept}
      />
    </div>
  )
}
