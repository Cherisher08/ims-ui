import React, { useRef } from 'react';
import { Button, Box, Typography } from '@mui/material';
import { FiUpload } from 'react-icons/fi';
import { MdClose } from 'react-icons/md';

interface CustomFileInputProps {
  label: string;
  onChange: (file: File | null) => void;
  accept?: string;
  className?: string;
  error?: boolean;
  helperText?: string;
  disabled?: boolean;
  value?: File | null;
  existingFilePath?: string | null;
}

const CustomFileInput: React.FC<CustomFileInputProps> = ({
  label,
  onChange,
  accept = '.pdf',
  className = '',
  error = false,
  helperText = '',
  disabled = false,
  value = null,
  existingFilePath = null,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    onChange(file);
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemoveFile = () => {
    onChange(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const hasExistingFile = existingFilePath && !value;

  return (
    <div className={`flex flex-col min-w-fit ${className}`}>
      <label className="w-full line-clamp-2 break-words">{label}</label>
      {!value && !hasExistingFile ? (
        <Button
          variant="outlined"
          onClick={handleButtonClick}
          disabled={disabled}
          startIcon={<FiUpload />}
          sx={{
            borderColor: error ? 'error.main' : 'primary.main',
            color: error ? 'error.main' : 'primary.main',
            '&:hover': {
              borderColor: error ? 'error.main' : 'primary.main',
              backgroundColor: error ? 'error.light' : 'primary.light',
            },
          }}
        >
          Choose File
        </Button>
      ) : (
        <Box
          sx={{
            border: '1px solid',
            borderColor: 'success.main',
            borderRadius: 1,
            p: 1,
            backgroundColor: 'success.light',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Box sx={{ flex: 1 }}>
            <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'success.dark' }}>
              {value ? value.name : existingFilePath?.split('/').pop() || 'Existing File'}
            </Typography>
            <Typography variant="caption" sx={{ color: 'success.dark' }}>
              {value ? `${(value.size / 1024).toFixed(2)} KB` : 'Existing file'}
            </Typography>
          </Box>
          <Button
            size="small"
            onClick={handleRemoveFile}
            sx={{ minWidth: 'auto', p: 0.5, color: 'error.main' }}
          >
            <MdClose size={16} />
          </Button>
        </Box>
      )}
      {helperText && (
        <p className={`text-sm mt-1 ${error ? 'text-red-500' : 'text-gray-500'}`}>{helperText}</p>
      )}
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />
    </div>
  );
};

export default CustomFileInput;
