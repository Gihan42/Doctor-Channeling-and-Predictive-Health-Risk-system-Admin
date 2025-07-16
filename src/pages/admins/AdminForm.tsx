import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeftIcon, SaveIcon, EyeIcon, EyeOffIcon } from 'lucide-react';
import Button from '../../components/ui/Button';
import { toast } from 'sonner';
import axios from 'axios';

interface AdminFormData {
  id?: number;
  uniqId?: string;
  email: string;
  password: string;
  fullName: string;
  roleId: number;
  status: string;
  confirmPassword?: string;
}

const AdminForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditMode = !!id;

  // Form state
  const [formData, setFormData] = useState<AdminFormData>({
    email: '',
    password: '',
    fullName: '',
    roleId: 2, // Default to 'Admin' role
    status: 'Active',
    confirmPassword: ''
  });

  // Password visibility state
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Form validation state
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Loading state
  const [isLoading, setIsLoading] = useState(false);

  // Fetch admin data if in edit mode
  useEffect(() => {
    if (isEditMode) {
      const fetchAdmin = async () => {
        setIsLoading(true);
        try {
          const token = localStorage.getItem('jwt');
          if (!token) {
            throw new Error('No authentication token found');
          }

          const config = {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          };
          const response = await axios.get(`http://localhost:8080/api/v1/admin?id=${id}`,config);
          if (response.data.code === 200) {
            const adminData = response.data.data;
            setFormData({
              id: adminData.id,
              uniqId: adminData.uniqId,
              email: adminData.email,
              fullName: adminData.fullName,
              roleId: adminData.roleId,
              status: adminData.status,
              password: '',
              confirmPassword: ''
            });
          } else {
            toast.error('Failed to fetch admin data');
          }
        } catch (error) {
          toast.error('Error fetching admin data');
          console.error('Error fetching admin:', error);
        } finally {
          setIsLoading(false);
        }
      };

      fetchAdmin();
    }
  }, [id, isEditMode]);

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!isEditMode || formData.password) {
      if (!formData.password) {
        newErrors.password = 'Password is required';
      } else if (formData.password.length < 6) {
        newErrors.password = 'Password must be at least 6 characters';
      }

      if (!formData.confirmPassword) {
        newErrors.confirmPassword = 'Please confirm your password';
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    // Convert roleId to number if it's being changed
    const updatedValue = name === 'roleId' ? parseInt(value, 10) : value;

    setFormData(prev => ({
      ...prev,
      [name]: updatedValue
    }));

    // Clear error when field is edited
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    setIsLoading(true);

    try {
      // Prepare the data to send (remove confirmPassword as it's not needed in the backend)
      const { confirmPassword, ...submitData } = formData;
      const token = localStorage.getItem('jwt');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const config = {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      };

      if (isEditMode) {
        // Update existing admin - modified to match your endpoint
        const response = await axios.put(
            `http://localhost:8080/api/v1/admin/update`,
            {
              id: submitData.id,
              uniqId: submitData.uniqId || "",
              email: submitData.email,
              password: submitData.password || "",
              fullName: submitData.fullName,
              roleId: submitData.roleId,
              Status: submitData.status || ""
            },
            config
        );

        if (response.data.code === 200) {
          toast.success(`${formData.fullName} updated successfully`);
          navigate('/admins');
        } else {
          toast.error(response.data.message || 'Failed to update admin');
        }
      } else {
        // Create new admin
        const response = await axios.post(
            'http://localhost:8080/api/v1/admin/save',
            submitData,
            config
        );

        if (response.data.code === 200) {
          toast.success(`${formData.fullName} added successfully`);
          navigate('/admins');
        } else {
          toast.error(response.data.message || 'Failed to add admin');
        }
      }
    } catch (error) {
      console.error('Error saving admin:', error);
      toast.error('An error occurred while saving the admin');
    } finally {
      setIsLoading(false);
    }
  };  return (
      <div className="space-y-6">
        <div className="flex items-center">
          <Button
              variant="outline"
              size="sm"
              icon={<ArrowLeftIcon className="h-4 w-4" />}
              onClick={() => navigate('/admins')}
          >
            Back to Admins
          </Button>
          <h1 className="text-2xl font-semibold text-gray-800 ml-4">
            {isEditMode ? 'Edit Admin' : 'Add Admin'}
          </h1>
        </div>

        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b">
            <h2 className="text-lg font-medium text-gray-900">
              Administrator Information
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              {isEditMode ? 'Update administrator details below' : 'Enter administrator details below'}
            </p>
          </div>

          {isLoading && isEditMode ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
              </div>
          ) : (
              <form onSubmit={handleSubmit} className="px-6 py-4 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Full Name */}
                  <div>
                    <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">
                      Full Name
                    </label>
                    <input
                        type="text"
                        id="fullName"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleChange}
                        className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm ${
                            errors.fullName ? 'border-red-300 text-red-900 placeholder-red-300 focus:outline-none focus:ring-red-500 focus:border-red-500' :
                                'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                        }`}
                        placeholder="John Doe"
                    />
                    {errors.fullName && <p className="mt-1 text-sm text-red-600">{errors.fullName}</p>}
                  </div>

                  {/* Email */}
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                      Email Address
                    </label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm ${
                            errors.email ? 'border-red-300 text-red-900 placeholder-red-300 focus:outline-none focus:ring-red-500 focus:border-red-500' :
                                'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                        }`}
                        placeholder="john.doe@example.com"
                    />
                    {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
                  </div>

                  {/* Role */}
                  <div>
                    <label htmlFor="roleId" className="block text-sm font-medium text-gray-700">
                      Role
                    </label>
                    <select
                        id="roleId"
                        name="roleId"
                        value={formData.roleId}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    >

                      <option value={2}>Admin</option>

                    </select>
                  </div>

                  {/* Status */}
                  <div>
                    <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                      Status
                    </label>
                    <select
                        id="status"
                        name="status"
                        value={formData.status}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>

                  {/* Password */}
                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                      {isEditMode ? 'New Password (leave blank to keep current)' : 'Password'}
                    </label>
                    <div className="relative mt-1">
                      <input
                          type={showPassword ? 'text' : 'password'}
                          id="password"
                          name="password"
                          value={formData.password}
                          onChange={handleChange}
                          className={`block w-full rounded-md shadow-sm sm:text-sm pr-10 ${
                              errors.password ? 'border-red-300 text-red-900 placeholder-red-300 focus:outline-none focus:ring-red-500 focus:border-red-500' :
                                  'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                          }`}
                          placeholder="••••••"
                      />
                      <button
                          type="button"
                          className="absolute inset-y-0 right-0 pr-3 flex items-center"
                          onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                            <EyeOffIcon className="h-5 w-5 text-gray-400" />
                        ) : (
                            <EyeIcon className="h-5 w-5 text-gray-400" />
                        )}
                      </button>
                    </div>
                    {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                      Confirm Password
                    </label>
                    <div className="relative mt-1">
                      <input
                          type={showConfirmPassword ? 'text' : 'password'}
                          id="confirmPassword"
                          name="confirmPassword"
                          value={formData.confirmPassword}
                          onChange={handleChange}
                          className={`block w-full rounded-md shadow-sm sm:text-sm pr-10 ${
                              errors.confirmPassword ? 'border-red-300 text-red-900 placeholder-red-300 focus:outline-none focus:ring-red-500 focus:border-red-500' :
                                  'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                          }`}
                          placeholder="••••••"
                      />
                      <button
                          type="button"
                          className="absolute inset-y-0 right-0 pr-3 flex items-center"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? (
                            <EyeOffIcon className="h-5 w-5 text-gray-400" />
                        ) : (
                            <EyeIcon className="h-5 w-5 text-gray-400" />
                        )}
                      </button>
                    </div>
                    {errors.confirmPassword && (
                        <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
                    )}
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-4 border-t">
                  <Button variant="outline" onClick={() => navigate('/admins')}>
                    Cancel
                  </Button>
                  <Button
                      type="submit"
                      variant="primary"
                      icon={<SaveIcon className="h-5 w-5" />}
                      isLoading={isLoading}
                  >
                    {isEditMode ? 'Update Admin' : 'Add Admin'}
                  </Button>
                </div>
              </form>
          )}
        </div>
      </div>
  );
};

export default AdminForm;