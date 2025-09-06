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
