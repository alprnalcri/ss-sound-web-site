import React, { useState, useEffect, useRef } from 'react';
import { useInView } from 'react-intersection-observer';
import api from '../services/api';
import { useContent } from '../context/ContentContext';

import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Autoplay } from 'swiper/modules';

import 'swiper/css';
import 'swiper/css/pagination';

const GallerySection = () => {
  const { content, loading: contentLoading } = useContent();
  const [images, setImages] = useState([]);
  const [loadingImages, setLoadingImages] = useState(false);

  const hasFetched = useRef(false); // 🔥 KRİTİK

  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  useEffect(() => {
    if (!inView || hasFetched.current) return;

    hasFetched.current = true; // 🔒 kilitle
    setLoadingImages(true);

    const fetchImages = async () => {
      try {
        const response = await api.get('/api/gallery');
        setImages(response.data);
      } catch (error) {
        console.error('Galeri resimleri çekilemedi:', error);
      } finally {
        setLoadingImages(false);
      }
    };

    fetchImages();
  }, [inView]);

  if (contentLoading) {
    return (
      <section className="py-20 bg-gray-900 text-white text-center">
        <p>İçerik yükleniyor...</p>
      </section>
    );
  }

  return (
    <section ref={ref} className="py-20 bg-background-light dark:bg-background-dark text-text-light dark:text-text-dark">
      <div className="container mx-auto px-4 text-center">
        <div className={`transition-opacity duration-1000 ${inView ? 'opacity-100' : 'opacity-0'}`}>
          <h2 className="text-4xl font-bold mb-2 text-gradient-animated">
            {content.galleryTitle}
          </h2>
          <p className="text-lg text-text-light/80 dark:text-text-dark/80 mb-12">
            {content.gallerySubtitle}
          </p>
        </div>

        {loadingImages && <p>Resimler yükleniyor...</p>}

        {!loadingImages && images.length === 0 && (
          <p>Galeride henüz resim bulunmuyor.</p>
        )}

        {images.length > 0 && (
          <Swiper
            modules={[Pagination, Autoplay]}
            spaceBetween={30}
            slidesPerView={1}
            pagination={{ clickable: true }}
            loop
            autoplay={{ delay: 3000, disableOnInteraction: false }}
            className={`transition-opacity duration-1000 ${inView ? 'opacity-100' : 'opacity-0'}`}
          >
            {images.map((image) => (
              <SwiperSlide key={image._id}>
                <div className="w-full h-[60vh] rounded-lg overflow-hidden">
                  <img
                    src={image.imageUrl}
                    alt={image.caption || 'Galeri görseli'}
                    className="w-full h-full object-contain"
                  />
                </div>
                {image.caption && (
                  <p className="mt-4 text-lg text-text-light/70 dark:text-text-dark/70">
                    {image.caption}
                  </p>
                )}
              </SwiperSlide>
            ))}
          </Swiper>
        )}
      </div>
    </section>
  );
};

export default GallerySection;
