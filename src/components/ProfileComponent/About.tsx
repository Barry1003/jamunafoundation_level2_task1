import React, { useEffect, useState, useRef } from 'react';
import { Download, Mail, Phone, MapPin, Globe, Linkedin, Twitter, Facebook, Loader } from 'lucide-react';

interface UserType {
  _id: string;
  username: string;
  fullName?: string;
  email?: string;
}

interface AboutTabProps {
  user?: UserType | null;
}

interface ResumeData {
  fullName: string;
  jobTitle: string;
  phone: string;
  location: string;
  aboutMe: string;
  socialLinks: {
    facebook: string;
    twitter: string;
    linkedin: string;
    instagram: string;
    github: string; // added github
  };
  skills: string[];
  experiences: Array<{
    _id: string;
    title: string;
    company: string;
    startDate: string;
    endDate: string;
    description: string;
    current: boolean;
  }>;
  selectedProjects: Array<{
    _id: string;
    name: string;
    description: string;
    status: string;
    technologies: string[];
    links?: {
      live?: string;
      demo?: string;
    };
    createdAt: string;
  }>;
}

const API_BASE_URL = 'http://localhost:5000/api';

const AboutTab: React.FC<AboutTabProps> = ({ user }) => {
  const [resumeData, setResumeData] = useState<ResumeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const resumeRef = useRef<HTMLDivElement>(null);

  const getToken = () => localStorage.getItem('token');

  useEffect(() => {
    async function fetchResume() {
      if (!user) return;

      const token = getToken();
      if (!token) {
        setError('Not authenticated');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await fetch(`${API_BASE_URL}/resume/${user._id}`, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setResumeData(data);
          setError('');
        } else {
          setError('Failed to load resume');
        }
      } catch (err) {
        console.error('Error fetching resume:', err);
        setError('Error loading resume data');
      } finally {
        setLoading(false);
      }
    }

    fetchResume();
  }, [user]);

  const handleDownloadPDF = async () => {
    if (!resumeRef.current) return;

    try {
      const html2pdf = (await import('html2pdf.js')).default;

      const opt = {
        margin: 0.5,
        filename: `${resumeData?.fullName || 'resume'}_resume.pdf`,
        image: { type: 'jpeg' as 'jpeg', quality: 0.98 }, // type assertion
        html2canvas: { scale: 2, logging: false },
        jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' },
      };

      html2pdf().set(opt).from(resumeRef.current).save();
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Please install html2pdf.js: npm install html2pdf.js');
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const [year, month] = dateString.split('-');
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${monthNames[parseInt(month) - 1]} ${year}`;
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      planning: 'bg-gray-100 text-gray-700',
      'in-progress': 'bg-blue-100 text-blue-700',
      completed: 'bg-green-100 text-green-700',
      'on-hold': 'bg-yellow-100 text-yellow-700',
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader className="w-8 h-8 animate-spin text-blue-600" />
        <span className="ml-3 text-gray-600">Loading resume...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
        {error}
      </div>
    );
  }

  if (!resumeData) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">No resume data found. Please update your settings.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Download Button */}
      <div className="flex justify-end">
        <button
          onClick={handleDownloadPDF}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2 shadow-sm transition"
        >
          <Download className="w-5 h-5" />
          Download PDF
        </button>
      </div>

      {/* Resume Content */}
      <div
        ref={resumeRef}
        className="bg-white shadow-lg rounded-lg overflow-hidden"
        style={{ maxWidth: '8.5in', margin: '0 auto' }}
      >
        <div className="p-8 md:p-12">
          {/* Header */}
          <div className="border-b-4 border-blue-600 pb-6 mb-6">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              {resumeData.fullName || user?.fullName || 'Your Name'}
            </h1>
            <h2 className="text-xl text-blue-600 font-medium mb-4">
              {resumeData.jobTitle || 'Professional Title'}
            </h2>

            <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-gray-600">
              {user?.email && (
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  <span>{user.email}</span>
                </div>
              )}
              {resumeData.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  <span>{resumeData.phone}</span>
                </div>
              )}
              {resumeData.location && (
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  <span>{resumeData.location}</span>
                </div>
              )}
            </div>

            <div className="flex flex-wrap gap-4 mt-3">
              {resumeData.socialLinks.linkedin && (
                <a
                  href={resumeData.socialLinks.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-sm text-blue-600 hover:underline"
                >
                  <Linkedin className="w-4 h-4" />
                  LinkedIn
                </a>
              )}
              {resumeData.socialLinks.github && (
                <a
                  href={resumeData.socialLinks.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-sm text-blue-600 hover:underline"
                >
                  GitHub
                </a>
              )}
              {resumeData.socialLinks.twitter && (
                <a
                  href={resumeData.socialLinks.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-sm text-blue-600 hover:underline"
                >
                  <Twitter className="w-4 h-4" />
                  Twitter
                </a>
              )}
              {resumeData.socialLinks.facebook && (
                <a
                  href={resumeData.socialLinks.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-sm text-blue-600 hover:underline"
                >
                  <Facebook className="w-4 h-4" />
                  Facebook
                </a>
              )}
            </div>
          </div>

          {/* About, Skills, Experience, Projects, Footer */}
          {resumeData.aboutMe && (
            <section className="mb-8">
              <h3 className="text-xl font-bold text-gray-900 mb-3 border-b-2 border-gray-300 pb-2">
                PROFESSIONAL SUMMARY
              </h3>
              <p className="text-gray-700 leading-relaxed">{resumeData.aboutMe}</p>
            </section>
          )}

          {resumeData.skills?.length > 0 && (
            <section className="mb-8">
              <h3 className="text-xl font-bold text-gray-900 mb-3 border-b-2 border-gray-300 pb-2">SKILLS</h3>
              <div className="flex flex-wrap gap-2">
                {resumeData.skills.map((skill, index) => (
                  <span key={index} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                    {skill}
                  </span>
                ))}
              </div>
            </section>
          )}

          {resumeData.experiences?.length > 0 && (
            <section className="mb-8">
              <h3 className="text-xl font-bold text-gray-900 mb-4 border-b-2 border-gray-300 pb-2">WORK EXPERIENCE</h3>
              <div className="space-y-6">
                {resumeData.experiences.map((exp) => (
                  <div key={exp._id} className="relative pl-6 border-l-2 border-blue-600">
                    <div className="absolute w-3 h-3 bg-blue-600 rounded-full -left-[7px] top-1" />
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900">{exp.title}</h4>
                      <p className="text-md text-blue-600 font-medium">{exp.company}</p>
                      <p className="text-sm text-gray-500 mb-2">
                        {formatDate(exp.startDate)} - {exp.current ? 'Present' : formatDate(exp.endDate)}
                      </p>
                      {exp.description && (
                        <p className="text-gray-700 leading-relaxed text-sm">{exp.description}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {resumeData.selectedProjects?.length > 0 && (
            <section className="mb-8">
              <h3 className="text-xl font-bold text-gray-900 mb-4 border-b-2 border-gray-300 pb-2">FEATURED PROJECTS</h3>
              <div className="space-y-4">
                {resumeData.selectedProjects.map((project) => (
                  <div key={project._id} className="border-l-4 border-blue-600 pl-4">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="text-lg font-semibold text-gray-900">{project.name}</h4>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(project.status)}`}
                      >
                        {project.status.replace('-', ' ')}
                      </span>
                    </div>
                    {project.description && (
                      <p className="text-gray-700 text-sm mb-2">{project.description}</p>
                    )}
                    {project.technologies?.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-2">
                        <span className="text-xs text-gray-600 font-medium">Technologies:</span>
                        {project.technologies.map((tech, index) => (
                          <span key={index} className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
                            {tech}
                          </span>
                        ))}
                      </div>
                    )}
                    {project.links?.live && (
                      <a
                        href={project.links.live}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 text-sm hover:underline flex items-center gap-1"
                      >
                        <Globe className="w-3 h-3" />
                        View Project
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          <div className="text-center text-xs text-gray-500 mt-12 pt-6 border-t">
            Generated on {new Date().toLocaleDateString()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutTab;
