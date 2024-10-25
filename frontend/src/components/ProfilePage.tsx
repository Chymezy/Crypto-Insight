import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { FaUser, FaLock, FaShieldAlt, FaWallet, FaChartLine, FaCamera, FaEthereum, FaBitcoin, FaPlus, FaEnvelope, FaCalendar, FaGlobe, FaExclamationCircle } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { updateProfilePicture, changePassword, updateWalletAddress } from '../services/userApi';
import { User } from '../types/user.types';

const ProfilePage: React.FC = () => {
  const { user, updateUser, isLoading } = useAuth();
  const [activeSection, setActiveSection] = useState('personal');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [profilePicture, setProfilePicture] = useState<string | undefined>(user?.profilePicture);
  const [walletAddresses, setWalletAddresses] = useState<{[key: string]: string}>({});

  useEffect(() => {
    if (user?.profilePicture) {
      setProfilePicture(user.profilePicture);
    }
    if (user?.walletAddresses) {
      setWalletAddresses(user.walletAddresses);
    }
  }, [user]);

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

  const handleWalletAddressUpdate = async (type: string, address: string) => {
    try {
      await updateWalletAddress(type, address);
      setWalletAddresses({ ...walletAddresses, [type]: address });
      toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} wallet address updated successfully`);
    } catch (error) {
      toast.error(`Failed to update ${type} wallet address`);
    }
  };

  const renderPersonalData = () => (
    <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-blue-400">Personal Data</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="mb-4 col-span-2 flex items-center justify-center">
          <div className="relative">
            <img 
              src={profilePicture || '/default-avatar.png'} 
              alt="Profile" 
              className="w-32 h-32 rounded-full object-cover border-4 border-blue-500"
            />
            <label htmlFor="profile-picture-input" className="absolute bottom-0 right-0 bg-blue-600 rounded-full p-2 cursor-pointer hover:bg-blue-700 transition-colors">
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
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1 text-gray-300">Full Name</label>
          <input type="text" value={user?.name} className="w-full p-2 bg-gray-700 rounded text-white" readOnly />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1 text-gray-300">Email</label>
          <div className="flex items-center">
            <FaEnvelope className="text-gray-500 mr-2" />
            <input type="email" value={user?.email} className="w-full p-2 bg-gray-700 rounded text-white" readOnly />
          </div>
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1 text-gray-300">Date Joined</label>
          <div className="flex items-center">
            <FaCalendar className="text-gray-500 mr-2" />
            <input 
              type="text" 
              value={user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'} 
              className="w-full p-2 bg-gray-700 rounded text-white" 
              readOnly 
            />
          </div>
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1 text-gray-300">Preferred Currency</label>
          <div className="flex items-center">
            <FaGlobe className="text-gray-500 mr-2" />
            <input 
              type="text" 
              value={user?.preferredCurrency || 'USD'} 
              className="w-full p-2 bg-gray-700 rounded text-white" 
              readOnly 
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderWalletAddresses = () => (
    <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-blue-400">Wallet Addresses</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {['ethereum', 'bitcoin'].map((type) => (
          <div key={type} className="mb-4">
            <label className="block text-sm font-medium mb-1 text-gray-300">
              {type.charAt(0).toUpperCase() + type.slice(1)} Address
            </label>
            <div className="flex items-center">
              {type === 'ethereum' ? <FaEthereum className="text-blue-400 mr-2" /> : <FaBitcoin className="text-orange-400 mr-2" />}
              <input 
                type="text" 
                value={walletAddresses[type] || ''}
                onChange={(e) => setWalletAddresses({ ...walletAddresses, [type]: e.target.value })}
                className="flex-grow p-2 bg-gray-700 rounded-l text-white"
                placeholder={`Enter your ${type} address`}
              />
              <button 
                onClick={() => handleWalletAddressUpdate(type, walletAddresses[type] || '')}
                className="bg-blue-600 text-white px-4 py-2 rounded-r hover:bg-blue-700 transition-colors"
              >
                Update
              </button>
            </div>
          </div>
        ))}
      </div>
      <button className="mt-4 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors flex items-center">
        <FaPlus className="mr-2" /> Add Custom Token
      </button>
    </div>
  );

  const renderAccountLimits = () => (
    <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-blue-400">Account Limits</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { name: 'Daily Withdrawal', value: '$10,000', icon: FaWallet },
          { name: 'Monthly Trading Volume', value: '$500,000', icon: FaChartLine },
          { name: 'Max Single Transaction', value: '$50,000', icon: FaExclamationCircle },
          { name: 'Leverage Limit', value: '10x', icon: FaChartLine },
        ].map((limit) => (
          <div key={limit.name} className="bg-gray-700 p-4 rounded-lg">
            <div className="flex items-center mb-2">
              <limit.icon className="text-blue-400 mr-2" />
              <h3 className="text-lg font-semibold">{limit.name}</h3>
            </div>
            <p className="text-2xl font-bold text-green-400">{limit.value}</p>
          </div>
        ))}
      </div>
      <div className="mt-6 bg-blue-900 p-4 rounded-lg">
        <h3 className="text-xl font-semibold mb-2">Upgrade Your Limits</h3>
        <p className="text-gray-300 mb-4">Increase your trading power by upgrading your account.</p>
        <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors">
          Upgrade Now
        </button>
      </div>
      <p className="mt-4 text-sm text-gray-400">
        Note: These limits are based on your account level. To increase your limits, please contact support or upgrade your account.
      </p>
    </div>
  );

  const renderSection = () => {
    switch (activeSection) {
      case 'personal':
        return renderPersonalData();
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
        return renderWalletAddresses();
      case 'limits':
        return renderAccountLimits();
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
