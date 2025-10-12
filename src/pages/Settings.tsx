import React, { useState } from 'react';
import { User, Lock, Bell, Briefcase, Shield, Palette, UserX, Camera, X, Check, Mail, Phone, Building2, FileText, Clock, Calendar,Monitor, Download } from 'lucide-react';

type TabType = 'profile' | 'security' | 'notifications' | 'work' | 'privacy' | 'appearance' | 'account';

interface ToastMessage {
  show: boolean;
  message: string;
}

const SettingsPage = () => {
  const [activeTab, setActiveTab] = useState<TabType>('profile');
  const [toast, setToast] = useState<ToastMessage>({ show: false, message: '' });
  const [profileImage, setProfileImage] = useState<string | null>(null);

  // Profile state
  const [profile, setProfile] = useState({
    fullName: 'John Doe',
    jobTitle: 'Senior Project Manager',
    department: 'Operations',
    email: 'john.doe@company.com',
    phone: '+1 (555) 123-4567',
    bio: 'Experienced project manager with 10+ years in tech industry.',
    skills: ['Project Management', 'Agile', 'Scrum', 'Leadership']
  });

  // Security state
  const [security, setSecurity] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    twoFactorEnabled: false
  });

  // Notifications state
  const [notifications, setNotifications] = useState({
    emailNewAssignments: true,
    emailDeadlines: true,
    emailUpdates: true,
    emailMentions: true,
    emailStatusChanges: false,
    inAppNotifications: true,
    notificationFrequency: 'realtime'
  });

  // Work preferences state
  const [workPrefs, setWorkPrefs] = useState({
    defaultView: 'board',
    timezone: 'America/New_York',
    weekStart: 'monday',
    dateFormat: 'MM/DD/YYYY',
    timeFormat: '12hr'
  });

  // Privacy state
  const [privacy, setPrivacy] = useState({
    profileVisibility: 'team',
    showOnlineStatus: true,
    shareWorkHours: true
  });

  // Appearance state
  const [appearance, setAppearance] = useState({
    theme: 'light',
    viewDensity: 'comfortable'
  });

  const showToast = (message: string) => {
    setToast({ show: true, message });
    setTimeout(() => setToast({ show: false, message: '' }), 3000);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
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
    if (security.newPassword.length < 8) return 'Password must be at least 8 characters';
    if (security.newPassword !== security.confirmPassword) return 'Passwords do not match';
    return null;
  };

  const handleSaveProfile = () => {
    const error = validateProfile();
    if (error) {
      showToast(error);
      return;
    }
    showToast('Profile updated successfully!');
  };

  const handleSaveSecurity = () => {
    const error = validateSecurity();
    if (error) {
      showToast(error);
      return;
    }
    showToast('Password changed successfully!');
    setSecurity({ currentPassword: '', newPassword: '', confirmPassword: '', twoFactorEnabled: security.twoFactorEnabled });
  };

  const handleSaveNotifications = () => {
    showToast('Notification preferences saved!');
  };

  const handleSaveWorkPrefs = () => {
    showToast('Work preferences saved!');
  };

  const handleSaveAppearance = () => {
    showToast('Appearance settings saved!');
  };

  const handleExportData = () => {
    showToast('Data export initiated! You will receive an email shortly.');
  };

  const handleDeactivateAccount = () => {
    if (window.confirm('Are you sure you want to deactivate your account?')) {
      showToast('Account deactivation initiated.');
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

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Settings</h1>

        <div className="flex gap-6">
          {/* Sidebar Navigation */}
          <div className="w-64 bg-white rounded-lg shadow-sm p-4 h-fit">
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

          {/* Main Content */}
          <div className="flex-1 bg-white rounded-lg shadow-sm p-8">
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Profile Settings</h2>
                
                {/* Profile Photo */}
                <div className="mb-8">
                  <label className="block text-sm font-medium text-gray-700 mb-3">Profile Photo</label>
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      {profileImage ? (
                        <img src={profileImage} alt="Profile" className="w-24 h-24 rounded-full object-cover" />
                      ) : (
                        <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center">
                          <User className="w-12 h-12 text-gray-400" />
                        </div>
                      )}
                      {profileImage && (
                        <button
                          onClick={() => setProfileImage(null)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                    <label className="cursor-pointer bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2">
                      <Camera className="w-4 h-4" />
                      Upload Photo
                      <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                    </label>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-6">
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
                      <label className="block text-sm font-medium text-gray-700 mb-2">Job Title</label>
                      <div className="relative">
                        <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="text"
                          value={profile.jobTitle}
                          onChange={(e) => setProfile({ ...profile, jobTitle: e.target.value })}
                          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
                    <div className="relative">
                      <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        value={profile.department}
                        onChange={(e) => setProfile({ ...profile, department: e.target.value })}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
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
                          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="tel"
                          value={profile.phone}
                          onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
                    <div className="relative">
                      <FileText className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                      <textarea
                        value={profile.bio}
                        onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                        rows={4}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Skills</label>
                    <div className="flex flex-wrap gap-2">
                      {profile.skills.map((skill, index) => (
                        <span key={index} className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleSaveProfile}
                  className="mt-8 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
                >
                  <Check className="w-5 h-5" />
                  Save Changes
                </button>
              </div>
            )}

            {/* Security Tab */}
            {activeTab === 'security' && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Password & Security</h2>
                
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
                    <p className="text-sm text-gray-500 mt-1">Must be at least 8 characters</p>
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

                  <div className="border-t pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-medium text-gray-900">Two-Factor Authentication</h3>
                        <p className="text-sm text-gray-500">Add an extra layer of security to your account</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={security.twoFactorEnabled}
                          onChange={(e) => setSecurity({ ...security, twoFactorEnabled: e.target.checked })}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                  </div>

                  <div className="border-t pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-medium text-gray-900">Share Work Hours</h3>
                        <p className="text-sm text-gray-500">Allow team members to see your working hours</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={privacy.shareWorkHours}
                          onChange={(e) => setPrivacy({ ...privacy, shareWorkHours: e.target.checked })}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleSaveSecurity}
                  className="mt-8 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
                >
                  <Check className="w-5 h-5" />
                  Save Changes
                </button>
              </div>
            )}

            {/* Appearance Tab */}
            {activeTab === 'appearance' && (
              <div>
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

                  <div className="border-t pt-6">
                    <label className="block text-sm font-medium text-gray-700 mb-3">View Density</label>
                    <div className="grid grid-cols-2 gap-4">
                      {[
                        { value: 'compact', label: 'Compact', desc: 'More content on screen' },
                        { value: 'comfortable', label: 'Comfortable', desc: 'Balanced spacing' }
                      ].map((density) => (
                        <label
                          key={density.value}
                          className={`cursor-pointer border-2 rounded-lg p-4 transition-all ${
                            appearance.viewDensity === density.value
                              ? 'border-blue-600 bg-blue-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <input
                            type="radio"
                            name="density"
                            value={density.value}
                            checked={appearance.viewDensity === density.value}
                            onChange={(e) => setAppearance({ ...appearance, viewDensity: e.target.value })}
                            className="sr-only"
                          />
                          <div className="text-center">
                            <div className="font-medium text-gray-900">{density.label}</div>
                            <div className="text-sm text-gray-500">{density.desc}</div>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleSaveAppearance}
                  className="mt-8 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
                >
                  <Check className="w-5 h-5" />
                  Save Changes
                </button>
              </div>
            )}

            {/* Account Tab */}
            {activeTab === 'account' && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Account Management</h2>
                
                <div className="space-y-6">
                  <div className="border border-gray-200 rounded-lg p-6">
                    <div className="flex items-start gap-4">
                      <Download className="w-6 h-6 text-blue-600 mt-1" />
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Export Your Data</h3>
                        <p className="text-sm text-gray-600 mb-4">
                          Download a copy of your account data, including your profile, projects, and tasks. You'll receive an email with a download link.
                        </p>
                        <button
                          onClick={handleExportData}
                          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm"
                        >
                          Request Data Export
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
                          Temporarily deactivate your account. You can reactivate it anytime by logging back in. Your data will be preserved.
                        </p>
                        <button
                          onClick={handleDeactivateAccount}
                          className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 text-sm"
                        >
                          Deactivate Account
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="border border-red-300 rounded-lg p-6 bg-red-100">
                    <div className="flex items-start gap-4">
                      <UserX className="w-6 h-6 text-red-700 mt-1" />
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Account Permanently</h3>
                        <p className="text-sm text-gray-600 mb-2">
                          <strong>Warning:</strong> This action cannot be undone. All your data, projects, and tasks will be permanently deleted.
                        </p>
                        <p className="text-sm text-gray-600 mb-4">
                          Please contact support at <a href="mailto:support@company.com" className="text-blue-600 hover:underline">support@company.com</a> to request account deletion.
                        </p>
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
        <div className="fixed bottom-6 right-6 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-3 animate-slide-up">
          <Check className="w-5 h-5" />
          <span>{toast.message}</span>
        </div>
      )}
        {/* Notifications Tab */}
            {activeTab === 'notifications' && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Notification Preferences</h2>
                
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Email Notifications</h3>
                    <div className="space-y-4">
                      {[
                        { key: 'emailNewAssignments', label: 'New project assignments', desc: 'Get notified when you are assigned to a new project' },
                        { key: 'emailDeadlines', label: 'Task deadlines approaching', desc: 'Receive reminders before task deadlines' },
                        { key: 'emailUpdates', label: 'Project updates and comments', desc: 'Stay informed about project changes and comments' },
                        { key: 'emailMentions', label: 'Team mentions', desc: 'Get notified when someone mentions you' },
                        { key: 'emailStatusChanges', label: 'Status changes', desc: 'Receive updates when project or task status changes' }
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
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-sm font-medium text-gray-900">In-App Notifications</h3>
                        <p className="text-sm text-gray-500">Show notifications within the application</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={notifications.inAppNotifications}
                          onChange={(e) => setNotifications({ ...notifications, inAppNotifications: e.target.checked })}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
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
                  className="mt-8 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
                >
                  <Check className="w-5 h-5" />
                  Save Changes
                </button>
              </div>
            )}

            {/* Work Preferences Tab */}
            {activeTab === 'work' && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Work Preferences</h2>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Default Project View</label>
                    <select
                      value={workPrefs.defaultView}
                      onChange={(e) => setWorkPrefs({ ...workPrefs, defaultView: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="list">List View</option>
                      <option value="board">Board View</option>
                      <option value="calendar">Calendar View</option>
                    </select>
                  </div>

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
                      <option value="Europe/Paris">Paris (CET)</option>
                      <option value="Asia/Tokyo">Tokyo (JST)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Calendar className="inline w-4 h-4 mr-2" />
                      Week Start Day
                    </label>
                    <select
                      value={workPrefs.weekStart}
                      onChange={(e) => setWorkPrefs({ ...workPrefs, weekStart: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="monday">Monday</option>
                      <option value="sunday">Sunday</option>
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
                  className="mt-8 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
                >
                  <Check className="w-5 h-5" />
                  Save Changes
                </button>
              </div>
            )}
    </div>
  );
};

export default SettingsPage;  
 