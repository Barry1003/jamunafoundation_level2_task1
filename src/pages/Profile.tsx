import React, { useState, useEffect } from 'react';
import { Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin, Loader, Github } from 'lucide-react';
import AboutTab from '../components/ProfileComponent/About';
import ExperienceTab from '../components/ProfileComponent/Expirience';
import SettingsTab from '../components/ProfileComponent/settings';

type TabType = 'about' | 'experience' | 'Resume_settings';

interface UserType {
  _id: string;
  fullName: string;
  email?: string;
  username: string;
  firstName?: string;
  avatar?: string;
  authProvider: "local" | "github";
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
    github: string;
  };
}

const Profile: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('about');
  const [user, setUser] = useState<UserType | null>(null);
  const [resumeData, setResumeData] = useState<ResumeData | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch user from /api/auth/me
  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem('token');
      
      if (!token) {
        console.log('❌ No token found');
        setLoading(false);
        return;
      }

      try {
        console.log('🔍 Fetching user from /api/auth/me');
        const response = await fetch('/api/auth/me', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        console.log('📡 Response status:', response.status);

        if (response.ok) {
          const userData = await response.json();
          console.log('✅ User data fetched:', userData);
          setUser(userData);
          
          // Also save to localStorage for quick access
          localStorage.setItem('activeUser', JSON.stringify(userData));
        } else {
          console.error('❌ Failed to fetch user');
          localStorage.removeItem('token');
          localStorage.removeItem('activeUser');
        }
      } catch (error) {
        console.error('❌ Error fetching user:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  // Fetch resume data for sidebar
  useEffect(() => {
    const fetchResume = async () => {
      if (!user) return;

      const token = localStorage.getItem('token');
      if (!token) return;

      try {
        console.log('📋 Fetching resume for sidebar');
        const response = await fetch(`/api/resume/${user._id}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const data = await response.json();
          console.log('✅ Resume data fetched for sidebar:', data);
          setResumeData(data);
        }
      } catch (error) {
        console.error('❌ Error fetching resume for sidebar:', error);
      }
    };

    fetchResume();
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader className="w-8 h-8 animate-spin text-blue-600" />
        <span className="ml-3 text-gray-600">Loading profile...</span>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <p className="text-red-600 mb-4">Please log in to view your profile.</p>
          <a href="/login" className="text-blue-600 hover:underline">Go to Login</a>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Left Sidebar - Profile Info from Resume */}
      <div className="w-80 bg-white shadow-sm overflow-y-auto">
        <div className="p-6 text-center border-b">
          {/* Avatar */}
          {user?.avatar ? (
            <img
              src={user.avatar}
              alt={user.fullName}
              className="w-24 h-24 mx-auto rounded-full object-cover shadow-sm border-2 border-gray-200 mb-3"
            />
          ) : (
            <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center mb-3">
              <span className="text-3xl font-bold text-white">
                {user?.fullName ? user.fullName[0].toUpperCase() : "?"}
              </span>
            </div>
          )}

          {/* Name and Username */}
          <h2 className="text-xl font-bold text-gray-900">
            {resumeData?.fullName || user?.fullName || 'Guest User'}
          </h2>
          <p className="text-sm text-gray-500 mb-2">
            @{user?.username || 'no-username'}
          </p>

          {/* Job Title from Resume */}
          {resumeData?.jobTitle && (
            <p className="text-sm text-blue-600 font-medium mb-4">
              {resumeData.jobTitle}
            </p>
          )}

          {/* Resume Info */}
          <div className="text-left space-y-3 mt-6">
            {/* About Me from Resume */}
            {resumeData?.aboutMe && (
              <div>
                <h3 className="text-xs font-semibold text-gray-500 uppercase mb-1">About Me:</h3>
                <p className="text-sm text-gray-700">{resumeData.aboutMe}</p>
              </div>
            )}

            {/* Full Name */}
            <div>
              <h3 className="text-xs font-semibold text-gray-500 uppercase mb-1">Full Name:</h3>
              <p className="text-sm text-gray-700">
                {resumeData?.fullName || user?.fullName || 'N/A'}
              </p>
            </div>

            {/* Phone from Resume */}
            {resumeData?.phone && (
              <div>
                <h3 className="text-xs font-semibold text-gray-500 uppercase mb-1">Mobile:</h3>
                <p className="text-sm text-gray-700 flex items-center gap-2">
                  <Phone className="w-3 h-3" />
                  {resumeData.phone}
                </p>
              </div>
            )}

            {/* Email */}
            {user?.email && (
              <div>
                <h3 className="text-xs font-semibold text-gray-500 uppercase mb-1">Email:</h3>
                <p className="text-sm text-gray-700 flex items-center gap-2">
                  <Mail className="w-3 h-3" />
                  {user.email}
                </p>
              </div>
            )}

            {/* Location from Resume */}
            {resumeData?.location && (
              <div>
                <h3 className="text-xs font-semibold text-gray-500 uppercase mb-1">Location:</h3>
                <p className="text-sm text-gray-700 flex items-center gap-2">
                  <MapPin className="w-3 h-3" />
                  {resumeData.location}
                </p>
              </div>
            )}
          </div>

          {/* Social Links from Resume */}
          {resumeData?.socialLinks && (
            <div className="flex justify-center gap-3 mt-6">
              {resumeData.socialLinks.facebook && (
                <a
                  href={resumeData.socialLinks.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-700 transition-colors"
                >
                  <Facebook className="w-5 h-5" />
                </a>
              )}
              {resumeData.socialLinks.twitter && (
                <a
                  href={resumeData.socialLinks.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-500 transition-colors"
                >
                  <Twitter className="w-5 h-5" />
                </a>
              )}
              {resumeData.socialLinks.instagram && (
                <a
                  href={resumeData.socialLinks.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-red-500 hover:text-red-600 transition-colors"
                >
                  <Instagram className="w-5 h-5" />
                </a>
              )}
              {resumeData.socialLinks.linkedin && (
                <a
                  href={resumeData.socialLinks.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-700 hover:text-blue-800 transition-colors"
                >
                  <Linkedin className="w-5 h-5" />
                </a>
              )}
              {resumeData.socialLinks.github && (
                <a
                  href={resumeData.socialLinks.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-800 hover:text-gray-900 transition-colors"
                >
                  <Github className="w-5 h-5" />
                </a>
              )}
            </div>
          )}

          {/* Show message if no resume data */}
          {!resumeData && (
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-700">
                Complete your resume in Settings to display your information here.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Main Content - Right side */}
      <div className="flex-1 overflow-y-auto">
        {/* Tabs */}
        <div className="bg-white border-b">
          <div className="flex">
            <button
              onClick={() => setActiveTab('about')}
              className={`px-8 py-4 font-medium text-sm transition-colors relative ${
                activeTab === 'about' ? 'text-blue-600 bg-blue-50' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              About
              {activeTab === 'about' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"></div>}
            </button>
            <button
              onClick={() => setActiveTab('experience')}
              className={`px-8 py-4 font-medium text-sm transition-colors relative ${
                activeTab === 'experience' ? 'text-blue-600 bg-blue-50' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              Experience
              {activeTab === 'experience' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"></div>}
            </button> 
            <button
              onClick={() => setActiveTab('Resume_settings')}
              className={`px-8 py-4 font-medium text-sm transition-colors relative ${
                activeTab === 'Resume_settings' ? 'text-blue-600 bg-blue-50' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              Resume Settings
              {activeTab === 'Resume_settings' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"></div>}
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="p-8">
          {activeTab === 'about' && <AboutTab user={user} />}
          {activeTab === 'experience' && <ExperienceTab />} 
          {activeTab === 'Resume_settings' && <SettingsTab user={user} />}
        </div>
      </div>
    </div>
  );
};

export default Profile;
