import React, { useState } from 'react';
import './Sidebar.css';

export interface ImageItem {
  id: string;
  src: string;
}

interface SidebarProps {
  isOpen: boolean;
  toggleSidebar: () => void;
  images: ImageItem[];
  onImageUpload: (files: FileList) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, toggleSidebar, images, onImageUpload }) => {
  const [activeTab, setActiveTab] = useState<'library' | 'upload'>('library');

  const handleFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      onImageUpload(event.target.files);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onImageUpload(e.dataTransfer.files);
    }
  };

  return (
    <div className={`sidebar ${isOpen ? 'open' : 'closed'}`}>
      <button className="toggle-btn" onClick={toggleSidebar}>
        {isOpen ? '◀' : '▶'}
      </button>
      
      <div className="sidebar-content">
        {isOpen && (
          <>
            <div className="sidebar-header">
              <h2>Assets</h2>
            </div>
            
            <div className="sidebar-tabs">
              <button 
                className={`tab-btn ${activeTab === 'library' ? 'active' : ''}`}
                onClick={() => setActiveTab('library')}
              >
                Library
              </button>
              <button 
                className={`tab-btn ${activeTab === 'upload' ? 'active' : ''}`}
                onClick={() => setActiveTab('upload')}
              >
                Upload
              </button>
            </div>
            
            <div className="tab-content">
              {activeTab === 'library' && (
                <div className="image-library">
                  {images.length > 0 ? (
                    <div className="image-gallery">
                      {images.map((image, index) => (
                        <div key={index} className="image-item" draggable>
                          <img src={image.src} alt={`uploaded-${index}`} />
                          <div className="image-overlay">
                            <span className="image-name">{image.id}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="empty-library">
                      <p>No images uploaded yet</p>
                      <button 
                        className="upload-prompt-btn"
                        onClick={() => setActiveTab('upload')}
                      >
                        Upload Images
                      </button>
                    </div>
                  )}
                </div>
              )}
              
              {activeTab === 'upload' && (
                <div 
                  className="upload-area"
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                >
                  <div className="upload-content">
                    <div className="upload-icon">📁</div>
                    <p>Drag & drop images here</p>
                    <p className="upload-subtext">or</p>
                    
                    <input 
                      type="file" 
                      accept="image/*" 
                      multiple 
                      onChange={handleFileInputChange} 
                      id="image-upload"
                      className="file-input"
                    />
                    <label htmlFor="image-upload" className="upload-btn">
                      Browse Files
                    </label>
                    
                    <p className="upload-hint">Supports JPG, PNG, GIF (Max 10MB each)</p>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Sidebar;