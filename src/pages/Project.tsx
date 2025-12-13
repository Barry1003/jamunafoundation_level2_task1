import React, { useState, useEffect, useCallback } from "react";
import { Github, GitBranch, Star, GitFork, ExternalLink, Plus, Trash2, CheckCircle, X } from "lucide-react";
import { API_BASE_URL } from "../config/api";

// --- INTERFACE DEFINITIONS ---

interface GitHubUser {
  username: string;
  name: string;
  avatar: string;
  email: string;
  githubId: number;
}

interface Repository {
  id: number;
  name: string;
  fullName: string;
  description: string | null;
  url: string;
  language: string | null;
  stars: number;
  forks: number;
  isPrivate: boolean;
  updatedAt: string;
  defaultBranch: string;
}

interface Project {
  _id: string;
  name: string;
  description: string;
  status: 'planning' | 'in-progress' | 'completed' | 'on-hold';
  technologies: string[];
  githubRepo?: {
    repoId: number;
    fullName: string;
    url: string;
    language: string | null;
    stars: number;
    forks: number;
    description?: string;
    name?: string;
  };
  links?: {
    live?: string;
    demo?: string;
    documentation?: string;
  };
  progress: number;
  relatedApplications: Array<{ _id: string; title: string; company: string; status: string }>;
  createdAt: string;
  updatedAt: string;
  user: string;
}

interface NewProjectState {
  name: string;
  description: string;
  status: 'planning' | 'in-progress' | 'completed' | 'on-hold';
  technologies: string;
  liveUrl: string;
  progress: number;
}

// --- CONSTANTS ---
const BASE_URL = API_BASE_URL;

const ProjectTracker: React.FC = () => {
  // Main auth state
  const [token, setToken] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  
  // GitHub-specific state
  const [githubUser, setGithubUser] = useState<GitHubUser | null>(null);
  const [repositories, setRepositories] = useState<Repository[]>([]);
  
  // Project state
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedRepo, setSelectedRepo] = useState<Repository | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  const [newProject, setNewProject] = useState<NewProjectState>({
    name: "",
    description: "",
    status: "planning",
    technologies: "",
    liveUrl: "",
    progress: 0
  });

  // Helper for authenticated fetch requests
  const authFetch = useCallback(async (url: string, options: RequestInit = {}) => {
    if (!token) {
      throw new Error("Authentication token is missing. Please log in.");
    }
    const headers = {
      ...options.headers,
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
    
    return fetch(url, { ...options, headers });
  }, [token]);

  // --- AUTHENTICATION & INITIAL SETUP ---

  useEffect(() => {
    console.log("🔍 Checking authentication status...");
    
    // Get main auth token
    const mainToken = localStorage.getItem('token');
    const activeUser = localStorage.getItem('activeUser');
    
    if (mainToken && activeUser) {
      try {
        const user = JSON.parse(activeUser);
        setToken(mainToken);
        setUserId(user._id);
        console.log("✅ User authenticated:", user._id);
      } catch (err) {
        console.error("❌ Failed to parse user data", err);
        window.location.href = '/login';
      }
    } else {
      console.warn("❌ No authentication found, redirecting to login...");
      window.location.href = '/login';
    }

    // Check for GitHub connection status from callback
    const params = new URLSearchParams(window.location.search);
    const githubConnected = params.get('github_connected');
    const githubData = params.get('github_data');
    const githubError = params.get('github_error');
    
    if (githubConnected === 'true' && githubData) {
      try {
        const gitHubUserData = JSON.parse(decodeURIComponent(githubData));
        setGithubUser(gitHubUserData);
        localStorage.setItem('github_user', JSON.stringify(gitHubUserData));
        console.log("✅ GitHub connected:", gitHubUserData.username);
        
        window.history.replaceState({}, '', window.location.pathname);
      } catch (err) {
        console.error("❌ Failed to parse GitHub data:", err);
        setError('Failed to connect GitHub account');
      }
    } else if (githubError) {
      setError(`GitHub connection failed: ${githubError}`);
      window.history.replaceState({}, '', window.location.pathname);
    } else {
      const storedGitHubUser = localStorage.getItem('github_user');
      if (storedGitHubUser) {
        try {
          setGithubUser(JSON.parse(storedGitHubUser));
          console.log("✅ GitHub user loaded from storage");
        } catch (err) {
          console.error("❌ Failed to parse stored GitHub user", err);
          localStorage.removeItem('github_user');
        }
      }
    }
  }, []);

  // --- DATA FETCHING ---

  const fetchRepositories = useCallback(async () => {
    if (!token || !githubUser) return;
    
    console.log("📦 Fetching GitHub repositories...");
    try {
      const response = await authFetch(`${BASE_URL}/api/auth/github/repos`);
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error("❌", errorData.error || 'Failed to fetch repositories');
        setRepositories([]);
        return;
      }
      
      const repos: Repository[] = await response.json();
      console.log("✅ Fetched repositories:", repos.length);
      setRepositories(repos);
    } catch (err) {
      console.error("❌ Error fetching repositories:", err);
      setRepositories([]);
    }
  }, [authFetch, token, githubUser]);

  const fetchProjects = useCallback(async () => {
    if (!token) {
      console.log("⚠️ No token, skipping project fetch");
      return;
    }
    
    console.log("📋 Fetching projects...");
    setLoading(true);
    setError(null);
    
    try {
      // ✅ FIXED: Changed from /api/auth/projects to /api/projects
      const response = await authFetch(`${BASE_URL}/api/projects`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch projects');
      }
      
      const data: Project[] = await response.json();
      console.log("✅ Fetched projects:", data.length);
      setProjects(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load projects';
      console.error("❌ Error fetching projects:", message);
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [authFetch, token]);

  useEffect(() => {
    if (token && userId) {
      fetchProjects();
      
      if (githubUser) {
        fetchRepositories();
      }
    }
  }, [token, userId, githubUser, fetchProjects, fetchRepositories]);

  // --- PROJECT CRUD OPERATIONS ---

  const createProject = async () => {
    if (!newProject.name) {
      setError('Project name is required');
      return;
    }

    if (!token) {
      setError('Authentication token is missing');
      return;
    }

    console.log("➕ Creating project:", newProject.name);
    setError(null);
    
    try {
      const projectData: Record<string, unknown> = {
        name: newProject.name,
        description: newProject.description,
        status: newProject.status,
        technologies: newProject.technologies.split(',').map(t => t.trim()).filter(t => t),
        progress: newProject.progress,
        links: {
          live: newProject.liveUrl || undefined
        }
      };

      if (selectedRepo) {
        projectData.githubFullName = selectedRepo.fullName;
      }

      const response = await authFetch(`${BASE_URL}/api/projects`, {
        method: 'POST',
        body: JSON.stringify(projectData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create project');
      }

      const createdProject: Project = await response.json();
      console.log("✅ Project created:", createdProject.name);

      setShowCreateModal(false);
      setNewProject({ name: "", description: "", status: "planning", technologies: "", liveUrl: "", progress: 0 });
      setSelectedRepo(null);
      fetchProjects();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create project';
      console.error("❌", message);
      setError(message);
    }
  };

  const handleDelete = async (id: string) => {
    setShowDeleteConfirm(null);
    
    console.log("🗑️ Deleting project:", id);
    setError(null);
    
    try {
      const response = await authFetch(`${BASE_URL}/api/projects/${id}`, { 
        method: 'DELETE' 
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete project');
      }
      
      console.log("✅ Project deleted");
      fetchProjects();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete project';
      console.error("❌", message);
      setError(message);
    }
  };

  const updateProjectStatus = async (id: string, status: Project['status']) => {
    if (!token) return;
    
    console.log("🔄 Updating project status:", status);
    setError(null);
    
    try {
      const response = await authFetch(`${BASE_URL}/api/projects/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update status');
      }
      
      console.log("✅ Status updated");
      fetchProjects();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update status';
      console.error("❌", message);
      setError(message);
    }
  };
  
  const disconnectGitHub = async () => {
    if (!token) return;
    
    console.log("🔌 Disconnecting GitHub...");
    setError(null);
    
    try {
      // ✅ FIXED: Changed from /api/github/disconnect to /api/auth/github/disconnect
      const response = await authFetch(`${BASE_URL}/api/auth/github/disconnect`, {
        method: 'POST',
        body: JSON.stringify({})
      });
      
      if (response.ok) {
        setGithubUser(null);
        setRepositories([]);
        localStorage.removeItem('github_user');
        fetchProjects();
        console.log("✅ GitHub disconnected");
      } else {
         const errorData = await response.json();
         throw new Error(errorData.message || 'Failed to disconnect GitHub');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to disconnect GitHub';
      console.error("❌", message);
      setError(message);
    }
  };
  
  // --- UI HELPERS ---

  const connectGitHub = () => {
    // ✅ FIXED: Changed from /api/github/auth to /api/auth/github/auth
    window.location.href = `${BASE_URL}/api/auth/github/auth?token=${token}`;
  };

  const getStatusColor = (status: Project['status']) => {
    const colors = {
      planning: 'bg-gray-100 text-gray-800',
      'in-progress': 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
      'on-hold': 'bg-yellow-100 text-yellow-800'
    };
    return colors[status] || colors.planning;
  };

  const getLanguageColor = (language: string | null) => {
    const colors: Record<string, string> = {
      JavaScript: 'bg-yellow-400',
      TypeScript: 'bg-blue-500',
      Python: 'bg-green-600',
      Java: 'bg-red-500',
      Go: 'bg-cyan-500',
    };
    return colors[language || ''] || 'bg-gray-400';
  };

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600">Checking authentication...</p>
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-gray-50 p-6 font-sans">
      <div className="max-w-7xl mx-auto">
        {/* Header and GitHub Connection */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Project Tracker</h1>
              <p className="text-gray-600">Track your personal projects and technical progress.</p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition shadow-md"
            >
              <Plus className="w-5 h-5" />
              New Project
            </button>
          </div>

          {/* GitHub Connection Status */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-200">
            <div className="flex items-center gap-3">
              <Github className="w-6 h-6 text-gray-700" />
              <span className="font-medium">GitHub Integration</span>
              <span className="text-xs text-gray-500">(Optional - for repo linking)</span>
            </div>
            {githubUser ? (
              <div className="flex items-center gap-3">
                <img src={githubUser.avatar} alt={githubUser.username} className="w-8 h-8 rounded-full border border-gray-300" />
                <span className="text-sm font-semibold text-gray-700">@{githubUser.username}</span>
                <button
                  onClick={disconnectGitHub}
                  className="text-sm text-red-600 hover:text-red-800 transition"
                >
                  Disconnect
                </button>
              </div>
            ) : (
              <button
                onClick={connectGitHub}
                className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 text-sm transition shadow-sm"
              >
                Connect GitHub
              </button>
            )}
          </div>
        </div>

        {/* Error Notification */}
        {error && (
          <div className="bg-red-50 border border-red-300 text-red-800 px-4 py-3 rounded-lg mb-6 flex justify-between items-center">
            <div className="flex items-center">
              <X className="w-5 h-5 mr-2" />
              <strong>Error:</strong> {error}
            </div>
            <button onClick={() => setError(null)} className="text-red-500 hover:text-red-700">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Projects Content */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent"></div>
            <p className="mt-4 text-gray-600">Loading projects...</p>
          </div>
        ) : projects.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center border border-gray-200">
            <GitBranch className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No projects yet</h3>
            <p className="text-gray-600 mb-4">Create your first project to start tracking your work.</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 font-medium shadow-md"
            >
              <Plus className="w-5 h-5 inline mr-2" />
              Create Project
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {projects.map((project) => (
              <div
                key={project._id}
                className="bg-white rounded-xl shadow-lg p-6 border border-gray-200 flex flex-col justify-between hover:shadow-xl transition transform hover:-translate-y-0.5"
              >
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 mb-1 line-clamp-2">{project.name}</h3>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${getStatusColor(project.status)}`}>
                        {project.status.replace('-', ' ')}
                      </span>
                    </div>
                    <button
                      onClick={() => setShowDeleteConfirm(project._id)}
                      className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-50 transition"
                      title="Delete Project"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <p className="text-sm text-gray-600 line-clamp-3 mb-3 h-12">
                    {project.description || "No description provided."}
                  </p>

                  {/* Status Control */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {(['planning', 'in-progress', 'completed', 'on-hold'] as Project['status'][]).map((status) => (
                      <button
                        key={status}
                        onClick={() => updateProjectStatus(project._id, status)}
                        className={`px-3 py-1 rounded-full text-xs font-medium capitalize transition 
                          ${project.status === status ? 
                            'border border-current' : 
                            'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          } ${getStatusColor(status)}`}
                      >
                        {status.replace('-', ' ')}
                      </button>
                    ))}
                  </div>
                  
                  {/* GitHub Repo Info */}
                  {project.githubRepo && (
                    <div className="bg-gray-50 rounded-lg p-3 mb-3 border border-gray-200">
                      <div className="flex items-center gap-2 mb-2">
                        <Github className="w-4 h-4 text-gray-700" />
                        <a
                          href={project.githubRepo.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm font-medium text-blue-600 hover:underline line-clamp-1"
                        >
                          {project.githubRepo.fullName}
                        </a>
                        <ExternalLink className="w-3 h-3 text-blue-500 ml-auto" />
                      </div>
                      <div className="flex items-center gap-3 text-xs text-gray-600">
                        {project.githubRepo.language && (
                          <div className="flex items-center gap-1">
                            <span className={`w-2 h-2 rounded-full ${getLanguageColor(project.githubRepo.language)}`}></span>
                            {project.githubRepo.language}
                          </div>
                        )}
                        <div className="flex items-center gap-1">
                          <Star className="w-3 h-3 text-yellow-500" />
                          {project.githubRepo.stars}
                        </div>
                        <div className="flex items-center gap-1">
                          <GitFork className="w-3 h-3 text-blue-500" />
                          {project.githubRepo.forks}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Progress Bar */}
                  <div className="mb-3">
                    <div className="flex justify-between text-xs text-gray-600 mb-1">
                      <span>Progress</span>
                      <span className="font-semibold">{project.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${project.progress}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="pt-3 border-t border-gray-100 mt-2">
                  {project.links?.live && (
                    <a
                      href={project.links.live}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 transition font-medium"
                    >
                      <ExternalLink className="w-4 h-4" />
                      View Live Site
                    </a>
                  )}

                  <div className="text-xs text-gray-500 mt-3">
                    Last updated: {new Date(project.updatedAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      
        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full p-6 text-center">
              <Trash2 className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">Confirm Deletion</h3>
              <p className="text-gray-600 mb-6">Are you sure you want to delete this project? This action cannot be undone.</p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(null)}
                  className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300 font-medium transition"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(showDeleteConfirm)}
                  className="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 font-medium transition shadow-md"
                >
                  Yes, Delete
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Create Project Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[95vh] overflow-y-auto p-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Create New Project</h2>
                <button onClick={() => {setShowCreateModal(false); setSelectedRepo(null);}} className="text-gray-400 hover:text-gray-600">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left Column: Project Details */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800 border-b pb-2 mb-2">Project Details</h3>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                    <input
                      type="text"
                      value={newProject.name}
                      onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg p-3 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="My Awesome Project"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea
                      value={newProject.description}
                      onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg p-3 focus:ring-blue-500 focus:border-blue-500"
                      rows={3}
                      placeholder="What is this project about?"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <select
                      value={newProject.status}
                      onChange={(e) => setNewProject({ ...newProject, status: e.target.value as NewProjectState['status'] })}
                      className="w-full border border-gray-300 rounded-lg p-3 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="planning">Planning</option>
                      <option value="in-progress">In Progress</option>
                      <option value="completed">Completed</option>
                      <option value="on-hold">On Hold</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Technologies (comma-separated)</label>
                    <input
                      type="text"
                      value={newProject.technologies}
                      onChange={(e) => setNewProject({ ...newProject, technologies: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg p-3 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="React, Node.js, Tailwind"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Live URL</label>
                    <input
                      type="url"
                      value={newProject.liveUrl}
                      onChange={(e) => setNewProject({ ...newProject, liveUrl: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg p-3 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="https://myproject.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Progress: <span className="font-semibold">{newProject.progress}%</span>
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={newProject.progress}
                      onChange={(e) => setNewProject({ ...newProject, progress: parseInt(e.target.value) })}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer range-lg accent-blue-600"
                    />
                  </div>
                </div>

                {/* Right Column: GitHub Selection */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800 border-b pb-2 mb-2 flex items-center gap-2">
                    <Github className="w-5 h-5" />
                    Link GitHub Repository
                  </h3>
                  {githubUser && repositories.length > 0 ? (
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                      <p className="text-sm font-medium text-gray-700 mb-3">Select a repository to link (Optional):</p>
                      <div className="max-h-64 overflow-y-auto pr-2">
                        {repositories.map((repo) => (
                          <div
                            key={repo.id}
                            onClick={() => setSelectedRepo(selectedRepo?.id === repo.id ? null : repo)}
                            className={`p-3 cursor-pointer rounded-lg mb-2 transition flex justify-between items-center ${
                              selectedRepo?.id === repo.id 
                                ? "bg-blue-100 border border-blue-400" 
                                : "bg-white border border-gray-200 hover:bg-gray-50"
                            }`}
                          >
                            <div>
                              <p className="text-sm font-semibold text-gray-800">{repo.name}</p>
                              <p className="text-xs text-gray-500 line-clamp-1">
                                {repo.description || "No description"}
                              </p>
                              <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                                {repo.language && (
                                  <span className="flex items-center gap-1">
                                    <span
                                      className={`w-2 h-2 rounded-full ${getLanguageColor(repo.language)}`}
                                    ></span>
                                    {repo.language}
                                  </span>
                                )}
                                <span className="flex items-center gap-1">
                                  <Star className="w-3 h-3 text-yellow-500" />
                                  {repo.stars}
                                </span>
                                <span className="flex items-center gap-1">
                                  <GitFork className="w-3 h-3 text-blue-500" />
                                  {repo.forks}
                                </span>
                              </div>
                            </div>
                            {selectedRepo?.id === repo.id && (
                              <CheckCircle className="w-5 h-5 text-blue-600 shrink-0" />
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : githubUser ? (
                    <div className="text-sm text-gray-600 bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
                      <p>No repositories found or access not granted.</p>
                      <button
                        onClick={fetchRepositories}
                        className="mt-3 text-blue-600 hover:underline font-medium"
                      >
                        Refresh Repositories
                      </button>
                    </div>
                  ) : (
                    <div className="text-center text-gray-600 bg-gray-50 border border-gray-200 rounded-lg p-4">
                      <p className="text-sm mb-2">No GitHub account connected.</p>
                      <button
                        onClick={connectGitHub}
                        className="text-sm bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition"
                      >
                        Connect GitHub
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Footer Buttons */}
              <div className="flex justify-end gap-3 mt-8 border-t pt-4">
                <button
                  onClick={() => { setShowCreateModal(false); setSelectedRepo(null); }}
                  className="bg-gray-200 text-gray-700 px-5 py-2 rounded-lg hover:bg-gray-300 font-medium transition"
                >
                  Cancel
                </button>
                <button
                  onClick={createProject}
                  className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 font-medium shadow-md transition"
                >
                  Create Project
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectTracker;
