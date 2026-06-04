import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { UploadCloud, FileText, X, AlertCircle, Loader2 } from 'lucide-react';

const Upload = () => {
  const [file, setFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingPhase, setLoadingPhase] = useState('');
  
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  // Array of phases to show during backend AI calls
  const analysisPhases = [
    'Uploading document securely...',
    'Parsing PDF text layers...',
    'Analyzing content matching rules...',
    'Consulting Gemini AI reviewer...',
    'Calculating ATS metrics...',
    'Finalizing suggestions report...',
  ];

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const validateFile = (selectedFile) => {
    setError('');
    if (!selectedFile) return false;

    // Check file type
    if (selectedFile.type !== 'application/pdf' && !selectedFile.name.endsWith('.pdf')) {
      setError('Only PDF resumes are supported.');
      return false;
    }

    // Check size limit: 5MB
    if (selectedFile.size > 5 * 1024 * 1024) {
      setError('File size exceeds the 5MB limit.');
      return false;
    }

    return true;
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (validateFile(droppedFile)) {
        setFile(droppedFile);
      }
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (validateFile(selectedFile)) {
        setFile(selectedFile);
      }
    }
  };

  const removeFile = () => {
    setFile(null);
    setError('');
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  const handleSubmit = async () => {
    if (!file) return;

    setLoading(true);
    setLoadingPhase(analysisPhases[0]);

    // Cycle through phases to show progress updates
    let phaseIndex = 0;
    const interval = setInterval(() => {
      if (phaseIndex < analysisPhases.length - 1) {
        phaseIndex++;
        setLoadingPhase(analysisPhases[phaseIndex]);
      }
    }, 1800);

    const formData = new FormData();
    formData.append('resume', file);

    try {
      const response = await api.post('/resume/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      clearInterval(interval);
      // Success: redirect to result details
      navigate(`/result/${response.data._id}`);
    } catch (err) {
      clearInterval(interval);
      setError(err.response?.data?.message || 'Error occurred while scanning your resume.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-dark-bg px-4 py-12 relative">
      {/* Background Glow */}
      <div className="absolute top-1/4 left-1/4 -z-10 h-72 w-72 rounded-full bg-primary/10 blur-3xl opacity-20"></div>

      {loading ? (
        /* Immersive Loading Overlay */
        <div className="text-center space-y-6 max-w-sm w-full p-8 glass-panel border border-white/5 rounded-2xl animate-pulse">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-4 relative">
            <Loader2 className="h-8 w-8 animate-spin" />
            <div className="absolute inset-0 border border-primary/20 rounded-2xl animate-ping opacity-75"></div>
          </div>
          <h2 className="text-xl font-bold text-white">Analyzing Resume</h2>
          <p className="text-slate-400 text-sm leading-relaxed min-h-[40px] transition-all">
            {loadingPhase}
          </p>
          <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
            <div className="bg-gradient-to-r from-primary to-secondary h-1.5 rounded-full animate-infinite-loading" style={{ width: '45%' }}></div>
          </div>
        </div>
      ) : (
        /* Standard Dropzone Upload Interface */
        <div className="w-full max-w-xl glass-panel p-8 sm:p-10 rounded-2xl border border-white/5 shadow-2xl relative">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-white">Upload Resume</h2>
            <p className="text-slate-400 text-sm mt-1">Scan your CV and find missing technical keywords</p>
          </div>

          {error && (
            <div className="mb-6 rounded-lg bg-red-500/10 border border-red-500/20 p-4 text-sm text-red-400 flex items-center gap-2">
              <AlertCircle className="h-5 w-5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Drag & Drop Area */}
          {!file ? (
            <div
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              onClick={triggerFileInput}
              className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all duration-300 ${
                dragActive
                  ? 'border-primary bg-primary/5 scale-[0.99]'
                  : 'border-white/10 bg-white/5 hover:border-primary/50 hover:bg-white/10'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept=".pdf"
                onChange={handleFileChange}
              />
              <div className="mx-auto w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4 transition-transform group-hover:scale-105">
                <UploadCloud className="h-6 w-6" />
              </div>
              <p className="text-sm font-semibold text-slate-200">
                Drag and drop your PDF resume here
              </p>
              <p className="text-xs text-slate-400 mt-2">
                PDF format only, maximum file size 5MB
              </p>
            </div>
          ) : (
            /* Selected File Display card */
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5 flex items-center justify-between gap-4 mb-8">
              <div className="flex items-center gap-3 min-w-0">
                <div className="p-3 rounded-xl bg-primary/10 text-primary shrink-0">
                  <FileText className="h-6 w-6" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-200 truncate pr-2" title={file.name}>
                    {file.name}
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    {(file.size / (1024 * 1024)).toFixed(2)} MB
                  </p>
                </div>
              </div>
              
              <button
                onClick={removeFile}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
                title="Remove file"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          )}

          {/* Action buttons */}
          {file && (
            <button
              onClick={handleSubmit}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary to-secondary py-3.5 text-sm font-semibold text-white shadow-lg shadow-primary/20 hover:opacity-95 hover:scale-[1.01] transition-all cursor-pointer"
            >
              <UploadCloud className="h-4 w-4" />
              <span>Analyze Resume</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default Upload;
