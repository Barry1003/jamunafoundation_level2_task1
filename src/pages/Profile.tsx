import React, { useState, useEffect } from 'react';
import { User, MessageSquare, Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin } from 'lucide-react';
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

const Profile: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('about');
  const [user, setUser] = useState<UserType | null>(null);

  const contacts = [
    { name: 'Sophia', role: 'Project Manager', avatar: null },
    { name: 'Mason', role: 'Art Director', avatar: null },
    { name: 'Emily', role: 'UI/UX Manager', avatar: null },
    { name: 'Daniel', role: 'Software Head', avatar: null },
    { name: 'Natalie', role: 'AR Manager', avatar: null }
  ];

  useEffect(() => {
    const storedUser = localStorage.getItem('activeUser');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Left Sidebar - Profile and Contacts */}
      <div className="w-80 bg-white shadow-sm overflow-y-auto">
        {/* Profile Section */}
        <div className="p-6 text-center border-b">
          {user?.avatar ? (
            <img
              src={user.avatar}
              alt={user.fullName}
              className="w-24 h-24 mx-auto rounded-full object-cover shadow-sm border-2 border-gray-200 mb-3"
            />
          ) : (
            <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center mb-3">
              <span className="text-3xl font-bold text-white">
                {user?.firstName ? user.firstName[0].toUpperCase() : "?"}
              </span>
            </div>
          )}
          <h2 className="text-xl font-bold text-gray-900">{user?.fullName || 'Guest User'}</h2>
          <p className="text-sm text-gray-500 mb-4">
            @{user?.username || 'no-username'}
          </p>

          <div className="flex gap-2 justify-center mb-4">
            <button className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors">
              Follow
            </button>
            <button className="bg-gray-100 text-gray-700 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-200 transition-colors flex items-center gap-1">
              <MessageSquare className="w-4 h-4" />
              Message
            </button>
          </div>

          <div className="text-left space-y-3 mt-6">
            <div>
              <h3 className="text-xs font-semibold text-gray-500 uppercase mb-1">About Me:</h3>
              <p className="text-sm text-gray-700">Nil Yeager has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type.</p>
            </div>

            <div>
              <h3 className="text-xs font-semibold text-gray-500 uppercase mb-1">Full Name:</h3>
              <p className="text-sm text-gray-700">{user?.fullName || 'N/A'}</p>
            </div>

            <div>
              <h3 className="text-xs font-semibold text-gray-500 uppercase mb-1">Mobile:</h3>
              <p className="text-sm text-gray-700 flex items-center gap-2">
                <Phone className="w-3 h-3" />
                (123) 123 1234
              </p>
            </div>

            <div>
              <h3 className="text-xs font-semibold text-gray-500 uppercase mb-1">Email:</h3>
              <p className="text-sm text-gray-700 flex items-center gap-2">
                <Mail className="w-3 h-3" />
                {user?.email || 'Not provided'}
              </p>
            </div>

            <div>
              <h3 className="text-xs font-semibold text-gray-500 uppercase mb-1">Location:</h3>
              <p className="text-sm text-gray-700 flex items-center gap-2">
                <MapPin className="w-3 h-3" />
                USA
              </p>
            </div>
          </div>

          <div className="flex justify-center gap-3 mt-6">
            <a href="#" className="text-blue-600 hover:text-blue-700 transition-colors">
              <Facebook className="w-5 h-5" />
            </a>
            <a href="#" className="text-blue-400 hover:text-blue-500 transition-colors">
              <Twitter className="w-5 h-5" />
            </a>
            <a href="#" className="text-red-500 hover:text-red-600 transition-colors">
              <Instagram className="w-5 h-5" />
            </a>
            <a href="#" className="text-blue-700 hover:text-blue-800 transition-colors">
              <Linkedin className="w-5 h-5" />
            </a>
          </div>
        </div>

        {/* Contacts Section */}
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-900">Contact</h3>
          </div>
          <ul className="space-y-3">
            {contacts.map((contact, index) => (
              <li key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{contact.name}</p>
                    <p className="text-xs text-gray-500">{contact.role}</p>
                  </div>
                </div>
                <button className="bg-blue-600 text-white px-3 py-1 rounded text-xs font-medium hover:bg-blue-700 transition-colors">
                  Reply
                </button>
              </li>
            ))}
          </ul>
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
              Resume_settings
              {activeTab === 'Resume_settings' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"></div>}
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="p-8">
          {activeTab === 'about' && <AboutTab />}
          {activeTab === 'experience' && <ExperienceTab />} 
          {activeTab === 'Resume_settings' && <SettingsTab user={user} />}

        </div>
      </div>
    </div>
  );
};

export default Profile;
