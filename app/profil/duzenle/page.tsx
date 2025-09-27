'use client';

import { useState, useEffect } from 'react';
import Notification from './Notification';
import Cropper from 'react-easy-crop';
import Modal from 'react-modal';
import getCroppedImg from './utils/cropImage'; // Kırpma yardımcı fonksiyonu (aşağıda eklenecek)
import { useAuth } from 'src/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useLanguage } from '@/src/contexts/LanguageContext';
import Image from 'next/image';

export default function ProfileEditPage() {
  const { t } = useLanguage();
  // --- Crop modal state ---
  const [showCropModal, setShowCropModal] = useState(false);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
  const { user, updateUser } = useAuth();
  const router = useRouter();
  
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (!user) {
      router.push('/auth/login');
      return;
    }
    if (user) {
      // Mevcut kullanıcı bilgilerini form alanlarına doldur
      setProfilePhoto((user as any).profilePhotoUrl || null);
    }
  }, [user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    console.log('Profil güncelleme: user.id:', user?.id, 'token:', localStorage.getItem('token'));
    e.preventDefault();
    
    if (!user) {
      setError(t('profile.userNotFound'));
      return;
    }
    
    try {
      setIsSubmitting(true);
      setError('');
      setSuccess('');
      
      const token = localStorage.getItem('token');
      if (!token) {
        setError(t('profile.sessionNotFound'));
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
        console.error('Backend response:', data);
        throw new Error(data.error || 'Profil güncellenirken bir hata oluştu');
      }
      
      // Kullanıcı bilgilerini global AuthContext'te güncelle
      if (data?.user) {
        updateUser(data.user);
      }
      
      setSuccess(t('profile.updateSuccess'));
      
      // 2 saniye sonra profil sayfasına yönlendir
      setTimeout(() => {
        router.push('/profil');
      }, 2000);
      
    } catch (err: any) {
      console.error('Profil güncelleme hatası:', err);
      setError(err.message || t('profile.updateError'));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitting) {
    return (
      <div className="min-h-screen bg-[#FFF5F0] pt-20">
        <div className="max-w-4xl mx-auto px-6">
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-[#FFE5D9]">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FFB996]"></div>
              <span className="ml-3 text-[#994D1C]">{t('general.loading')}</span>
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
            <h1 className="text-3xl font-bold text-[#6B3416]">{t('profile.editProfile')}</h1>
            <Link 
              href="/profil" 
              className="px-4 py-2 bg-gray-100 text-[#6B3416] rounded-lg hover:bg-gray-200 transition-colors"
            >
              {t('general.cancel')}
            </Link>
          </div>
          
          <Notification type="error" message={error ? t(error) : ''} onClose={() => setError('')} />
          <Notification type="success" message={success ? t(success) : ''} onClose={() => setSuccess('')} />
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="mb-8">
  <h2 className="text-xl font-semibold text-[#6B3416] mb-1">Photo</h2>
  <p className="text-sm text-gray-500 mb-4">Add a nice photo of yourself for your profile.</p>
  <div className="flex flex-col items-center">
    <div className="border-2 border-[#E4E2F5] rounded-xl bg-[#FFF5F0] p-4 mb-4 w-[340px] h-[340px] flex items-center justify-center">
      {profilePhoto ? (
        <div className="relative w-full h-full">
          <Image src={profilePhoto} alt="Image preview" fill sizes="340px" className="object-cover rounded-xl" />
        </div>
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
           // Güvenlik kontrolleri
           const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
           const minSize = 10 * 1024; // 10KB
           const maxSize = 5 * 1024 * 1024; // 5MB
           if (!allowedTypes.includes(file.type)) {
             setError('Yalnızca jpeg, png veya webp formatında fotoğraf yükleyebilirsiniz.');
             return;
           }
           if (file.size < minSize) {
             setError('Fotoğraf boyutu çok küçük. Lütfen daha kaliteli bir fotoğraf seçin.');
             return;
           }
           if (file.size > maxSize) {
             setError('Fotoğraf boyutu çok büyük. Maksimum 5MB olmalı.');
             return;
           }
           // Görsel boyutunu ve oranını kontrol et
           const img = new window.Image();
           img.onload = async function() {
             if (img.width < 150 || img.height < 150) {
               setError('Fotoğrafın genişliği ve yüksekliği en az 150px olmalı.');
               return;
             }
             const aspect = img.width / img.height;
             if (aspect < 0.6 || aspect > 1.7) {
               setError('Fotoğrafın oranı çok sıra dışı. Lütfen kareye yakın veya dikdörtgen bir fotoğraf seçin.');
               return;
             }
             // NSFWJS ile +18 içerik kontrolü
           setError('Fotoğraf analiz ediliyor, lütfen bekleyin...');
           const nsfwImg = new window.Image();
           nsfwImg.crossOrigin = 'anonymous';
           nsfwImg.onload = async function() {
             const { detectNsfwWithNsfwjs } = await import('@/src/utils/detectNsfwNsfwjs');
             const isNsfw = await detectNsfwWithNsfwjs(nsfwImg);
             if (isNsfw) {
               setError('Uygunsuz (+18) içerikli fotoğraf yüklenemez. Lütfen başka bir fotoğraf seçin.');
               return;
             }
             setError('');
             setProfilePhoto(img.src);
           };
           nsfwImg.onerror = function() {
             setError('Fotoğraf NSFW analizine uygun yüklenemedi.');
           };
           nsfwImg.src = img.src;
           };
           img.onerror = function() {
             setError('Geçersiz fotoğraf dosyası.');
           };
           const reader = new FileReader();
           reader.onload = function(loadEvt) {
             if (!loadEvt.target?.result) return;
             img.src = loadEvt.target.result as string;
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
