import React, { useState } from 'react';
import './App.css';
import ProjectWorkspace from './ProjectWorkspace';

function App() {
  const [projectCreated, setProjectCreated] = useState(false);

  const handleCreateProject = () => {
    setProjectCreated(true);
  };

  return (
    <div className="App">
      {projectCreated ? (
        <ProjectWorkspace />
      ) : (
        <div className="landing-page">
          <div className="landing-content">
            <h1>Webtoon Editor</h1>
            <p>Create and edit your webtoons with our intuitive panel-based editor. Add scenes, upload images, and bring your stories to life.</p>
            <button className="create-project-btn" onClick={handleCreateProject}>
              Create Project
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
