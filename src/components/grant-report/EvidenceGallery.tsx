// src/components/grant-report/EvidenceGallery.tsx

import React, { useState } from 'react';
import Image from 'next/image';

interface EvidenceGalleryProps {
  evidence: {
    assets: Array<{
      assetName: string;
      assetType: string;
      description: string;
      relativePath: string;
      status: string;
    }>;
    imageUrls: string[];
  };
}

export function EvidenceGallery({ evidence }: EvidenceGalleryProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  if (!evidence || evidence.assets.length === 0) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold mb-4">Evidence Gallery</h3>
        <p className="text-gray-500 text-center py-8">No evidence assets available</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-lg font-semibold mb-4">
        Evidence Gallery ({evidence.assets.length} assets)
      </h3>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {evidence.assets.map((asset, index) => (
          <div
            key={index}
            className="relative group cursor-pointer"
            onClick={() => setSelectedImage(asset.relativePath)}
          >
            <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden relative">
              {asset.relativePath ? (
                <img
                  src={`/${asset.relativePath}`}
                  alt={asset.assetName}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    // Fallback for missing images
                    (e.target as HTMLImageElement).src = '/placeholder-image.jpg';
                  }}
                />
              ) : (
                <div className="flex items-center justify-center h-full bg-gray-200">
                  <span className="text-4xl">📷</span>
                </div>
              )}
              
              {/* Status badge */}
              <div className="absolute top-2 right-2">
                <span className={`text-xs px-2 py-1 rounded-full ${
                  asset.status === 'Verified' ? 'bg-green-500 text-white' :
                  asset.status === 'Pending Review' ? 'bg-yellow-500 text-white' :
                  'bg-red-500 text-white'
                }`}>
                  {asset.status}
                </span>
              </div>
            </div>
            
            <p className="mt-2 text-sm font-medium truncate">{asset.assetName}</p>
            <p className="text-xs text-gray-500 truncate">{asset.assetType}</p>
          </div>
        ))}
      </div>
      
      {/* Modal for viewing full image */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="max-w-4xl max-h-[90vh] relative">
            <img
              src={`/${selectedImage}`}
              alt="Evidence"
              className="max-w-full max-h-[90vh] object-contain"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/placeholder-image.jpg';
              }}
            />
            <button
              className="absolute top-4 right-4 text-white bg-black bg-opacity-50 rounded-full p-2 hover:bg-opacity-75"
              onClick={() => setSelectedImage(null)}
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
}