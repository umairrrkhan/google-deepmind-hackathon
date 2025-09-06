import React, { useState } from 'react';
import './ProjectWorkspace.css';
import Sidebar, { ImageItem } from './Sidebar';

const Chatbox: React.FC = () => {
  const [message, setMessage] = useState('');

  const handleSendMessage = () => {
    console.log('Sending message:', message);
    setMessage('');
  };

  return (
    <div className="chatbox-container">
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Type your message..."
        className="chatbox-input"
      />
      <button onClick={handleSendMessage} className="chatbox-send-btn">
        Send
      </button>
    </div>
  );
};

const ProjectWorkspace: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [images, setImages] = useState<ImageItem[]>([]);

  const handleImageUpload = (files: FileList) => {
    const newImages: ImageItem[] = [...images];
    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          const imageName = `c${newImages.length + 1}`;
          newImages.push({ id: imageName, src: e.target.result as string });
          setImages([...newImages]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="project-workspace">
      <div className="workspace-content">
        <Sidebar 
          isOpen={isSidebarOpen} 
          toggleSidebar={toggleSidebar} 
          images={images}
          onImageUpload={handleImageUpload}
        />
        
        <div className={`main-content ${isSidebarOpen ? 'with-sidebar' : 'full-width'}`}>
          {/* Main content area with horizontal panels */}
          <div className="main-canvas">
            <div className="horizontal-panels">
              <div className="panel">
                <div className="panel-content">Panel 1</div>
                <div className="panel-label">s1</div>
              </div>
              <div className="panel">
                <div className="panel-content">Panel 2</div>
                <div className="panel-label">s2</div>
              </div>
              <div className="panel">
                <div className="panel-content">Panel 3</div>
                <div className="panel-label">s3</div>
              </div>
            </div>
          </div>
          
          {/* Chatbox positioned at the bottom center */}
          <div className="chatbox-wrapper">
            <Chatbox />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectWorkspace;