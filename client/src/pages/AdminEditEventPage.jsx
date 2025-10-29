import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import EventForm from '../components/EventForm';
import Layout from '../components/Layout';

const AdminEditEventPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams();
  const [initialEventData, setInitialEventData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user) {
      navigate('/admin');
      return;
    }
    const fetchEvent = async () => {
      try {
        setIsFetching(true);
        const response = await fetch(`http://localhost:5001/api/events/${id}`, {
          headers: { 'Authorization': `Bearer ${user.token}` },
        });
        if (!response.ok) throw new Error('Etkinlik verisi alınamadı.');
        const data = await response.json();
        setInitialEventData(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsFetching(false);
      }
    };
    fetchEvent();
  }, [id, user, navigate]);

  const handleUpdateEvent = async (formData, newMediaFiles, deletedMediaUrls) => {
    setIsLoading(true);
    setError(null);

    try {
      let newImageUrls = [];
      let newVideoUrls = [];

      // 1. Adım: Yeni medya dosyalarını yükle
      if (newMediaFiles && newMediaFiles.length > 0) {
        const mediaFormData = new FormData();
        newMediaFiles.forEach(file => mediaFormData.append('media', file));

        const uploadResponse = await fetch('http://localhost:5001/api/upload', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${user.token}` },
          body: mediaFormData,
        });

        if (!uploadResponse.ok) throw new Error('Yeni dosyalar yüklenemedi.');
        const uploadResult = await uploadResponse.json();
        
        uploadResult.urls.forEach(url => {
          if (url.match(/\.(jpeg|jpg|gif|png|webp|svg|bmp)$/i)) newImageUrls.push(url);
          else if (url.match(/\.(mp4|mov|avi|mkv|webm|ogg)$/i)) newVideoUrls.push(url);
        });
      }

      // 2. Adım: Mevcut ve yeni URL'leri birleştir, silinenleri çıkar
      const remainingImageUrls = (initialEventData.imageUrls || []).filter(url => !deletedMediaUrls.includes(url));
      const remainingVideoUrls = (initialEventData.videoUrls || []).filter(url => !deletedMediaUrls.includes(url));

      const finalImageUrls = [...remainingImageUrls, ...newImageUrls];
      const finalVideoUrls = [...remainingVideoUrls, ...newVideoUrls];

      // 3. Adım: Etkinliği yeni verilerle güncelle
      const finalEventData = {
        ...formData,
        imageUrls: finalImageUrls,
        videoUrls: finalVideoUrls,
      };

      const eventResponse = await fetch(`http://localhost:5001/api/events/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`,
        },
        body: JSON.stringify(finalEventData),
      });

      if (!eventResponse.ok) {
        const errorData = await eventResponse.json();
        throw new Error(errorData.message || 'Etkinlik güncellenemedi.');
      }

      navigate('/admin/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) return <Layout><div className="text-center p-10">Yükleniyor...</div></Layout>;
  if (error) return <Layout><div className="text-red-500 text-center p-10">Hata: {error}</div></Layout>;
  if (!user) return <Layout><div className="text-center p-10">Yetkisiz erişim.</div></Layout>;

  return (
    <Layout>
      <div className="container mx-auto p-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Etkinliği Düzenle</h1>
          <button
            onClick={() => navigate('/admin/dashboard')}
            className="bg-primary-light hover:bg-opacity-80 text-white font-bold py-2 px-4 rounded transition-colors duration-200"
          >
            Panele Dön
          </button>
        </div>
        {error && <p className="text-red-500 text-center mb-4">Hata: {error}</p>}
        {initialEventData && <EventForm initialData={initialEventData} onSubmit={handleUpdateEvent} isEditMode={true} isLoading={isLoading} />}
      </div>
    </Layout>
  );
};

export default AdminEditEventPage;


