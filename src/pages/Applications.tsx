import React, { useState, useEffect } from "react";
import { Briefcase, CheckCircle, Clock, XCircle, Award } from "lucide-react";

interface JobApplication {
  _id: string;
  title: string;
  company: string;
  status: 'applied' | 'interview' | 'offered' | 'rejected';
  link?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

const ApplicationTracker: React.FC = () => {
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editNotes, setEditNotes] = useState("");

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const response = await fetch('/api/applications');
      if (!response.ok) throw new Error('Failed to fetch applications');
      const data = await response.json();
      setApplications(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, newStatus: JobApplication['status']) => {
    try {
      const response = await fetch(`/api/applications/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      
      if (!response.ok) throw new Error('Failed to update status');
      
      setApplications(prev => 
        prev.map(app => app._id === id ? { ...app, status: newStatus } : app)
      );
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to update');
    }
  };

  const updateNotes = async (id: string) => {
    try {
      const response = await fetch(`/api/applications/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes: editNotes })
      });
      
      if (!response.ok) throw new Error('Failed to update notes');
      
      setApplications(prev => 
        prev.map(app => app._id === id ? { ...app, notes: editNotes } : app)
      );
      setEditingId(null);
      setEditNotes("");
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to update');
    }
  };

  const deleteApplication = async (id: string) => {
    if (!confirm('Are you sure you want to delete this application?')) return;
    
    try {
      const response = await fetch(`/api/applications/${id}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) throw new Error('Failed to delete');
      
      setApplications(prev => prev.filter(app => app._id !== id));
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'applied': return 'bg-blue-100 text-blue-800';
      case 'interview': return 'bg-yellow-100 text-yellow-800';
      case 'offered': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'applied': return <Clock className="w-4 h-4" />;
      case 'interview': return <Briefcase className="w-4 h-4" />;
      case 'offered': return <Award className="w-4 h-4" />;
      case 'rejected': return <XCircle className="w-4 h-4" />;
      default: return <CheckCircle className="w-4 h-4" />;
    }
  };

  const statusCounts = applications.reduce((acc, app) => {
    acc[app.status] = (acc[app.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  if (loading) {
    return <div className="p-6 text-center">Loading applications...</div>;
  }

  if (error) {
    return <div className="p-6 text-center text-red-600">{error}</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Application Tracker</h1>
        <p className="text-gray-600 mb-6">Track and manage your job applications</p>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center gap-2 text-blue-600 mb-1">
              <Clock className="w-5 h-5" />
              <span className="text-sm font-medium">Applied</span>
            </div>
            <p className="text-2xl font-bold">{statusCounts.applied || 0}</p>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center gap-2 text-yellow-600 mb-1">
              <Briefcase className="w-5 h-5" />
              <span className="text-sm font-medium">Interview</span>
            </div>
            <p className="text-2xl font-bold">{statusCounts.interview || 0}</p>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center gap-2 text-green-600 mb-1">
              <Award className="w-5 h-5" />
              <span className="text-sm font-medium">Offered</span>
            </div>
            <p className="text-2xl font-bold">{statusCounts.offered || 0}</p>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center gap-2 text-red-600 mb-1">
              <XCircle className="w-5 h-5" />
              <span className="text-sm font-medium">Rejected</span>
            </div>
            <p className="text-2xl font-bold">{statusCounts.rejected || 0}</p>
          </div>
        </div>

        {/* Applications List */}
        {applications.length === 0 ? (
          <div className="bg-white p-12 rounded-lg shadow-sm text-center">
            <Briefcase className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No applications yet</h3>
            <p className="text-gray-600">Start applying to jobs to track them here!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {applications.map((app) => (
              <div key={app._id} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900 mb-1">{app.title}</h3>
                    <p className="text-gray-600 mb-2">{app.company}</p>
                    {app.link && (
                      <a 
                        href={app.link} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:underline"
                      >
                        View Job Posting →
                      </a>
                    )}
                  </div>
                  
                  <button
                    onClick={() => deleteApplication(app._id)}
                    className="text-red-600 hover:text-red-800 text-sm font-medium"
                  >
                    Delete
                  </button>
                </div>

                {/* Status Selector */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                  <div className="flex flex-wrap gap-2">
                    {(['applied', 'interview', 'offered', 'rejected'] as JobApplication['status'][]).map((status) => (
                      <button
                        key={status}
                        onClick={() => updateStatus(app._id, status)}
                        className={`px-4 py-2 rounded-full text-sm font-medium capitalize flex items-center gap-2 transition-all ${
                          app.status === status 
                            ? getStatusColor(status) + ' ring-2 ring-offset-2 ring-current' 
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {getStatusIcon(status)}
                        {status}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Notes Section */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                  {editingId === app._id ? (
                    <div className="space-y-2">
                      <textarea
                        value={editNotes}
                        onChange={(e) => setEditNotes(e.target.value)}
                        className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        rows={3}
                        placeholder="Add notes about this application..."
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => updateNotes(app._id)}
                          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => {
                            setEditingId(null);
                            setEditNotes("");
                          }}
                          className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 text-sm"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <p className="text-gray-700 mb-2">{app.notes || "No notes yet"}</p>
                      <button
                        onClick={() => {
                          setEditingId(app._id);
                          setEditNotes(app.notes || "");
                        }}
                        className="text-blue-600 hover:underline text-sm"
                      >
                        {app.notes ? 'Edit notes' : 'Add notes'}
                      </button>
                    </div>
                  )}
                </div>

                <div className="mt-4 text-xs text-gray-500">
                  Applied on {new Date(app.createdAt).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ApplicationTracker;