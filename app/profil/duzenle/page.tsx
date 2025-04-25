'use client';

import { useState, useEffect } from 'react';
import Cropper from 'react-easy-crop';
import Modal from 'react-modal';
import getCroppedImg from './utils/cropImage'; // Kırpma yardımcı fonksiyonu (aşağıda eklenecek)
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function ProfileEditPage() {
  // --- Crop modal state ---
  const [showCropModal, setShowCropModal] = useState(false);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
  const { user, loading, setUser } = useAuth();
  const router = useRouter();
  
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login');
      return;
    }
    
    if (user) {
      // Mevcut kullanıcı bilgilerini form alanlarına doldur
      setProfilePhoto((user as any).profilePhotoUrl || null);
    }
  }, [user, loading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      setError('Kullanıcı bilgisi bulunamadı');
      return;
    }
    
    try {
      setIsSubmitting(true);
      setError('');
      setSuccess('');
      
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Oturum bilgisi bulunamadı');
        return;
      }
      
      let uploadedPhotoUrl = profilePhoto;
      // Eğer yeni bir fotoğraf seçildiyse ve base64 ise upload et
      if (profilePhoto && profilePhoto.startsWith('data:')) {
        const uploadRes = await fetch('/api/upload/profile-photo', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            image: profilePhoto,
            userId: user.id
          })
        });
        const uploadData = await uploadRes.json();
        if (!uploadRes.ok) throw new Error(uploadData.error || 'Fotoğraf yüklenemedi');
        uploadedPhotoUrl = uploadData.url;
        // Fotoğraf yüklendikten sonra state'i sadece URL ile güncelle
        setProfilePhoto(uploadData.url);
      }

      const response = await fetch('/api/auth/update-profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          userId: user.id,
          profilePhotoUrl: uploadedPhotoUrl && !uploadedPhotoUrl.startsWith('data:') ? uploadedPhotoUrl : undefined
        })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Profil güncellenirken bir hata oluştu');
      }
      
      // Kullanıcı bilgilerini güncelle
      setUser(data.user);
      
      // LocalStorage'daki kullanıcı bilgilerini güncelle
      localStorage.setItem('user', JSON.stringify(data.user));
      
      setSuccess('Profil bilgileriniz başarıyla güncellendi');
      
      // 2 saniye sonra profil sayfasına yönlendir
      setTimeout(() => {
        router.push('/profil');
      }, 2000);
      
    } catch (err: any) {
      console.error('Profil güncelleme hatası:', err);
      setError(err.message || 'Profil güncellenirken bir hata oluştu');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FFF5F0] pt-20">
        <div className="max-w-4xl mx-auto px-6">
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-[#FFE5D9]">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FFB996]"></div>
              <span className="ml-3 text-[#994D1C]">Yükleniyor...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#FFF5F0] pt-20">
      <div className="max-w-4xl mx-auto px-6">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-[#FFE5D9]">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-[#6B3416]">Profil Düzenle</h1>
            <Link 
              href="/profil" 
              className="px-4 py-2 bg-gray-100 text-[#6B3416] rounded-lg hover:bg-gray-200 transition-colors"
            >
              Vazgeç
            </Link>
          </div>
          
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-lg">
              {error}
            </div>
          )}
          
          {success && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-600 rounded-lg">
              {success}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="mb-8">
  <h2 className="text-xl font-semibold text-[#6B3416] mb-1">Photo</h2>
  <p className="text-sm text-gray-500 mb-4">Add a nice photo of yourself for your profile.</p>
  <div className="flex flex-col items-center">
    <div className="border-2 border-[#E4E2F5] rounded-xl bg-[#FFF5F0] p-4 mb-4 w-[340px] h-[340px] flex items-center justify-center">
      {profilePhoto ? (
        <img src={profilePhoto} alt="Image preview" className="w-full h-full object-cover rounded-xl" />
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
          <span className="text-7xl mb-4">📷</span>
          <span className="text-base">Image preview</span>
        </div>
      )}
    </div>
    <label htmlFor="profile-photo-upload" className="mb-2">
      <span className="text-sm text-[#6B3416] font-medium cursor-pointer underline">Add / Change Image</span>
      <input
        id="profile-photo-upload"
        type="file"
        accept="image/*"
        className="hidden"
        onChange={async (e) => {
          const file = e.target.files?.[0];
          if (!file) return;
          const reader = new FileReader();
          reader.onload = function(loadEvt) {
            setProfilePhoto(loadEvt.target?.result as string);
          };
          reader.readAsDataURL(file);
        }}
      />
    </label>
    <button
      type="button"
      className="mb-4 px-4 py-1.5 border border-[#A259FF] text-[#A259FF] rounded-md hover:bg-[#F5F0FF] transition-all text-sm font-medium"
      onClick={() => setShowCropModal(true)}
      disabled={!profilePhoto}
    >
      Crop image
    </button>

    {/* Crop Modal */}
    <Modal
      isOpen={showCropModal}
      onRequestClose={() => setShowCropModal(false)}
      contentLabel="Crop Image"
      ariaHideApp={false}
      style={{
        overlay: { backgroundColor: 'rgba(0,0,0,0.5)' },
        content: { maxWidth: 400, margin: 'auto', borderRadius: 16, padding: 0 }
      }}
    >
      <div className="p-4">
        <h2 className="text-lg font-bold mb-4">Crop Image</h2>
        <div className="relative w-[320px] h-[320px] bg-gray-100 rounded-lg overflow-hidden">
          {profilePhoto && (
            <Cropper
              image={profilePhoto}
              crop={crop}
              zoom={zoom}
              aspect={1}
              cropShape="rect"
              showGrid={true}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={(_, croppedAreaPixels) => setCroppedAreaPixels(croppedAreaPixels)}
            />
          )}
        </div>
        <div className="flex justify-end gap-2 mt-4">
          <button
            className="px-4 py-1.5 rounded-md bg-gray-100 text-[#6B3416] hover:bg-gray-200"
            onClick={() => setShowCropModal(false)}
          >
            Cancel
          </button>
          <button
            className="px-4 py-1.5 rounded-md bg-[#A259FF] text-white hover:bg-[#7B32B1]"
            onClick={async () => {
              if (!profilePhoto || !croppedAreaPixels) return;
              const cropped = await getCroppedImg(profilePhoto, croppedAreaPixels, zoom, 1);
              setProfilePhoto(cropped);
              setShowCropModal(false);
            }}
          >
            Save
          </button>
        </div>
      </div>
    </Modal>
  </div>
</div>
            
            <div className="pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-[#FF9B6A] text-white font-semibold py-2 px-4 rounded-md hover:bg-[#FF8B5E] transition-all duration-300 shadow-md hover:shadow-lg disabled:opacity-50"
              >
                {isSubmitting ? 'Güncelleniyor...' : 'Profili Güncelle'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
