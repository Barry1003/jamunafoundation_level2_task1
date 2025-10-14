import React, { useState, useEffect } from 'react';
import { Loader, Briefcase, Calendar } from 'lucide-react';

interface UserType {
  _id: string;
  username: string;
  fullName?: string;
  email?: string;
}

interface ExperienceTabProps {
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

const ExperienceTab: React.FC<ExperienceTabProps> = ({ user }) => {
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchExperiences = async () => {
      if (!user) {
        console.log('⚠️ No user found, skipping fetch');
        setLoading(false);
        return;
      }

      const token = localStorage.getItem('token');
      if (!token) {
        setError('Not authenticated');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        console.log('📋 Fetching experiences for user:', user._id);

        const response = await fetch(`http://localhost:5000/api/resume/${user._id}`, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          console.log('✅ Resume data received:', data);
          setExperiences(data.experiences || []);
          setError('');
        } else {
          const errorData = await response.json();
          setError(errorData.message || 'Failed to load experiences');
        }
      } catch (err) {
        console.error('❌ Error fetching experiences:', err);
        setError('Error loading experience data');
      } finally {
        setLoading(false);
      }
    };

    fetchExperiences();
  }, [user]);

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const [year, month] = dateString.split('-');
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${monthNames[parseInt(month) - 1]} ${year}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader className="w-8 h-8 animate-spin text-blue-600" />
        <span className="ml-3 text-gray-600">Loading experiences...</span>
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

  if (experiences.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg">
        <Briefcase className="w-16 h-16 mx-auto text-gray-400 mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 mb-2">No Work Experience Yet</h3>
        <p className="text-gray-600 mb-4">You haven't added any work experience.</p>
        <p className="text-sm text-gray-500">Go to Resume Settings to add your work experience.</p>
      </div>
    );
  }

  return (
    <div>
      <h3 className="text-2xl font-bold text-gray-900 mb-6">Work Experience</h3>
      <div className="space-y-6">
        {experiences.map((exp, index) => (
          <div 
            key={exp._id || index} 
            className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <h4 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-blue-600" />
                  {exp.title}
                </h4>
                <p className="text-md text-blue-600 font-medium mt-1">{exp.company}</p>
              </div>
              {exp.current && (
                <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                  Current
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
              <Calendar className="w-4 h-4" />
              <span>
                {formatDate(exp.startDate)} - {exp.current ? 'Present' : formatDate(exp.endDate)}
              </span>
            </div>

            {exp.description && (
              <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                {exp.description}
              </p>
            )}
          </div>
        ))}
      </div>

      <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
        <p className="text-sm text-blue-700">
          💡 <strong>Tip:</strong> Go to Resume Settings to add, edit, or remove work experiences.
        </p>
      </div>
    </div>
  );
};

export default ExperienceTab;
