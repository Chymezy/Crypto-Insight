import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { FaUser, FaLock, FaShieldAlt, FaWallet, FaChartLine, FaCamera } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { updateProfilePicture, changePassword } from '../services/userApi';
import { User } from '../types/user.types';

const ProfilePage: React.FC = () => {
  const { user, updateUser } = useAuth();
  const [activeSection, setActiveSection] = useState('personal');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleProfilePictureChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const formData = new FormData();
      formData.append('profilePicture', file);
      try {
        const response = await updateProfilePicture(formData);
        if (response.success) {
          updateUser({ ...user, profilePicture: response.profilePicture } as User);
          toast.success('Profile picture updated successfully');
        }
      } catch (error) {
        toast.error('Failed to update profile picture');
      }
    }
  };

  const handlePasswordChange = async () => {
    console.log('Change Password button clicked');
    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    if (!currentPassword) {
      toast.error('Current password is required');
      return;
    }
    try {
      const response = await changePassword(currentPassword, newPassword);
      if (response.success) {
        toast.success(response.message);
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (error) {
      toast.error('Failed to change password');
    }
  };

  const renderSection = () => {
    switch (activeSection) {
      case 'personal':
        return (
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold mb-6 text-blue-400">Personal Data</h2>
            <div className="mb-6 relative w-40 h-40 mx-auto">
              <img 
                src={user?.profilePicture || '/default-avatar.png'} 
                alt="Profile" 
                className="w-full h-full rounded-full object-cover border-4 border-blue-500"
              />
              <label htmlFor="profile-picture-input" className="absolute bottom-2 right-2 bg-blue-600 rounded-full p-2 cursor-pointer hover:bg-blue-700 transition-colors">
                <FaCamera className="text-white" />
                <input 
                  id="profile-picture-input"
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  onChange={handleProfilePictureChange}
                />
              </label>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1 text-gray-300">Username</label>
              <input type="text" value={user?.name} className="w-full p-2 bg-gray-700 rounded text-white" readOnly />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1 text-gray-300">Email</label>
              <input type="email" value={user?.email} className="w-full p-2 bg-gray-700 rounded text-white" readOnly />
            </div>
          </div>
        );
      case 'security':
        return (
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold mb-6 text-blue-400">Security Settings</h2>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1 text-gray-300">Current Password</label>
              <input 
                type="password" 
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full p-2 bg-gray-700 rounded text-white"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1 text-gray-300">New Password</label>
              <input 
                type="password" 
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full p-2 bg-gray-700 rounded text-white"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1 text-gray-300">Confirm New Password</label>
              <input 
                type="password" 
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full p-2 bg-gray-700 rounded text-white"
              />
            </div>
            <button 
              onClick={handlePasswordChange}
              className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition-colors w-full sm:w-auto"
            >
              Change Password
            </button>
            <div className="mt-6">
              <label className="flex items-center text-gray-300">
                <input type="checkbox" className="mr-2 form-checkbox text-blue-600" />
                Enable 2-Factor Authentication
              </label>
            </div>
          </div>
        );
      case 'wallet':
        return (
          <div>
            <h2 className="text-xl font-bold mb-4">Wallet Addresses</h2>
            {/* Add wallet address management here */}
          </div>
        );
      case 'limits':
        return (
          <div>
            <h2 className="text-xl font-bold mb-4">Account Limits</h2>
            {/* Add account limits information here */}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col md:flex-row bg-gray-900 text-white min-h-screen p-4">
      <aside className="w-full md:w-64 bg-gray-800 p-4 rounded-lg mb-4 md:mb-0 md:mr-4">
        <nav>
          <ul>
            {[
              { name: 'Personal Data', icon: FaUser, section: 'personal' },
              { name: 'Security', icon: FaLock, section: 'security' },
              { name: 'Wallet Addresses', icon: FaWallet, section: 'wallet' },
              { name: 'Account Limits', icon: FaChartLine, section: 'limits' },
            ].map(({ name, icon: Icon, section }) => (
              <li key={section} className="mb-2">
                <button
                  onClick={() => setActiveSection(section)}
                  className={`w-full text-left p-2 rounded flex items-center transition-colors ${
                    activeSection === section ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  <Icon className="mr-2" /> {name}
                </button>
              </li>
            ))}
          </ul>
        </nav>
        <div className="mt-8">
          <button className="w-full bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors">
            Upgrade Account
          </button>
        </div>
      </aside>
      <main className="flex-1">
        <div className="max-w-3xl mx-auto">
          {renderSection()}
        </div>
      </main>
    </div>
  );
};

export default ProfilePage;
