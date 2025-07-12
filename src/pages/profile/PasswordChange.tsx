import React, { useState } from 'react';
import { ArrowLeftIcon, SaveIcon, EyeIcon, EyeOffIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Button from '../../components/ui/Button';
import { toast } from 'sonner';
import { useAuth } from '../../contexts/AuthContext';
const PasswordChange: React.FC = () => {
  const navigate = useNavigate();
  const {
    user
  } = useAuth();
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  // Password visibility state
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  // Form validation state
  const [errors, setErrors] = useState<{
    [key: string]: string;
  }>({});
  // Loading state
  const [isLoading, setIsLoading] = useState(false);
  const validateForm = () => {
    const newErrors: {
      [key: string]: string;
    } = {};
    if (!formData.currentPassword) {
      newErrors.currentPassword = 'Current password is required';
    }
    if (!formData.newPassword) {
      newErrors.newPassword = 'New password is required';
    } else if (formData.newPassword.length < 6) {
      newErrors.newPassword = 'New password must be at least 6 characters';
    } else if (formData.newPassword === formData.currentPassword) {
      newErrors.newPassword = 'New password must be different from current password';
    }
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your new password';
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const {
      name,
      value
    } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when field is edited
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      // For demo, we'll just check if the current password is "password"
      if (formData.currentPassword !== 'password') {
        setErrors({
          currentPassword: 'Current password is incorrect'
        });
        setIsLoading(false);
        return;
      }
      toast.success('Password changed successfully');
      setIsLoading(false);
      navigate('/dashboard');
    }, 1000);
  };
  return <div className="space-y-6">
      <div className="flex items-center">
        <Button variant="outline" size="sm" icon={<ArrowLeftIcon className="h-4 w-4" />} onClick={() => navigate('/dashboard')}>
          Back to Dashboard
        </Button>
        <h1 className="text-2xl font-semibold text-gray-800 ml-4">
          Change Password
        </h1>
      </div>
      <div className="max-w-md mx-auto bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b">
          <h2 className="text-lg font-medium text-gray-900">
            Update Your Password
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Enter your current password and a new password below
          </p>
        </div>
        <form onSubmit={handleSubmit} className="px-6 py-4 space-y-6">
          {/* Current Password */}
          <div>
            <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700">
              Current Password
            </label>
            <div className="relative mt-1">
              <input type={showCurrentPassword ? 'text' : 'password'} id="currentPassword" name="currentPassword" value={formData.currentPassword} onChange={handleChange} className={`block w-full rounded-md shadow-sm sm:text-sm pr-10
                  ${errors.currentPassword ? 'border-red-300 text-red-900 placeholder-red-300 focus:outline-none focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'}
                `} />
              <button type="button" className="absolute inset-y-0 right-0 pr-3 flex items-center" onClick={() => setShowCurrentPassword(!showCurrentPassword)}>
                {showCurrentPassword ? <EyeOffIcon className="h-5 w-5 text-gray-400" /> : <EyeIcon className="h-5 w-5 text-gray-400" />}
              </button>
            </div>
            {errors.currentPassword && <p className="mt-1 text-sm text-red-600">
                {errors.currentPassword}
              </p>}
          </div>
          {/* New Password */}
          <div>
            <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
              New Password
            </label>
            <div className="relative mt-1">
              <input type={showNewPassword ? 'text' : 'password'} id="newPassword" name="newPassword" value={formData.newPassword} onChange={handleChange} className={`block w-full rounded-md shadow-sm sm:text-sm pr-10
                  ${errors.newPassword ? 'border-red-300 text-red-900 placeholder-red-300 focus:outline-none focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'}
                `} />
              <button type="button" className="absolute inset-y-0 right-0 pr-3 flex items-center" onClick={() => setShowNewPassword(!showNewPassword)}>
                {showNewPassword ? <EyeOffIcon className="h-5 w-5 text-gray-400" /> : <EyeIcon className="h-5 w-5 text-gray-400" />}
              </button>
            </div>
            {errors.newPassword && <p className="mt-1 text-sm text-red-600">{errors.newPassword}</p>}
            <p className="mt-2 text-xs text-gray-500">
              Password must be at least 6 characters long
            </p>
          </div>
          {/* Confirm New Password */}
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
              Confirm New Password
            </label>
            <div className="relative mt-1">
              <input type={showConfirmPassword ? 'text' : 'password'} id="confirmPassword" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} className={`block w-full rounded-md shadow-sm sm:text-sm pr-10
                  ${errors.confirmPassword ? 'border-red-300 text-red-900 placeholder-red-300 focus:outline-none focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'}
                `} />
              <button type="button" className="absolute inset-y-0 right-0 pr-3 flex items-center" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                {showConfirmPassword ? <EyeOffIcon className="h-5 w-5 text-gray-400" /> : <EyeIcon className="h-5 w-5 text-gray-400" />}
              </button>
            </div>
            {errors.confirmPassword && <p className="mt-1 text-sm text-red-600">
                {errors.confirmPassword}
              </p>}
          </div>
          <div className="flex justify-end pt-4 border-t">
            <Button type="submit" variant="primary" icon={<SaveIcon className="h-5 w-5" />} isLoading={isLoading}>
              Change Password
            </Button>
          </div>
        </form>
      </div>
    </div>;
};
export default PasswordChange;