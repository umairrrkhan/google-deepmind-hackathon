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
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; panelId: number } | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; panelId: number | null }>({ isOpen: false, panelId: null });

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
    const newPanelId = panels.length > 0 ? Math.max(...panels.map(p => p.id)) + 1 : 1;
    const nextLabelNumber = panels.length > 0 ? Math.max(...panels.map(p => {
      const num = parseInt(p.label.replace('s', ''));
      return isNaN(num) ? 0 : num;
    })) + 1 : 1;
    
    const newPanel = {
      id: newPanelId,
      content: `Panel ${newPanelId}`,
      label: `s${nextLabelNumber}`
    };
    setPanels([...panels, newPanel]);
  };

  const handlePanelContextMenu = (e: React.MouseEvent, panelId: number) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY, panelId });
  };

  const handleDeletePanel = (panelId: number) => {
    if (panels.length > 1) {
      setDeleteConfirm({ isOpen: true, panelId });
    } else {
      // We'll show this in a popup too
      setDeleteConfirm({ isOpen: true, panelId: -1 }); // Use -1 to indicate error message
    }
    setContextMenu(null);
  };

  const confirmDeletePanel = () => {
    if (deleteConfirm.panelId && deleteConfirm.panelId > 0) {
      // Remove the panel without renumbering the labels
      const updatedPanels = panels.filter(panel => panel.id !== deleteConfirm.panelId);
      setPanels(updatedPanels);
    }
    setDeleteConfirm({ isOpen: false, panelId: null });
  };

  const cancelDeletePanel = () => {
    setDeleteConfirm({ isOpen: false, panelId: null });
  };

  const handleClickOutside = () => {
    setContextMenu(null);
  };

  return (
    <div className="project-workspace" onClick={handleClickOutside}>
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
                <div 
                  className="panel" 
                  key={panel.id}
                  onContextMenu={(e) => handlePanelContextMenu(e, panel.id)}
                >
                  <div className="panel-content">{panel.content}</div>
                  <div className="panel-label">{panel.label}</div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Context menu */}
          {contextMenu && (
            <div 
              className="context-menu"
              style={{ 
                position: 'absolute', 
                top: contextMenu.y, 
                left: contextMenu.x,
                zIndex: 1000
              }}
            >
              <button 
                className="context-menu-item"
                onClick={() => handleDeletePanel(contextMenu.panelId)}
              >
                Delete Panel
              </button>
            </div>
          )}
          
          {/* Delete confirmation popup */}
          {deleteConfirm.isOpen && (
            <div className="popup-overlay">
              <div className="popup-container">
                <div className="popup-header">
                  <h3>{deleteConfirm.panelId === -1 ? "Cannot Delete Panel" : "Confirm Delete"}</h3>
                </div>
                <div className="popup-content">
                  <p>
                    {deleteConfirm.panelId === -1 
                      ? "You must have at least one panel." 
                      : "Are you sure you want to delete this panel?"}
                  </p>
                </div>
                <div className="popup-actions">
                  {deleteConfirm.panelId === -1 ? (
                    <button className="popup-button confirm" onClick={cancelDeletePanel}>
                      OK
                    </button>
                  ) : (
                    <>
                      <button className="popup-button cancel" onClick={cancelDeletePanel}>
                        Cancel
                      </button>
                      <button className="popup-button confirm" onClick={confirmDeletePanel}>
                        Delete
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}
          
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