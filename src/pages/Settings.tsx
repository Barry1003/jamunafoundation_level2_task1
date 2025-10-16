import React, { useState, useEffect } from 'react';
import { 
  User, Lock, Bell, Briefcase, Shield, Palette, UserX, Camera, X, Check, 
  Mail, Clock, Monitor, Download, Loader 
} from 'lucide-react';

type TabType = 'profile' | 'security' | 'notifications' | 'work' | 'privacy' | 'appearance' | 'account';

interface ToastMessage {
  show: boolean;
  message: string;
  type: 'success' | 'error';
}

interface UserType {
  _id: string;
  fullName: string;
  email?: string;
  username: string;
  avatar?: string;
  authProvider: "local" | "github";
}

const SettingsPage: React.FC = () => {  // ✅ Remove user prop, fetch internally
  const [activeTab, setActiveTab] = useState<TabType>('profile');
  const [toast, setToast] = useState<ToastMessage>({ show: false, message: '', type: 'success' });
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<UserType | null>(null);  // ✅ Add user state
  const [userLoading, setUserLoading] = useState(true);  // ✅ Add loading state

  // ✅ Fetch user data on component mount
  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem('token');
      
      if (!token) {
        console.log('❌ No token found');
        setUserLoading(false);
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

        if (response.ok) {
          const userData = await response.json();
          console.log('✅ User data fetched:', userData);
          setUser(userData);
        } else {
          console.error('❌ Failed to fetch user');
          localStorage.removeItem('token');
        }
      } catch (error) {
        console.error('❌ Error fetching user:', error);
      } finally {
        setUserLoading(false);
      }
    };

    fetchUser();
  }, []);

  // Profile state - initialized with user data
  const [profile, setProfile] = useState({
    fullName: '',
    email: '',
    username: '',
    avatar: null as string | null
  });

  // Security state
  const [security, setSecurity] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    twoFactorEnabled: false
  });

  // Notifications state - load from localStorage or defaults
  const [notifications, setNotifications] = useState(() => {
    const saved = localStorage.getItem('notificationSettings');
    return saved ? JSON.parse(saved) : {
      emailNewAssignments: true,
      emailDeadlines: true,
      emailUpdates: true,
      emailMentions: true,
      emailStatusChanges: false,
      inAppNotifications: true,
      notificationFrequency: 'realtime'
    };
  });

  // Work preferences state - load from localStorage
  const [workPrefs, setWorkPrefs] = useState(() => {
    const saved = localStorage.getItem('workPreferences');
    return saved ? JSON.parse(saved) : {
      defaultView: 'board',
      timezone: 'America/New_York',
      weekStart: 'monday',
      dateFormat: 'MM/DD/YYYY',
      timeFormat: '12hr'
    };
  });

  // Privacy state - load from localStorage
  const [privacy, setPrivacy] = useState(() => {
    const saved = localStorage.getItem('privacySettings');
    return saved ? JSON.parse(saved) : {
      profileVisibility: 'team',
      showOnlineStatus: true,
      shareWorkHours: true
    };
  });

  // Appearance state - load from localStorage
  const [appearance, setAppearance] = useState(() => {
    const saved = localStorage.getItem('appearanceSettings');
    return saved ? JSON.parse(saved) : {
      theme: 'light',
      viewDensity: 'comfortable'
    };
  });

  // Update profile when user data is loaded
  useEffect(() => {
    if (user) {
      setProfile({
        fullName: user.fullName || '',
        email: user.email || '',
        username: user.username || '',
        avatar: user.avatar || null
      });
    }
  }, [user]);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      showToast('Please upload an image file', 'error');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      showToast('Image size must be less than 5MB', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setProfile({ ...profile, avatar: reader.result as string });
    };
    reader.readAsDataURL(file);
  };

  const validateProfile = () => {
    if (!profile.fullName.trim()) return 'Full name is required';
    if (!profile.email.trim()) return 'Email is required';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(profile.email)) return 'Invalid email format';
    return null;
  };

  const validateSecurity = () => {
    if (!security.currentPassword) return 'Current password is required';
    if (!security.newPassword) return 'New password is required';
    if (security.newPassword.length < 6) return 'Password must be at least 6 characters';
    if (security.newPassword !== security.confirmPassword) return 'Passwords do not match';
    return null;
  };

  const handleSaveProfile = async () => {
    const error = validateProfile();
    if (error) {
      showToast(error, 'error');
      return;
    }

    if (!user) {
      showToast('No user found', 'error');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/users/${user._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          fullName: profile.fullName,
          email: profile.email,
          avatar: profile.avatar
        })
      });

      if (response.ok) {
        const updatedUser = await response.json();
        setUser(updatedUser);
        showToast('Profile updated successfully!');
        // Update localStorage
        localStorage.setItem('activeUser', JSON.stringify(updatedUser));
      } else {
        const errorData = await response.json();
        showToast(errorData.message || 'Failed to update profile', 'error');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      showToast('Error updating profile', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSecurity = async () => {
    const error = validateSecurity();
    if (error) {
      showToast(error, 'error');
      return;
    }

    if (!user || user.authProvider !== 'local') {
      showToast('Password change is only available for local accounts', 'error');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/auth/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          currentPassword: security.currentPassword,
          newPassword: security.newPassword
        })
      });

      if (response.ok) {
        showToast('Password changed successfully!');
        setSecurity({ 
          currentPassword: '', 
          newPassword: '', 
          confirmPassword: '', 
          twoFactorEnabled: security.twoFactorEnabled 
        });
      } else {
        const errorData = await response.json();
        showToast(errorData.message || 'Failed to change password', 'error');
      }
    } catch (error) {
      console.error('Error changing password:', error);
      showToast('Error changing password', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveNotifications = () => {
    localStorage.setItem('notificationSettings', JSON.stringify(notifications));
    showToast('Notification preferences saved!');
  };

  const handleSaveWorkPrefs = () => {
    localStorage.setItem('workPreferences', JSON.stringify(workPrefs));
    showToast('Work preferences saved!');
  };

  const handleSavePrivacy = () => {
    localStorage.setItem('privacySettings', JSON.stringify(privacy));
    showToast('Privacy settings saved!');
  };

  const handleSaveAppearance = () => {
    localStorage.setItem('appearanceSettings', JSON.stringify(appearance));
    
    // Apply theme
    if (appearance.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    
    showToast('Appearance settings saved!');
  };

  const handleExportData = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/users/${user._id}/export`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `employx-data-${Date.now()}.json`;
        a.click();
        window.URL.revokeObjectURL(url);
        showToast('Data exported successfully!');
      } else {
        showToast('Failed to export data', 'error');
      }
    } catch (error) {
      console.error('Error exporting data:', error);
      showToast('Error exporting data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeactivateAccount = async () => {
    if (!window.confirm('Are you sure you want to deactivate your account? You can reactivate it by logging back in.')) {
      return;
    }

    if (!user) return;

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/users/${user._id}/deactivate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        showToast('Account deactivated successfully');
        // Logout and redirect
        setTimeout(() => {
          localStorage.clear();
          window.location.href = '/login';
        }, 2000);
      } else {
        showToast('Failed to deactivate account', 'error');
      }
    } catch (error) {
      console.error('Error deactivating account:', error);
      showToast('Error deactivating account', 'error');
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'profile' as TabType, label: 'Profile', icon: User },
    { id: 'security' as TabType, label: 'Password & Security', icon: Lock },
    { id: 'notifications' as TabType, label: 'Notifications', icon: Bell },
    { id: 'work' as TabType, label: 'Work Preferences', icon: Briefcase },
    { id: 'privacy' as TabType, label: 'Privacy', icon: Shield },
    { id: 'appearance' as TabType, label: 'Appearance', icon: Palette },
    { id: 'account' as TabType, label: 'Account', icon: UserX }
  ];

  // ✅ Show loading while fetching user
  if (userLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading settings...</p>
        </div>
      </div>
    );
  }

  // ✅ Show error if no user
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Please log in to access settings.</p>
          <a href="/login" className="text-blue-600 hover:underline">Go to Login</a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
      
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Settings</h1>

        <div className="flex gap-6">
          {/* Sidebar Navigation */}
          <div className="w-64 bg-white rounded-lg shadow-sm p-4 h-fit sticky top-6">
            <nav className="space-y-1">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      activeTab === tab.id
                        ? 'bg-blue-50 text-blue-600'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="text-sm font-medium">{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Main Content - Keep all your existing tab content here */}
          <div className="flex-1 bg-white rounded-lg shadow-sm p-8">
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div className="animate-fadeIn">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Profile Settings</h2>
                
                {/* Profile Photo */}
                <div className="mb-8">
                  <label className="block text-sm font-medium text-gray-700 mb-3">Profile Photo</label>
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      {profile.avatar ? (
                        <img src={profile.avatar} alt="Profile" className="w-24 h-24 rounded-full object-cover border-2 border-gray-200" />
                      ) : (
                        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                          <span className="text-3xl font-bold text-white">
                            {profile.fullName[0]?.toUpperCase() || 'U'}
                          </span>
                        </div>
                      )}
                      {profile.avatar && (
                        <button
                          onClick={() => setProfile({ ...profile, avatar: null })}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                    <label className="cursor-pointer bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2 transition-colors">
                      <Camera className="w-4 h-4" />
                      Upload Photo
                      <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                    </label>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        value={profile.fullName}
                        onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Username
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        value={profile.username}
                        disabled
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg bg-gray-50 cursor-not-allowed"
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Username cannot be changed</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="email"
                        value={profile.email}
                        onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                        disabled={user.authProvider === 'github'}
                        className={`w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          user.authProvider === 'github' ? 'bg-gray-50 cursor-not-allowed' : ''
                        }`}
                      />
                    </div>
                    {user.authProvider === 'github' && (
                      <p className="text-xs text-gray-500 mt-1">Email from GitHub account cannot be changed</p>
                    )}
                  </div>

                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                    <p className="text-sm text-blue-800">
                      <strong>Account Type:</strong> {user.authProvider === 'github' ? 'GitHub OAuth' : 'Local Account'}
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleSaveProfile}
                  disabled={loading}
                  className="mt-8 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <Loader className="w-5 h-5 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Check className="w-5 h-5" />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            )}
            {/* Security Tab */}
            {activeTab === 'security' && (
              <div className="animate-fadeIn">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Password & Security</h2>
                
                {user.authProvider === 'github' ? (
                  <div className="p-6 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <h3 className="font-semibold text-yellow-900 mb-2">GitHub Account</h3>
                    <p className="text-sm text-yellow-800">
                      You're signed in with GitHub. Password management is handled through your GitHub account settings.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Current Password <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="password"
                        value={security.currentPassword}
                        onChange={(e) => setSecurity({ ...security, currentPassword: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        New Password <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="password"
                        value={security.newPassword}
                        onChange={(e) => setSecurity({ ...security, newPassword: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <p className="text-sm text-gray-500 mt-1">Must be at least 6 characters</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Confirm New Password <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="password"
                        value={security.confirmPassword}
                        onChange={(e) => setSecurity({ ...security, confirmPassword: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <button
                      onClick={handleSaveSecurity}
                      disabled={loading}
                      className="mt-8 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2 transition-colors disabled:opacity-50"
                    >
                      {loading ? (
                        <>
                          <Loader className="w-5 h-5 animate-spin" />
                          Changing...
                        </>
                      ) : (
                        <>
                          <Check className="w-5 h-5" />
                          Change Password
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Notifications Tab */}
            {activeTab === 'notifications' && (
              <div className="animate-fadeIn">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Notification Preferences</h2>
                
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Email Notifications</h3>
                    <div className="space-y-4">
                      {[
                        { key: 'emailNewAssignments', label: 'New job applications', desc: 'Get notified about job opportunities' },
                        { key: 'emailDeadlines', label: 'Application deadlines', desc: 'Receive reminders before deadlines' },
                        { key: 'emailUpdates', label: 'Application updates', desc: 'Stay informed about application status changes' },
                        { key: 'emailMentions', label: 'Messages and mentions', desc: 'Get notified when someone contacts you' },
                      ].map((item) => (
                        <div key={item.key} className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-900">{item.label}</p>
                            <p className="text-sm text-gray-500">{item.desc}</p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={notifications[item.key as keyof typeof notifications] as boolean}
                              onChange={(e) => setNotifications({ ...notifications, [item.key]: e.target.checked })}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="border-t pt-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Notification Frequency</label>
                    <select
                      value={notifications.notificationFrequency}
                      onChange={(e) => setNotifications({ ...notifications, notificationFrequency: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="realtime">Real-time</option>
                      <option value="daily">Daily Digest</option>
                      <option value="weekly">Weekly Summary</option>
                    </select>
                  </div>
                </div>

                <button
                  onClick={handleSaveNotifications}
                  className="mt-8 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2 transition-colors"
                >
                  <Check className="w-5 h-5" />
                  Save Changes
                </button>
              </div>
            )}

            {/* Work Preferences Tab */}
            {activeTab === 'work' && (
              <div className="animate-fadeIn">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Work Preferences</h2>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Clock className="inline w-4 h-4 mr-2" />
                      Timezone
                    </label>
                    <select
                      value={workPrefs.timezone}
                      onChange={(e) => setWorkPrefs({ ...workPrefs, timezone: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="America/New_York">Eastern Time (ET)</option>
                      <option value="America/Chicago">Central Time (CT)</option>
                      <option value="America/Denver">Mountain Time (MT)</option>
                      <option value="America/Los_Angeles">Pacific Time (PT)</option>
                      <option value="Europe/London">London (GMT)</option>
                      <option value="Asia/Tokyo">Tokyo (JST)</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Date Format</label>
                      <select
                        value={workPrefs.dateFormat}
                        onChange={(e) => setWorkPrefs({ ...workPrefs, dateFormat: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                        <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                        <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Time Format</label>
                      <select
                        value={workPrefs.timeFormat}
                        onChange={(e) => setWorkPrefs({ ...workPrefs, timeFormat: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="12hr">12-hour (2:30 PM)</option>
                        <option value="24hr">24-hour (14:30)</option>
                      </select>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleSaveWorkPrefs}
                  className="mt-8 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2 transition-colors"
                >
                  <Check className="w-5 h-5" />
                  Save Changes
                </button>
              </div>
            )}

            {/* Privacy Tab */}
            {activeTab === 'privacy' && (
              <div className="animate-fadeIn">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Privacy Settings</h2>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">Profile Visibility</label>
                    <select
                      value={privacy.profileVisibility}
                      onChange={(e) => setPrivacy({ ...privacy, profileVisibility: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="public">Public - Anyone can see your profile</option>
                      <option value="team">Connections Only - Only your connections</option>
                      <option value="private">Private - Only you can see your profile</option>
                    </select>
                  </div>

                  <div className="border-t pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-medium text-gray-900">Show Online Status</h3>
                        <p className="text-sm text-gray-500">Let others see when you're online</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={privacy.showOnlineStatus}
                          onChange={(e) => setPrivacy({ ...privacy, showOnlineStatus: e.target.checked })}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleSavePrivacy}
                  className="mt-8 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2 transition-colors"
                >
                  <Check className="w-5 h-5" />
                  Save Changes
                </button>
              </div>
            )}

            {/* Appearance Tab */}
            {activeTab === 'appearance' && (
              <div className="animate-fadeIn">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Appearance Settings</h2>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      <Monitor className="inline w-4 h-4 mr-2" />
                      Theme
                    </label>
                    <div className="grid grid-cols-3 gap-4">
                      {[
                        { value: 'light', label: 'Light', desc: 'Clean and bright' },
                        { value: 'dark', label: 'Dark', desc: 'Easy on the eyes' },
                        { value: 'auto', label: 'Auto', desc: 'Matches system' }
                      ].map((theme) => (
                        <label
                          key={theme.value}
                          className={`cursor-pointer border-2 rounded-lg p-4 transition-all ${
                            appearance.theme === theme.value
                              ? 'border-blue-600 bg-blue-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <input
                            type="radio"
                            name="theme"
                            value={theme.value}
                            checked={appearance.theme === theme.value}
                            onChange={(e) => setAppearance({ ...appearance, theme: e.target.value })}
                            className="sr-only"
                          />
                          <div className="text-center">
                            <div className="font-medium text-gray-900">{theme.label}</div>
                            <div className="text-sm text-gray-500">{theme.desc}</div>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleSaveAppearance}
                  className="mt-8 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2 transition-colors"
                >
                  <Check className="w-5 h-5" />
                  Save Changes
                </button>
              </div>
            )}

            {/* Account Tab */}
            {activeTab === 'account' && (
              <div className="animate-fadeIn">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Account Management</h2>
                
                <div className="space-y-6">
                  <div className="border border-gray-200 rounded-lg p-6">
                    <div className="flex items-start gap-4">
                      <Download className="w-6 h-6 text-blue-600 mt-1" />
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Export Your Data</h3>
                        <p className="text-sm text-gray-600 mb-4">
                          Download a copy of your data including profile, resume, and projects.
                        </p>
                        <button
                          onClick={handleExportData}
                          disabled={loading}
                          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm disabled:opacity-50"
                        >
                          {loading ? 'Exporting...' : 'Export Data'}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="border border-red-200 rounded-lg p-6 bg-red-50">
                    <div className="flex items-start gap-4">
                      <UserX className="w-6 h-6 text-red-600 mt-1" />
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Deactivate Account</h3>
                        <p className="text-sm text-gray-600 mb-4">
                          Temporarily deactivate your account. You can reactivate by logging back in.
                        </p>
                        <button
                          onClick={handleDeactivateAccount}
                          disabled={loading}
                          className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 text-sm disabled:opacity-50"
                        >
                          {loading ? 'Deactivating...' : 'Deactivate Account'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Toast Notification */}
      {toast.show && (
        <div className={`fixed bottom-6 right-6 px-6 py-3 rounded-lg shadow-lg flex items-center gap-3 transition-all duration-300 ease-in-out z-50 ${
          toast.type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
        }`}>
          {toast.type === 'success' ? <Check className="w-5 h-5" /> : <X className="w-5 h-5" />}
          <span>{toast.message}</span>
        </div>
      )}
    </div>
  );
};

export default SettingsPage;
