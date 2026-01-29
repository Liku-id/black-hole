import DeleteIcon from '@mui/icons-material/Delete';
import { Box, IconButton, LinearProgress } from '@mui/material';
import Image from 'next/image';
import { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';

import { 
    Button,
    Body2
} from '@/components/common';
import CustomModal from '@/components/common/modal';

interface UploadCSVModalProps {
  open: boolean;
  onClose: () => void;
  onUpload: (file: File) => void;
  loading?: boolean;
}

export const UploadCSVModal = ({
  open,
  onClose,
  onUpload,
  loading = false
}: UploadCSVModalProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isSimulatingUpload, setIsSimulatingUpload] = useState(false);
  
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const selectedFile = acceptedFiles[0];
      // Check file type
      if (selectedFile.type !== 'text/csv' && !selectedFile.name.endsWith('.csv')) {
         setError('Did not have CSV format? download CSV template');
         setFile(null);
         return;
      }
      
      // Check size (max 10MB)
      if (selectedFile.size > 10 * 1024 * 1024) {
          setError('your file size is too large!');
          setFile(null);
          return;
      }

      setError(null);
      setFile(selectedFile);
      setIsSimulatingUpload(true);
      setUploadProgress(0);
    }
  }, []);

  // Simulate upload progress
  useEffect(() => {
    if (isSimulatingUpload) {
      const timer = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 100) {
            clearInterval(timer);
            setIsSimulatingUpload(false);
            return 100;
          }
          return prev + 10;
        });
      }, 200);
      return () => clearInterval(timer);
    }
  }, [isSimulatingUpload]);

  // Reset state when modal opens
  useEffect(() => {
    if (open) {
      setFile(null);
      setError(null);
      setUploadProgress(0);
      setIsSimulatingUpload(false);
    }
  }, [open]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop,
    accept: {
        'text/csv': ['.csv']
    },
    maxFiles: 1,
    multiple: false,
    disabled: isSimulatingUpload || loading
  });

  const handleRemoveFile = () => {
      setFile(null);
      setError(null);
      setUploadProgress(0);
      setIsSimulatingUpload(false);
  };

  const handleSubmit = () => {
      if (!file) {
          setError('Upload file or drag file first!');
          return;
      }
      onUpload(file);
  };

  const handleClose = () => {
      setFile(null);
      setError(null);
      setUploadProgress(0);
      setIsSimulatingUpload(false);
      onClose();
  }

  return (
    <CustomModal
      open={open}
      onClose={handleClose}
      title="Upload CSV"
      width={600}
      height="auto"
    >
      <Box mt={2}>
        {!file ? (
            <Box
                {...getRootProps()}
                sx={{
                    border: error ? '1px solid #D32F2F' : '1px dashed #E0E0E0',
                    borderRadius: '8px',
                    padding: '40px',
                    textAlign: 'center',
                    cursor: 'pointer',
                    backgroundColor: '#FAFAFA',
                    '&:hover': {
                        borderColor: error ? '#D32F2F' : 'primary.main',
                        backgroundColor: '#F5F5F5'
                    },
                    ...(isDragActive && {
                        borderColor: 'primary.main',
                        backgroundColor: '#E3F2FD'
                    }),
                    ...(error && {
                        borderColor: '#D32F2F',
                        backgroundColor: '#FFEBEE'
                    })
                }}
            >
                <input {...getInputProps()} />
                <Image src="/icon/upload.svg" alt="upload" width={25} height={25} style={{ marginBottom: '16px' }} />
                <Body2 color="text.secondary" display="block">
                    Select CSV file to upload or drag and drop it here!
                </Body2>
                <Body2 color="text.secondary" display="block" fontSize="12px">
                    CSV, XLS, XLSX. File size max 10 mb
                </Body2>
            </Box>
        ) : (
            <Box
                sx={{
                    border: '1px solid #E0E0E0',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '32px 24px'
                }}
            >
                {/* File Details & Progress */}
                <Box flex={1}>
                    <Box display="flex" justifyContent="space-between" mb={1} alignItems="center">
                        <Box display="flex" alignItems="center" gap={1}>
                            <Box 
                                sx={{ 
                                    width: 24, 
                                    height: 24, 
                                    bgcolor: 'primary.main',
                                    mask: 'url(/icon/file.svg) no-repeat center / contain',
                                    WebkitMask: 'url(/icon/file.svg) no-repeat center / contain'
                                }} 
                            />
                            <Body2>{file.name}</Body2>
                        </Box>
                        {isSimulatingUpload ? (
                             <Body2 color="text.secondary" fontSize="12px">
                                 ({uploadProgress}% complete) {(file.size / 1024 / 1024).toFixed(1)} mb
                             </Body2>
                        ) : (
                             <Body2 color="text.secondary" fontSize="12px">
                                 {(file.size / 1024 / 1024).toFixed(1)} mb
                             </Body2>
                        )}
                    </Box>
                    
                    {isSimulatingUpload ? (
                        <>
                           <LinearProgress 
                               variant="determinate" 
                               value={uploadProgress} 
                               sx={{ height: 8, borderRadius: 4 }} 
                           />
                           <Box display="flex" justifyContent="center" mt={1}>
                               <Body2 fontSize="12px" color="text.secondary">Uploading...</Body2>
                           </Box>
                        </>
                    ) : (
                         // Done state - show ready status, nothing extra needed here as action buttons are below
                         null
                    )}
                    
                    {loading && <LinearProgress variant="indeterminate" sx={{ height: 8, borderRadius: 4, mt: 1 }} />}
                </Box>
                
                {/* Actions */}
                {!isSimulatingUpload && !loading && (
                    <IconButton onClick={handleRemoveFile} sx={{ ml: 1 }}>
                        <DeleteIcon color="error" />
                    </IconButton>
                )}
            </Box>
        )}

        {error && (
            <Body2 color="error.main" mt={1} fontSize="12px">
                {error}
            </Body2>
        )}
        
        {!file && (
             <Box mt={1}>
               <Body2 color="text.secondary" component="span" fontSize="12px">Did not have CSV format? </Body2>
               <Body2 
                 color="primary.main" 
                 component="span" 
                 fontSize="12px" 
                 sx={{ cursor: 'pointer', textDecoration: 'none' }}
                 onClick={(e) => {
                     e.stopPropagation();
                     // Logic to download template
                     const csvContent = "Full name,Ticket Type,Ticket Qty,E-mail,Phone number\nJohn Doe,VIP,1,john@example.com,+628123456789";
                     const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                     const link = document.createElement("a");
                     if (link.download !== undefined) {
                         const url = URL.createObjectURL(blob);
                         link.setAttribute("href", url);
                         link.setAttribute("download", "invitation_template.csv");
                         link.style.visibility = 'hidden';
                         document.body.appendChild(link);
                         link.click();
                         document.body.removeChild(link);
                     }
                 }}
               >
                 download CSV template
               </Body2>
             </Box>
        )}

        <Box display="flex" justifyContent="flex-end" gap={2} mt={3}>
            <Button 
                variant="secondary" 
                onClick={handleClose}
                disabled={loading || isSimulatingUpload}
                sx={{ width: '100px' }}
            >
                Cancel
            </Button>
            <Button 
                onClick={handleSubmit} 
                disabled={!file || loading || isSimulatingUpload}
                sx={{ width: '100px' }}
            >
                {loading ? '...' : 'Next'}
            </Button>
        </Box>
      </Box>
    </CustomModal>
  );
};
