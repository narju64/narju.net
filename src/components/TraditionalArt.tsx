import React, { useState } from 'react';
import './TraditionalArt.css';

interface ArtPiece {
  id: string;
  filename: string;
  title?: string;
  description?: string;
  year?: string;
  medium?: string;
}

const TraditionalArt: React.FC = () => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);

  // Array of art pieces - you can add titles, descriptions, years, and mediums later
  const artPieces: ArtPiece[] = [
    { id: '1', filename: '1.JPG' },
    { id: '2', filename: '2.JPG' },
    { id: '3', filename: '3.JPG' },
    { id: '4', filename: '4.JPG' },
    { id: '6', filename: '6.JPG' },
    { id: '7', filename: '7.JPG' },
    { id: '8', filename: '8.JPG' },
    { id: '10', filename: '10.JPG' },
    { id: '11', filename: '11.JPG' },
    { id: '12', filename: '12.JPG' },
    { id: '13', filename: '13.JPG' },
    { id: '15', filename: '15.JPG' },
    { id: '16', filename: '16.JPG' },
    { id: '17', filename: '17.JPG' },
    { id: '18', filename: '18.JPG' },
    { id: '19', filename: '19.JPG' },
    { id: '21', filename: '21.JPG' },
    { id: '22', filename: '22.JPG' },
    { id: '23', filename: '23.jpg' },
    { id: '26', filename: '26.JPG' },
    { id: '27', filename: '27.JPG' },
    { id: '29', filename: '29.JPG' },
    { id: '30', filename: '30.JPG' },
    { id: '31', filename: '31.JPG' },
    { id: '32', filename: '32.JPG' },
    { id: '33', filename: '33.JPG' },
    { id: '35', filename: '35.JPG' },
    { id: '36', filename: '36.JPG' },
    { id: '37', filename: '37.JPG' },
    { id: '38', filename: '38.JPG' },
    { id: '41', filename: '41.JPG' },
    { id: '42', filename: '42.JPG' },
    { id: '43', filename: '43.JPG' },
    { id: '44', filename: '44.JPG' },
    { id: '45', filename: '45.JPG' },
    { id: '46', filename: '46.JPG' },
    { id: '47', filename: '47.JPG' },
    { id: '52', filename: '52.JPG' },
    { id: '53', filename: '53.JPG' },
    { id: '54', filename: '54.JPG' },
    { id: '55', filename: '55.JPG' },
    { id: '56', filename: '56.JPG' },
    { id: '57', filename: '57.JPG' },
    { id: '58', filename: '58.JPG' },
    { id: '59', filename: '59.JPG' },
    { id: '60', filename: '60.JPG' },
    { id: '61', filename: '61.JPG' },
    { id: '62', filename: '62.JPG' },
    { id: '64', filename: '64.JPG' },
    { id: '65', filename: '65.JPG' },
    { id: '66', filename: '66.JPG' },
    { id: '73', filename: '73.JPG' },
    { id: 'DSCN1339', filename: 'DSCN1339.JPG' },
  ];

  const openModal = (filename: string, index: number) => {
    setSelectedImage(filename);
    setSelectedImageIndex(index);
  };

  const closeModal = () => {
    setSelectedImage(null);
    setSelectedImageIndex(null);
  };

  const goToNext = () => {
    if (selectedImageIndex !== null && selectedImageIndex < artPieces.length - 1) {
      const nextIndex = selectedImageIndex + 1;
      setSelectedImageIndex(nextIndex);
      setSelectedImage(artPieces[nextIndex].filename);
    }
  };

  const goToPrevious = () => {
    if (selectedImageIndex !== null && selectedImageIndex > 0) {
      const prevIndex = selectedImageIndex - 1;
      setSelectedImageIndex(prevIndex);
      setSelectedImage(artPieces[prevIndex].filename);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      closeModal();
    } else if (e.key === 'ArrowRight') {
      goToNext();
    } else if (e.key === 'ArrowLeft') {
      goToPrevious();
    }
  };

  return (
    <div className="traditional-art-page">
      <div className="container">
        <div className="art-gallery">
          {artPieces.map((piece) => (
            <div 
              key={piece.id} 
              className="art-piece"
              onClick={() => openModal(piece.filename, artPieces.indexOf(piece))}
            >
              <img 
                src={`/images/visual-art/traditional/${piece.filename}`}
                alt={`Traditional art piece ${piece.id}`}
                loading="lazy"
              />
              {piece.title && <h3 className="art-title">{piece.title}</h3>}
              {piece.description && <p className="art-description">{piece.description}</p>}
              {(piece.year || piece.medium) && (
                <div className="art-meta">
                  {piece.year && <span className="art-year">{piece.year}</span>}
                  {piece.medium && <span className="art-medium">{piece.medium}</span>}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Modal for enlarged view */}
        {selectedImage && (
          <div 
            className="modal-overlay" 
            onClick={closeModal}
            onKeyDown={handleKeyDown}
            tabIndex={0}
          >
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <button className="modal-close" onClick={closeModal}>×</button>
              
              {/* Navigation buttons */}
              {selectedImageIndex !== null && selectedImageIndex > 0 && (
                <button className="modal-nav modal-prev" onClick={goToPrevious}>
                  ‹
                </button>
              )}
              
              {selectedImageIndex !== null && selectedImageIndex < artPieces.length - 1 && (
                <button className="modal-nav modal-next" onClick={goToNext}>
                  ›
                </button>
              )}
              
              <img 
                src={`/images/visual-art/traditional/${selectedImage}`}
                alt="Enlarged art piece"
                className="modal-image"
              />
              
              {/* Image counter */}
              <div className="modal-counter">
                {selectedImageIndex !== null && `${selectedImageIndex + 1} / ${artPieces.length}`}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TraditionalArt; 