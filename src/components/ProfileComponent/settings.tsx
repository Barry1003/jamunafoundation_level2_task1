import React, { useEffect, useState } from 'react';
import { Plus, Trash2, X } from 'lucide-react';
import { apiRequest, API_ENDPOINTS } from '../../config/api';

interface UserType {
  _id: string;
  username: string;
  fullName?: string;
  email?: string;
}

interface SettingsTabProps {
  user?: UserType | null;
}

interface Experience {
  _id?: string;
  title: string;
  company: string;
  startDate: string;
  endDate: string;
  description: string;
  current: boolean;
}

const SettingsTab: React.FC<SettingsTabProps> = ({ user }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [form, setForm] = useState<any>({
    fullName: '',
    jobTitle: '',
    phone: '',
    location: '',
    aboutMe: '',
    socialLinks: { facebook: '', twitter: '', linkedin: '', instagram: '', github: '' },
    skills: [] as string[],
    education: [] as { degree: string; institution: string; year: string }[],
    experiences: [] as Experience[],
    selectedProjects: [] as string[]
  });
  const [projects, setProjects] = useState<any[]>([]);
  const [newSkill, setNewSkill] = useState('');
  const [showExperienceModal, setShowExperienceModal] = useState(false);
  const [editingExperience, setEditingExperience] = useState<Experience | null>(null);
  const [experienceForm, setExperienceForm] = useState<Experience>({
    title: '',
    company: '',
    startDate: '',
    endDate: '',
    description: '',
    current: false
  });

  const getToken = () => {
    return localStorage.getItem('token');
  };

  useEffect(() => {
    async function fetchData() {
      if (!user) return;
      
      const token = getToken();
      if (!token) {
        setError('Not authenticated. Please login.');
        return;
      }

      try {
        setLoading(true);

        // Fetch resume data
        const resumeData = await apiRequest(`${API_ENDPOINTS.RESUME.GET}/${user._id}`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        console.log('📋 Fetched Resume Data:', resumeData);
        
        setForm({
          fullName: resumeData.fullName || user.fullName || '',
          jobTitle: resumeData.jobTitle || '',
          phone: resumeData.phone || '',
          location: resumeData.location || '',
          aboutMe: resumeData.aboutMe || '',
          socialLinks: resumeData.socialLinks || { 
            facebook: '', 
            twitter: '', 
            linkedin: '', 
            instagram: '',
            github: ''
          },
          skills: resumeData.skills || [],
          education: resumeData.education || [],
          experiences: resumeData.experiences || [],
          selectedProjects: resumeData.selectedProjects?.map((p: any) => 
            typeof p === 'string' ? p : p._id
          ) || []
        });
        
        console.log('📦 Selected Project IDs:', resumeData.selectedProjects?.map((p: any) => 
          typeof p === 'string' ? p : p._id
        ));

        // Fetch all projects
        const projectsData = await apiRequest(API_ENDPOINTS.PROJECTS.GET_ALL, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        console.log('📦 Fetched Projects:', projectsData);
        console.log('📦 Number of projects:', projectsData.length);
        setProjects(projectsData);

      } catch (err: any) {
        console.error('❌ Error loading data:', err);
        setError(err.message || 'Error loading data');
        // Set default form if resume doesn't exist
        setForm((prev: any) => ({
          ...prev,
          fullName: user.fullName || ''
        }));
      } finally {
        setLoading(false);
      }
    }
    
    fetchData();
  }, [user]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value } = e.target;
    setForm((prev: any) => ({ ...prev, [name]: value }));
  }

  function handleSocialChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setForm((prev: any) => ({
      ...prev,
      socialLinks: { ...prev.socialLinks, [name]: value }
    }));
  }

  function handleAddSkill() {
    if (newSkill.trim()) {
      setForm((prev: any) => ({
        ...prev,
        skills: [...prev.skills, newSkill.trim()]
      }));
      setNewSkill('');
    }
  }

  function handleRemoveSkill(index: number) {
    setForm((prev: any) => ({
      ...prev,
      skills: prev.skills.filter((_: string, i: number) => i !== index)
    }));
  }

  function openExperienceModal(experience?: Experience) {
    if (experience) {
      setEditingExperience(experience);
      setExperienceForm(experience);
    } else {
      setEditingExperience(null);
      setExperienceForm({
        title: '',
        company: '',
        startDate: '',
        endDate: '',
        description: '',
        current: false
      });
    }
    setShowExperienceModal(true);
  }

  function closeExperienceModal() {
    setShowExperienceModal(false);
    setEditingExperience(null);
    setExperienceForm({
      title: '',
      company: '',
      startDate: '',
      endDate: '',
      description: '',
      current: false
    });
  }

  function handleExperienceChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setExperienceForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  }

  function handleSaveExperience() {
    if (!experienceForm.title || !experienceForm.company || !experienceForm.startDate) {
      setError('Please fill in all required fields');
      setTimeout(() => setError(''), 3000);
      return;
    }

    if (editingExperience) {
      // Editing existing experience - use array index for tracking
      setForm((prev: any) => ({
        ...prev,
        experiences: prev.experiences.map((exp: Experience, index: number) =>
          index === prev.experiences.indexOf(editingExperience) ? { ...experienceForm } : exp
        )
      }));
    } else {
      // Adding new experience - no _id needed
      setForm((prev: any) => ({
        ...prev,
        experiences: [...prev.experiences, { ...experienceForm }]
      }));
    }

    closeExperienceModal();
  }

  function handleDeleteExperience(index: number) {
    setForm((prev: any) => ({
      ...prev,
      experiences: prev.experiences.filter((_: Experience, i: number) => i !== index)
    }));
  }

  function handleProjectToggle(projectId: string) {
    setForm((prev: any) => {
      const selectedProjects = prev.selectedProjects.includes(projectId)
        ? prev.selectedProjects.filter((id: string) => id !== projectId)
        : [...prev.selectedProjects, projectId];
      
      console.log('📦 Updated Selected Projects:', selectedProjects);
      return { ...prev, selectedProjects };
    });
  }

  function navigateToProjects() {
    window.location.href = '/projects';
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    if (!user) {
      setError('User is not logged in');
      return;
    }

    const token = getToken();
    if (!token) {
      setError('Not authenticated. Please login.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setSuccess('');

      console.log('💾 Saving Resume...');
      console.log('💾 Selected Project IDs:', form.selectedProjects);
      console.log('💾 Full Form Data:', form);

      // Clean experiences: remove any _id fields to let MongoDB handle them
      const formDataToSend = {
        ...form,
        experiences: form.experiences.map((exp: Experience) => {
          const {...expWithoutId } = exp;
          return expWithoutId;
        })
      };

      console.log('💾 Cleaned Form Data:', formDataToSend);

      const savedResume = await apiRequest(`${API_ENDPOINTS.RESUME.UPDATE}/${user._id}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formDataToSend)
      });

      console.log('✅ Resume Saved Successfully:', savedResume);
      console.log('✅ Saved selectedProjects:', savedResume.selectedProjects);
      
      // Update form state with the server response to sync any backend changes
      setForm({
        fullName: savedResume.fullName || '',
        jobTitle: savedResume.jobTitle || '',
        phone: savedResume.phone || '',
        location: savedResume.location || '',
        aboutMe: savedResume.aboutMe || '',
        socialLinks: savedResume.socialLinks || { 
          facebook: '', 
          twitter: '', 
          linkedin: '', 
          instagram: '',
          github: ''
        },
        skills: savedResume.skills || [],
        education: savedResume.education || [],
        experiences: savedResume.experiences || [],
        selectedProjects: savedResume.selectedProjects?.map((p: any) => 
          typeof p === 'string' ? p : p._id
        ) || []
      });
      
      setSuccess('Resume saved successfully! ✅');
      setTimeout(() => setSuccess(''), 3000);

    } catch (err: any) {
      console.error('❌ Error saving resume:', err);
      setError(err.message || 'Error saving data');
    } finally {
      setLoading(false);
    }
  }

  if (!user) {
    return <div className="text-red-600">Please log in to edit your resume.</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-3xl font-bold mb-8">Resume Settings</h2>

      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">
          {success}
        </div>
      )}

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          Error: {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Personal Info Section */}
        <section className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-xl font-semibold mb-4">Personal Information</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block mb-1 font-medium">Full Name (as shown on resume)</label>
              <input 
                name="fullName" 
                value={form.fullName} 
                onChange={handleChange} 
                className="border p-2 w-full rounded"
                placeholder="e.g. John Michael Doe"
              />
              <p className="text-xs text-gray-600 mt-1">
                💡 This name will appear on your resume. Your username ({user.username}) remains unchanged.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block mb-1 font-medium">Job Title</label>
                <input 
                  name="jobTitle" 
                  value={form.jobTitle} 
                  onChange={handleChange} 
                  className="border p-2 w-full rounded"
                  placeholder="e.g. Senior Developer"
                />
              </div>

              <div>
                <label className="block mb-1 font-medium">Phone</label>
                <input 
                  name="phone" 
                  value={form.phone} 
                  onChange={handleChange} 
                  className="border p-2 w-full rounded"
                  placeholder="e.g. +1 234 567 8900"
                />
              </div>
            </div>

            <div>
              <label className="block mb-1 font-medium">Location</label>
              <input 
                name="location" 
                value={form.location} 
                onChange={handleChange} 
                className="border p-2 w-full rounded"
                placeholder="e.g. San Francisco, CA"
              />
            </div>

            <div>
              <label className="block mb-1 font-medium">About Me</label>
              <textarea 
                name="aboutMe" 
                value={form.aboutMe} 
                onChange={handleChange} 
                className="border p-2 w-full rounded" 
                rows={4}
                placeholder="Tell us about yourself..."
              />
            </div>
          </div>
        </section>

        {/* Social Links Section */}
        <section className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-xl font-semibold mb-4">Social Links</h3>
          <div className="grid grid-cols-2 gap-4">
            {['facebook', 'twitter', 'linkedin', 'instagram', 'github'].map((name) => (
              <div key={name}>
                <label className="block mb-1 capitalize font-medium">{name}</label>
                <input
                  name={name}
                  value={form.socialLinks[name]}
                  onChange={handleSocialChange}
                  className="border p-2 w-full rounded"
                  placeholder={`https://${name}.com/yourprofile`}
                />
              </div>
            ))}
          </div>
        </section>

        {/* Skills Section */}
        <section className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-xl font-semibold mb-4">Skills</h3>
          
          <div className="flex gap-2 mb-4">
            <input
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSkill())}
              placeholder="Add a skill (e.g. JavaScript)"
              className="border p-2 flex-1 rounded"
            />
            <button
              type="button"
              onClick={handleAddSkill}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            {form.skills.map((skill: string, index: number) => (
              <div
                key={index}
                className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full flex items-center gap-2"
              >
                <span>{skill}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveSkill(index)}
                  className="hover:text-blue-900"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          {form.skills.length === 0 && (
            <p className="text-gray-500 text-sm">No skills added yet. Add your first skill above.</p>
          )}
        </section>

        {/* Experience Section */}
        <section className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold">Work Experience</h3>
            <button
              type="button"
              onClick={() => openExperienceModal()}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Experience
            </button>
          </div>

          <div className="space-y-4">
            {form.experiences.map((exp: Experience, index: number) => (
              <div key={index} className="border p-4 rounded-lg">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h4 className="font-semibold text-lg">{exp.title}</h4>
                    <p className="text-gray-600">{exp.company}</p>
                    <p className="text-sm text-gray-500">
                      {exp.startDate} - {exp.current ? 'Present' : exp.endDate}
                    </p>
                    {exp.description && (
                      <p className="text-sm text-gray-700 mt-2">{exp.description}</p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => openExperienceModal(exp)}
                      className="text-blue-600 hover:text-blue-800 text-sm"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteExperience(index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {form.experiences.length === 0 && (
            <p className="text-gray-500 text-sm">No experience added yet. Click "Add Experience" to get started.</p>
          )}
        </section>

        {/* Projects Section */}
        <section className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold">Featured Projects</h3>
            <button
              type="button"
              onClick={navigateToProjects}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add New Project
            </button>
          </div>

          {projects.length === 0 ? (
            <div className="text-center py-8 bg-gray-50 rounded-lg">
              <p className="text-gray-500 mb-4">No projects found. Create your first project!</p>
              <button
                type="button"
                onClick={navigateToProjects}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Go to Projects Page
              </button>
            </div>
          ) : (
            <div>
              <p className="text-sm text-gray-600 mb-3">
                Select projects to feature on your resume ({form.selectedProjects.length} selected)
              </p>
              <div className="grid grid-cols-2 gap-3 max-h-64 overflow-auto p-2 border rounded">
                {projects.map((project) => (
                  <label 
                    key={project._id} 
                    className="flex items-start gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded"
                  >
                    <input
                      type="checkbox"
                      checked={form.selectedProjects.includes(project._id)}
                      onChange={() => handleProjectToggle(project._id)}
                      className="w-4 h-4 mt-1"
                    />
                    <div>
                      <span className="text-sm font-medium">{project.name}</span>
                      {project.status && (
                        <span className="text-xs text-gray-500 ml-2">({project.status})</span>
                      )}
                    </div>
                  </label>
                ))}
              </div>
            </div>
          )}
        </section>

        <button 
          type="submit" 
          disabled={loading}
          className={`w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition ${
            loading ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {loading ? 'Saving...' : 'Save Resume'}
        </button>
      </form>

      {/* Experience Modal */}
      {showExperienceModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-2xl font-bold">
                {editingExperience ? 'Edit Experience' : 'Add Experience'}
              </h3>
              <button onClick={closeExperienceModal} className="text-gray-500 hover:text-gray-700">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block mb-1 font-medium">Job Title *</label>
                <input
                  name="title"
                  value={experienceForm.title}
                  onChange={handleExperienceChange}
                  className="border p-2 w-full rounded"
                  placeholder="e.g. Senior Developer"
                />
              </div>

              <div>
                <label className="block mb-1 font-medium">Company *</label>
                <input
                  name="company"
                  value={experienceForm.company}
                  onChange={handleExperienceChange}
                  className="border p-2 w-full rounded"
                  placeholder="e.g. Google"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1 font-medium">Start Date *</label>
                  <input
                    type="month"
                    name="startDate"
                    value={experienceForm.startDate}
                    onChange={handleExperienceChange}
                    className="border p-2 w-full rounded"
                  />
                </div>

                <div>
                  <label className="block mb-1 font-medium">End Date</label>
                  <input
                    type="month"
                    name="endDate"
                    value={experienceForm.endDate}
                    onChange={handleExperienceChange}
                    disabled={experienceForm.current}
                    className="border p-2 w-full rounded disabled:bg-gray-100"
                  />
                </div>
              </div>

              <div>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="current"
                    checked={experienceForm.current}
                    onChange={handleExperienceChange}
                    className="w-4 h-4"
                  />
                  <span className="text-sm font-medium">I currently work here</span>
                </label>
              </div>

              <div>
                <label className="block mb-1 font-medium">Description</label>
                <textarea
                  name="description"
                  value={experienceForm.description}
                  onChange={handleExperienceChange}
                  rows={4}
                  className="border p-2 w-full rounded"
                  placeholder="Describe your responsibilities and achievements..."
                />
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={closeExperienceModal}
                  className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveExperience}
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                  {editingExperience ? 'Update' : 'Add'} Experience
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingsTab;
