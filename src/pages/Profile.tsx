import React, { useState } from 'react';
import { User, MessageSquare, Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin } from 'lucide-react';

type TabType = 'about' | 'experience' | 'timeline' | 'settings';

const Profile: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('about');

  const contacts = [
    { name: 'Sophia', role: 'Project Manager', avatar: null },
    { name: 'Mason', role: 'Art Director', avatar: null },
    { name: 'Emily', role: 'UI/UX Manager', avatar: null },
    { name: 'Daniel', role: 'Software Head', avatar: null },
    { name: 'Natalie', role: 'AR Manager', avatar: null }
  ];

  const projects = [
    { id: 1, client: 'Nil Yeager', projectName: 'App design', startDate: '01/01/2015', dueDate: '10/15/2018', status: 'Work in Progress', statusColor: 'bg-blue-100 text-blue-700' },
    { id: 2, client: 'Micah', projectName: 'Coffee detail page', startDate: '21/07/2015', dueDate: '12/05/2018', status: 'Pending', statusColor: 'bg-pink-100 text-pink-700' },
    { id: 3, client: 'Lolly', projectName: 'Poster design', startDate: '18/03/2015', dueDate: '26/05/2018', status: 'Done', statusColor: 'bg-green-100 text-green-700' },
    { id: 4, client: 'ToddDoe', projectName: 'Bottle graphics', startDate: '02/10/2017', dueDate: '07/02/2018', status: 'Work in Progress', statusColor: 'bg-blue-100 text-blue-700' },
    { id: 5, client: 'Micah', projectName: 'Landing page', startDate: '17/01/2017', dueDate: '25/05/2021', status: 'Coming soon', statusColor: 'bg-yellow-100 text-yellow-700' }
  ];

  const experiences = [
    { title: 'Pmp Developer', company: 'Dummy.com', period: 'Year: 2016 - 18', description: 'Everyone realizes why a new common language would be desirable: one could refuse to pay expensive translators. To achieve this, it would be necessary to have uniform grammar, pronunciation and more common words.' },
    { title: 'UI/UX Designer', company: 'Dummy Inc', period: 'Year: 2015 - 16', description: 'If several languages coalesce, the grammar of the resulting language is more simple and regular than that of the individual languages. The new common language will be more simple and regular than the existing European languages.' },
    { title: 'Content creator', company: 'Dummy Plc', period: 'Year: 2014 - 15', description: 'The European languages are members of the same family. Their separate existence is a myth. For science music sport etc, Europe uses the same vocabulary. The languages only differ in their grammar their pronunciation.' }
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Left Sidebar - Profile and Contacts */}
      <div className="w-80 bg-white shadow-sm overflow-y-auto">
        {/* Profile Section */}
        <div className="p-6 text-center border-b">
          <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center mb-3">
            <User className="w-12 h-12 text-white" />
          </div>
          <h2 className="text-xl font-bold text-gray-900">Nil Yeager</h2>
          <p className="text-sm text-gray-500 mb-4">Project Manager</p>
          
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
              <p className="text-sm text-gray-700">Nil Yeager</p>
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
                nil@yeager.domain
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

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Tabs */}
        <div className="bg-white border-b">
          <div className="flex">
            <button
              onClick={() => setActiveTab('about')}
              className={`px-8 py-4 font-medium text-sm transition-colors relative ${
                activeTab === 'about'
                  ? 'text-blue-600 bg-blue-50'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              About
              {activeTab === 'about' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"></div>
              )}
            </button>
            <button
              onClick={() => setActiveTab('experience')}
              className={`px-8 py-4 font-medium text-sm transition-colors relative ${
                activeTab === 'experience'
                  ? 'text-blue-600 bg-blue-50'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              Experience
              {activeTab === 'experience' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"></div>
              )}
            </button>
            <button
              onClick={() => setActiveTab('timeline')}
              className={`px-8 py-4 font-medium text-sm transition-colors relative ${
                activeTab === 'timeline'
                  ? 'text-blue-600 bg-blue-50'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              Timeline
              {activeTab === 'timeline' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"></div>
              )}
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`px-8 py-4 font-medium text-sm transition-colors relative ${
                activeTab === 'settings'
                  ? 'text-blue-600 bg-blue-50'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              Settings
              {activeTab === 'settings' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"></div>
              )}
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="p-8">
          {activeTab === 'about' && (
            <div className="space-y-8">
              {/* Experience Section */}
              <div>
                <div className="flex items-center gap-2 mb-6">
                  <div className="w-1 h-6 bg-blue-600 rounded"></div>
                  <h3 className="text-lg font-bold text-gray-900 uppercase tracking-wide">Experience</h3>
                </div>
                <div className="space-y-6">
                  {experiences.map((exp, index) => (
                    <div key={index} className="flex gap-4">
                      <div className="w-2 h-2 bg-gray-400 rounded-full mt-2"></div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">{exp.title}</h4>
                        <p className="text-sm text-gray-500 mb-2">{exp.company} - {exp.period}</p>
                        <p className="text-sm text-gray-700 leading-relaxed">{exp.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Projects Section */}
              <div>
                <div className="flex items-center gap-2 mb-6">
                  <div className="w-1 h-6 bg-blue-600 rounded"></div>
                  <h3 className="text-lg font-bold text-gray-900 uppercase tracking-wide">Projects</h3>
                </div>
                <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-50 border-b">
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">#</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Clients</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Project Name</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Start Date</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Due Date</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {projects.map((project) => (
                        <tr key={project.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 text-sm text-gray-900">{project.id}</td>
                          <td className="px-6 py-4 text-sm text-gray-900">{project.client}</td>
                          <td className="px-6 py-4 text-sm text-gray-700">{project.projectName}</td>
                          <td className="px-6 py-4 text-sm text-gray-700">{project.startDate}</td>
                          <td className="px-6 py-4 text-sm text-gray-700">{project.dueDate}</td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex px-3 py-1 text-xs font-medium rounded-full ${project.statusColor}`}>
                              {project.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'experience' && (
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Work Experience</h3>
              <div className="space-y-6">
                {experiences.map((exp, index) => (
                  <div key={index} className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                    <h4 className="text-lg font-semibold text-gray-900">{exp.title}</h4>
                    <p className="text-sm text-gray-500 mb-3">{exp.company} - {exp.period}</p>
                    <p className="text-gray-700 leading-relaxed">{exp.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'timeline' && (
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Timeline</h3>
              <p className="text-gray-600">Timeline content coming soon...</p>
            </div>
          )}

          {activeTab === 'settings' && (
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Settings</h3>
              <p className="text-gray-600">Settings content coming soon...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;