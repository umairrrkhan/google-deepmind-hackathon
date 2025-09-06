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
  const [panels, setPanels] = useState([
    { id: 1, content: "Panel 1", label: "s1" },
    { id: 2, content: "Panel 2", label: "s2" },
    { id: 3, content: "Panel 3", label: "s3" }
  ]);

  const handleImageUpload = (files: FileList) => {
    const newImages: ImageItem[] = [...images];
    Array.from(files).forEach((file) => {
      // Additional validation to ensure only JPG and PNG files are processed
      if (file.type === 'image/jpeg' || file.type === 'image/png') {
        const reader = new FileReader();
        reader.onload = (e) => {
          if (e.target?.result) {
            const imageName = `c${newImages.length + 1}`;
            newImages.push({ id: imageName, src: e.target.result as string });
            setImages([...newImages]);
          }
        };
        reader.readAsDataURL(file);
      }
    });
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const addNewPanel = () => {
    const newPanelId = panels.length + 1;
    const newPanel = {
      id: newPanelId,
      content: `Panel ${newPanelId}`,
      label: `s${newPanelId}`
    };
    setPanels([...panels, newPanel]);
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
              {panels.map((panel) => (
                <div className="panel" key={panel.id}>
                  <div className="panel-content">{panel.content}</div>
                  <div className="panel-label">{panel.label}</div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Chatbox positioned at the bottom center */}
          <div className="chatbox-wrapper">
            <div className="chatbox-container-with-button">
              <Chatbox />
              <button className="add-panel-btn" onClick={addNewPanel} title="Add new panel">
                +
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectWorkspace;