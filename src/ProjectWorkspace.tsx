import React, { useState, useRef, useEffect } from 'react';
import './ProjectWorkspace.css';
import Sidebar, { ImageItem } from './Sidebar';
import { generateImageFromPrompt } from './AIImageService';

const ProjectWorkspace: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [images, setImages] = useState<ImageItem[]>([]);
  const [panels, setPanels] = useState([
    { id: 1, content: "Panel 1", label: "s1" },
    { id: 2, content: "Panel 2", label: "s2" },
    { id: 3, content: "Panel 3", label: "s3" }
  ]);
  const [activePanel, setActivePanel] = useState<number | null>(null);
  const [panelMessages, setPanelMessages] = useState<{[key: number]: {text: string, timestamp: Date}[]}>({});
  const [panelMessage, setPanelMessage] = useState<string>('');
  const [panelAttachments, setPanelAttachments] = useState<{type: 'panel' | 'image', id: number | string, label?: string}[]>([]);
  const [showPanelSuggestions, setShowPanelSuggestions] = useState(false);
  const [panelSuggestions, setPanelSuggestions] = useState<{type: 'panel' | 'image', label: string, id: number | string}[]>([]);
  const [panelSelectedIndex, setPanelSelectedIndex] = useState(0);
  const [generatedImages, setGeneratedImages] = useState<{[key: string]: string}>({});
  const [generatingPanel, setGeneratingPanel] = useState<number | null>(null);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; panelId: number } | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; panelId: number | null }>({ isOpen: false, panelId: null });

  const handlePanelMessageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPanelMessage(value);

    const lastAt = value.lastIndexOf('@');
    if (lastAt !== -1 && (lastAt === 0 || value[lastAt - 1] === ' ')) {
      const query = value.substring(lastAt + 1).toLowerCase();
      if (query.length > 0) {
        const panelSuggestionsData = panels
          .filter(panel => panel.label.toLowerCase().includes(query))
          .map(panel => ({ type: 'panel' as const, label: panel.label, id: panel.id }));
        
        const imageSuggestionsData = images
          .filter(image => !image.id.startsWith('gen_'))
          .filter(image => image.id.toLowerCase().includes(query))
          .map(image => ({ type: 'image' as const, label: image.id, id: image.id }));
        
        setPanelSuggestions([...panelSuggestionsData, ...imageSuggestionsData]);
        setPanelSelectedIndex(0);
        setShowPanelSuggestions(true);
      } else {
        setShowPanelSuggestions(false);
      }
    } else {
      setShowPanelSuggestions(false);
    }
  };

  const selectPanelSuggestion = (suggestion: {type: 'panel' | 'image', label: string, id: number | string}) => {
    const newAttachment = {
      type: suggestion.type,
      id: suggestion.id,
      label: suggestion.type === 'panel' ? panels.find(p => p.id === suggestion.id)?.label : undefined
    };
    setPanelAttachments(prev => [...prev, newAttachment]);
    
    const lastAt = panelMessage.lastIndexOf('@');
    const beforeAt = panelMessage.substring(0, lastAt);
    const afterAt = panelMessage.substring(lastAt);
    const spaceIndex = afterAt.indexOf(' ');
    const newMessage = spaceIndex !== -1 
      ? beforeAt + afterAt.substring(spaceIndex + 1)
      : beforeAt;
    setPanelMessage(newMessage.trim() + ' ');
    
    setShowPanelSuggestions(false);
  };

  const removePanelAttachment = (index: number) => {
    setPanelAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const handlePanelKeyDown = (e: React.KeyboardEvent) => {
    if (showPanelSuggestions) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setPanelSelectedIndex(prev => Math.min(prev + 1, panelSuggestions.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setPanelSelectedIndex(prev => Math.max(prev - 1, 0));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (panelSuggestions.length > 0) {
          selectPanelSuggestion(panelSuggestions[panelSelectedIndex]);
        }
      } else if (e.key === 'Escape') {
        setShowPanelSuggestions(false);
      }
    } else if (e.key === 'Enter') {
      e.preventDefault();
      handleSendPanelMessage();
    }
  };

  const handleSendPanelMessage = async () => {
    if (activePanel && (panelMessage.trim() || panelAttachments.length > 0)) {
      setGeneratingPanel(activePanel);
      
      try {
        const contextImages: string[] = [];
        for (const attachment of panelAttachments) {
          if (attachment.type === 'panel') {
            const panelImage = generatedImages[attachment.id];
            if (panelImage) {
              contextImages.push(panelImage);
            }
          } else if (attachment.type === 'image') {
            const image = images.find(img => img.id === attachment.id);
            if (image) {
              contextImages.push(image.src);
            }
          }
        }

        const imageData = await generateImageFromPrompt(panelMessage.trim(), contextImages, 1200, 3000);
        
        const newImageId = `gen_${Date.now()}`;
        const newImage: ImageItem = { id: newImageId, src: imageData };
        setImages(prev => [...prev, newImage]);
        
        setGeneratedImages(prev => ({ ...prev, [activePanel.toString()]: imageData }));
        
        const newMessage = { text: `Generated image: ${panelMessage.trim()}`, timestamp: new Date() };
        setPanelMessages(prev => ({ ...prev, [activePanel]: [...(prev[activePanel] || []), newMessage] }));
        
      } finally {
        setGeneratingPanel(null);
      }
      
      setPanelMessage('');
      setPanelAttachments([]);
      setShowPanelSuggestions(false);
    }
  };

  const handleImageUpload = (files: FileList) => {
    const newImages: ImageItem[] = [...images];
    Array.from(files).forEach((file) => {
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
    
    const newPanel = { id: newPanelId, content: `Panel ${newPanelId}`, label: `s${nextLabelNumber}` };
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
      setDeleteConfirm({ isOpen: true, panelId: -1 });
    }
    setContextMenu(null);
  };

  const confirmDeletePanel = () => {
    if (deleteConfirm.panelId && deleteConfirm.panelId > 0) {
      const updatedPanels = panels.filter(panel => panel.id !== deleteConfirm.panelId);
      setPanels(updatedPanels);
    }
    setDeleteConfirm({ isOpen: false, panelId: null });
  };

  const cancelDeletePanel = () => {
    setDeleteConfirm({ isOpen: false, panelId: null });
  };

  const handleExport = async () => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      alert('Canvas is not supported.');
      return;
    }

    const panelWidth = 1200;
    const panelHeight = 3000;
    const totalHeight = panels.length * panelHeight;
    canvas.width = panelWidth;
    canvas.height = totalHeight;

    for (let i = 0; i < panels.length; i++) {
      const panel = panels[i];
      const yPos = i * panelHeight;
      const panelImageSrc = generatedImages[panel.id];

      if (panelImageSrc) {
        const image = new Image();
        image.src = panelImageSrc;
        await new Promise(resolve => {
          image.onload = () => {
            ctx.drawImage(image, 0, yPos, panelWidth, panelHeight);
            resolve(null);
          };
        });
      } else {
        ctx.fillStyle = 'white';
        ctx.fillRect(0, yPos, panelWidth, panelHeight);
        ctx.fillStyle = 'black';
        ctx.font = '30px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(panel.content, panelWidth / 2, yPos + panelHeight / 2);
      }
    }

    const dataUrl = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = 'webtoon.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleClickOutside = () => {
    setContextMenu(null);
  };

  useEffect(() => {
    if (activePanel === null) {
      setPanelMessage('');
      setPanelAttachments([]);
      setShowPanelSuggestions(false);
    }
  }, [activePanel]);

  return (
    <div className="project-workspace" onClick={handleClickOutside}>
      <div className="workspace-content">
        <Sidebar 
          isOpen={isSidebarOpen} 
          toggleSidebar={toggleSidebar} 
          images={images.filter(img => !img.id.startsWith('gen_'))}
          onImageUpload={handleImageUpload}
        />
        
        <div className={`main-content ${isSidebarOpen ? 'with-sidebar' : 'full-width'}`}>
          <div className="top-right-controls">
            <button onClick={handleExport}>Export</button>
          </div>
          <div className="main-canvas">
            <div className="horizontal-panels">
              {panels.map((panel) => (
                <div 
                  className={`panel ${activePanel === panel.id ? 'active' : ''} ${generatingPanel === panel.id ? 'generating' : ''}`}
                  key={panel.id}
                  onContextMenu={(e) => handlePanelContextMenu(e, panel.id)}
                  onClick={() => setActivePanel(panel.id)}
                >
                  <div className="panel-content">
                    {generatedImages[panel.id] ? (
                      <img src={generatedImages[panel.id]} alt={`Generated for panel ${panel.label}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      panel.content
                    )}
                  </div>
                  <div className="panel-label">{panel.label}</div>
                </div>
              ))}
            </div>
          </div>
          
          {activePanel && (
            <div className="panel-side-chatbox">
              <div className="panel-chat-header">
                <h3 className="panel-chat-title">Chat for {panels.find(p => p.id === activePanel)?.label}</h3>
                <button className="close-panel-chat" onClick={() => setActivePanel(null)}>×</button>
              </div>
              <div className="panel-chat-messages">
                {(panelMessages[activePanel] || []).map((msg, index) => (
                  <div key={index} className="panel-chat-message">{msg.text}</div>
                ))}
              </div>
              <div className="panel-chat-input-container">
                {panelAttachments.length > 0 && (
                  <div className="attachments-bar">
                    {panelAttachments.map((attachment, index) => (
                      <div key={index} className="attachment-tag">
                        <span className="attachment-type">{attachment.type}</span>
                        <span className="attachment-label">{attachment.type === 'panel' ? attachment.label : attachment.id}</span>
                        <button className="remove-attachment" onClick={() => removePanelAttachment(index)}>×</button>
                      </div>
                    ))}
                  </div>
                )}
                <input
                  type="text"
                  value={panelMessage}
                  onChange={handlePanelMessageChange}
                  onKeyDown={handlePanelKeyDown}
                  placeholder="Type a message..."
                  className="panel-chat-input"
                />
                <button className="panel-chat-send-btn" onClick={handleSendPanelMessage}>Send</button>
              </div>
              {showPanelSuggestions && panelSuggestions.length > 0 && (
                <div className="suggestions-dropdown">
                  {panelSuggestions.map((suggestion, index) => (
                    <div 
                      key={`${suggestion.type}-${suggestion.id}`}
                      className={`suggestion-item ${index === panelSelectedIndex ? 'selected' : ''}`}
                      onClick={() => selectPanelSuggestion(suggestion)}
                    >
                      <span className="suggestion-type">{suggestion.type}</span>
                      <span className="suggestion-label">{suggestion.label}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          
          {contextMenu && (
            <div className="context-menu" style={{ position: 'absolute', top: contextMenu.y, left: contextMenu.x, zIndex: 1000 }}>
              <button className="context-menu-item" onClick={() => handleDeletePanel(contextMenu.panelId)}>Delete Panel</button>
            </div>
          )}
          
          {deleteConfirm.isOpen && (
            <div className="popup-overlay">
              <div className="popup-container">
                <div className="popup-header">
                  <h3>{deleteConfirm.panelId === -1 ? "Cannot Delete Panel" : "Confirm Delete"}</h3>
                </div>
                <div className="popup-content">
                  <p>{deleteConfirm.panelId === -1 ? "You must have at least one panel." : "Are you sure you want to delete this panel?"}</p>
                </div>
                <div className="popup-actions">
                  {deleteConfirm.panelId === -1 ? (
                    <button className="popup-button confirm" onClick={cancelDeletePanel}>OK</button>
                  ) : (
                    <>
                      <button className="popup-button cancel" onClick={cancelDeletePanel}>Cancel</button>
                      <button className="popup-button confirm" onClick={confirmDeletePanel}>Delete</button>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}
          
          <div className="add-panel-button-container">
            <button className="add-panel-btn" onClick={addNewPanel} title="Add new panel">
              +
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectWorkspace;
