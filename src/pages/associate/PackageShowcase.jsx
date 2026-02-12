import React, { useState, useEffect } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay, EffectCoverflow } from 'swiper/modules';
import { PhotoIcon, EyeIcon, ArrowTopRightOnSquareIcon, ClipboardDocumentIcon } from '@heroicons/react/24/outline';
import { packageImagesAPI } from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import toast from 'react-hot-toast';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/effect-coverflow';

const PackageShowcase = () => {
  const [loading, setLoading] = useState(true);
  const [images, setImages] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchPackageImages();
  }, []);

  const fetchPackageImages = async () => {
    try {
      const response = await packageImagesAPI.getAll();
      const all = response.data.data || [];
      setImages(all.filter((i) => i.isActive !== false));
    } catch {
      toast.error('Failed to load package images');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = async (url) => {
    try {
      await navigator.clipboard.writeText(url);
      toast.success('Link copied!');
    } catch {
      toast.error('Could not copy link');
    }
  };

  const handleShareWhatsApp = (url) => {
    const text = encodeURIComponent(url);
    window.open(`https://wa.me/?text=${text}`, '_blank', 'noopener,noreferrer');
  };

  const handleImageClick = (image) => {
    setSelectedImage(image);
    setShowModal(true);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Package Showcase</h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Discover amazing travel destinations and experiences. Browse through our curated collection 
          of travel packages and find your next adventure.
        </p>
      </div>

      {images.length === 0 ? (
        <div className="text-center py-12">
          <PhotoIcon className="mx-auto h-16 w-16 text-gray-400" />
          <h3 className="mt-4 text-lg font-medium text-gray-900">No packages available</h3>
          <p className="mt-2 text-gray-500">
            Package images will be displayed here once they are added by the admin.
          </p>
        </div>
      ) : (
        <>
          {/* Main Carousel */}
          <div className="relative">
            <Swiper
              modules={[Navigation, Pagination, Autoplay, EffectCoverflow]}
              spaceBetween={30}
              slidesPerView={1}
              navigation
              pagination={{ clickable: true }}
              autoplay={{
                delay: 4000,
                disableOnInteraction: false,
              }}
              effect="coverflow"
              coverflowEffect={{
                rotate: 50,
                stretch: 0,
                depth: 100,
                modifier: 1,
                slideShadows: true,
              }}
              breakpoints={{
                640: {
                  slidesPerView: 1,
                  spaceBetween: 20,
                },
                768: {
                  slidesPerView: 2,
                  spaceBetween: 30,
                },
                1024: {
                  slidesPerView: 3,
                  spaceBetween: 40,
                },
              }}
              className="package-showcase-swiper"
            >
              {images.map((image) => (
                <SwiperSlide key={image.id}>
                  <div className="relative group cursor-pointer" onClick={() => handleImageClick(image)}>
                    <div className="aspect-w-16 aspect-h-9 rounded-lg overflow-hidden shadow-lg">
                      <img
                        src={image.imageUrl}
                        alt={image.title || 'Package Image'}
                        className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/400x300?text=Image+Not+Available';
                        }}
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-opacity duration-300 flex items-center justify-center">
                        <EyeIcon className="h-8 w-8 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      </div>
                    </div>
                    {image.title && (
                      <div className="mt-3 text-center">
                        <h3 className="text-lg font-medium text-gray-900">{image.title}</h3>
                        {image.description && (
                          <p className="text-sm text-gray-600 mt-1">{image.description}</p>
                        )}
                      </div>
                    )}
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>

          {/* Thumbnail Grid */}
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">All Packages</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {images.map((image) => (
                <div
                  key={`thumb-${image.id}`}
                  className="relative group cursor-pointer"
                  onClick={() => handleImageClick(image)}
                >
                  <div className="aspect-w-4 aspect-h-3 rounded-lg overflow-hidden shadow-md">
                    <img
                      src={image.imageUrl}
                      alt={image.title || 'Package Image'}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/300x200?text=Image+Not+Available';
                      }}
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-opacity duration-300 flex items-center justify-center">
                      <EyeIcon className="h-6 w-6 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </div>
                  </div>
                  {image.title && (
                    <div className="mt-2">
                      <h4 className="text-sm font-medium text-gray-900 truncate">{image.title}</h4>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Image Modal */}
      {showModal && selectedImage && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div 
              className="fixed inset-0 bg-black bg-opacity-75 transition-opacity"
              onClick={() => setShowModal(false)}
            ></div>

            <div className="inline-block align-middle bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
              <div className="bg-white">
                <div className="relative">
                  <img
                    src={selectedImage.imageUrl}
                    alt={selectedImage.title || 'Package Image'}
                    className="w-full h-auto max-h-96 object-contain"
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/800x600?text=Image+Not+Available';
                    }}
                  />
                  <button
                    onClick={() => setShowModal(false)}
                    className="absolute top-4 right-4 bg-black bg-opacity-50 text-white rounded-full p-2 hover:bg-opacity-75 transition-opacity"
                  >
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                <div className="px-6 py-4">
                  {(selectedImage.title || selectedImage.description) && (
                    <>
                      {selectedImage.title && (
                        <h3 className="text-xl font-bold text-gray-900 mb-2">
                          {selectedImage.title}
                        </h3>
                      )}
                      {selectedImage.description && (
                        <p className="text-gray-600 mb-4">
                          {selectedImage.description}
                        </p>
                      )}
                    </>
                  )}
                  {selectedImage.link && (
                    <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-200">
                      <a
                        href={selectedImage.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary-600 text-white text-sm font-medium hover:bg-primary-700"
                      >
                        <ArrowTopRightOnSquareIcon className="h-4 w-4" />
                        Open link
                      </a>
                      <button
                        type="button"
                        onClick={() => handleCopyLink(selectedImage.link)}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 text-sm font-medium hover:bg-gray-50"
                      >
                        <ClipboardDocumentIcon className="h-4 w-4" />
                        Copy link
                      </button>
                      <button
                        type="button"
                        onClick={() => handleShareWhatsApp(selectedImage.link)}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-green-600 text-white text-sm font-medium hover:bg-green-700"
                      >
                        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                        </svg>
                        Share on WhatsApp
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Contact Information */}
      <div className="bg-primary-50 border border-primary-200 rounded-lg p-6 text-center">
        <h3 className="text-lg font-medium text-primary-900 mb-2">
          Interested in any of these packages?
        </h3>
        <p className="text-primary-700 mb-4">
          Contact us to customize your perfect travel experience or get more information about our packages.
        </p>
        <div className="space-y-2 text-sm text-primary-600">
          <p>📧 Email: ops@offbeattrips.in</p>
          <p>🌐 Website: https://offbeattrips.in/</p>
        </div>
      </div>

      {/* Custom Styles */}
      <style jsx>{`
        .package-showcase-swiper {
          padding: 20px 0 50px 0;
        }
        
        .package-showcase-swiper .swiper-pagination {
          bottom: 0;
        }
        
        .package-showcase-swiper .swiper-pagination-bullet {
          background: #1E3A8A;
          opacity: 0.5;
        }
        
        .package-showcase-swiper .swiper-pagination-bullet-active {
          opacity: 1;
          background: #F97316;
        }
        
        .package-showcase-swiper .swiper-button-next,
        .package-showcase-swiper .swiper-button-prev {
          color: #1E3A8A;
          background: white;
          border-radius: 50%;
          width: 40px;
          height: 40px;
          margin-top: -20px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
        }
        
        .package-showcase-swiper .swiper-button-next:after,
        .package-showcase-swiper .swiper-button-prev:after {
          font-size: 16px;
          font-weight: bold;
        }
        
        .package-showcase-swiper .swiper-button-next:hover,
        .package-showcase-swiper .swiper-button-prev:hover {
          background: #F97316;
          color: white;
        }
      `}</style>
    </div>
  );
};

export default PackageShowcase;