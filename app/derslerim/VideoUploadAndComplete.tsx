import React, { useRef, useState } from 'react';

interface VideoUploadAndCompleteProps {
  lessonId: string;
  onComplete: (videoUrl: string) => Promise<void>;
  disabled?: boolean;
}

const VideoUploadAndComplete: React.FC<VideoUploadAndCompleteProps> = ({ lessonId, onComplete, disabled }) => {
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === 'video/mp4') {
      setVideoFile(file);
      setError('');
    } else {
      setError('Lütfen sadece mp4 formatında bir video yükleyin.');
      setVideoFile(null);
    }
  };

  const handleUploadAndComplete = async () => {
    if (!videoFile) {
      setError('Lütfen bir mp4 video seçin.');
      return;
    }
    setUploading(true);
    setError('');
    setSuccess('');
    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64Video = reader.result as string;
        console.log('FileReader onload tetiklendi');
        console.log('lessonId:', lessonId);
        console.log('base64Video (ilk 30):', base64Video?.substring(0, 30));
        if (!base64Video) {
          setError('Video okunamadı, lütfen tekrar deneyin.');
          setUploading(false);
          return;
        }
        const response = await fetch('/api/lessons/upload-video', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ lessonId, base64Video })
        });
        if (!response.ok) {
          setError('Video yüklenirken bir hata oluştu.');
          setUploading(false);
          return;
        }
        setSuccess('Video başarıyla yüklendi ve e-posta ile gönderildi.');
        setUploading(false);
        if (onComplete) await onComplete(base64Video);
      };
      reader.onerror = (e) => {
        console.error('FileReader error:', e);
        setError('Video okunurken hata oluştu.');
        setUploading(false);
      };
      reader.readAsDataURL(videoFile);
      console.log('FileReader readAsDataURL çağrıldı:', videoFile);
    } catch (err) {
      setError('Video yüklenirken bir hata oluştu.');
      setUploading(false);
    }
  };

  return (
    <div className="mb-4">
      <label className="block font-medium mb-2">Dersi tamamlamak için mp4 video yükleyin</label>
      <input
        type="file"
        accept="video/mp4"
        ref={fileInputRef}
        onChange={handleFileChange}
        disabled={uploading || disabled}
        className="mb-2"
      />
      {error && <div className="text-red-500 text-sm mb-2">{error}</div>}
      {success && <div className="text-green-600 text-sm mb-2">{success}</div>}
      <button
        type="button"
        onClick={handleUploadAndComplete}
        disabled={uploading || !videoFile || disabled}
        className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-all"
      >
        {uploading ? 'Yükleniyor...' : 'Videoyu Yükle ve Dersi Tamamla'}
      </button>
    </div>
  );
};

export default VideoUploadAndComplete;
