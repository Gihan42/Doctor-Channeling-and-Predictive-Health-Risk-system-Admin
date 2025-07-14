import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeftIcon, SaveIcon } from 'lucide-react';
import Button from '../../components/ui/Button';
import { toast } from 'sonner';

interface Doctor {
  id: string;
  uniqId: string;
  fullName: string;
  gender: string;
  contact: string;
  address1: string;
  address2: string;
  nic: string;
  email: string;
  password: string;
  medicalRegistrationNo: string;
  yearsOfExperience: number;
  hospitalAffiliation: string;
  qualificationName: string;
  specialization: string;
  status: string;
  doctorFee: number;
  roleId: number;
  patientCount: number;
}

// Mock data for qualifications
const qualifications = ['MBBS', 'MD', 'MS', 'MBBS, MD', 'MBBS, MS', 'PhD'];

// Mock data for specializations
const specializations = [
  'General Surgery', 'Cardiology', 'Neurology', 'Pediatrics',
  'Orthopedics', 'Dermatology', 'General Medicine',
  'Psychiatry', 'Ophthalmology', 'ENT', 'Gynecology'
];

// Mock data for gender
const genders = ['Male', 'Female', 'Other'];

// Mock data for status
const statusOptions = ['Active', 'Inactive', 'On leave'];

const API_BASE_URL = 'http://localhost:8080/api/v1/doctor';

const DoctorForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditMode = !!id;

  // Form state
  const [formData, setFormData] = useState<Doctor>({
    id: '',
    uniqId: '',
    fullName: '',
    gender: '',
    contact: '',
    address1: '',
    address2: '',
    nic: '',
    email: '',
    password: '',
    medicalRegistrationNo: '',
    yearsOfExperience: 0,
    hospitalAffiliation: '',
    qualificationName: '',
    specialization: '',
    status: 'Active',
    doctorFee: 0,
    roleId: 4, // Doctor role ID from your example
    patientCount: 0
  });

  // Form validation state
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Loading state
  const [isLoading, setIsLoading] = useState(false);

  // Fetch doctor data if in edit mode
  useEffect(() => {
    const fetchDoctorData = async () => {
      if (isEditMode && id) {
        setIsLoading(true);
        try {
          const response = await fetch(`${API_BASE_URL}/${id}`);
          if (!response.ok) {
            throw new Error('Failed to fetch doctor data');
          }
          const data = await response.json();
          setFormData({
            ...data,
            // Convert backend data to match our form format if needed
            gender: data.gender.charAt(0).toUpperCase() + data.gender.slice(1).toLowerCase(),
            status: data.status.charAt(0).toUpperCase() + data.status.slice(1).toLowerCase(),
            qualificationName: data.qualificationName.toUpperCase()
          });
        } catch (error) {
          console.error('Error fetching doctor:', error);
          toast.error('Failed to load doctor data');
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchDoctorData();
  }, [id, isEditMode]);

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }
    if (!formData.gender) {
      newErrors.gender = 'Gender is required';
    }
    if (!formData.contact.trim()) {
      newErrors.contact = 'Contact information is required';
    } else if (!/^[0-9]{10}$/.test(formData.contact)) {
      newErrors.contact = 'Please enter a valid 10-digit phone number';
    }
    if (!formData.address1.trim()) {
      newErrors.address1 = 'Address is required';
    }
    if (!formData.nic.trim()) {
      newErrors.nic = 'NIC is required';
    } else if (!/^[0-9]{9}[vVxX]?$/.test(formData.nic)) {
      newErrors.nic = 'Please enter a valid NIC number';
    }
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    if (!isEditMode && !formData.password.trim()) {
      newErrors.password = 'Password is required';
    } else if (!isEditMode && formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }
    if (!formData.medicalRegistrationNo.trim()) {
      newErrors.medicalRegistrationNo = 'Registration number is required';
    }
    if (formData.yearsOfExperience < 0) {
      newErrors.yearsOfExperience = 'Experience cannot be negative';
    }
    if (!formData.hospitalAffiliation) {
      newErrors.hospitalAffiliation = 'Hospital affiliation is required';
    }
    if (!formData.qualificationName) {
      newErrors.qualificationName = 'Qualification is required';
    }
    if (!formData.specialization) {
      newErrors.specialization = 'Specialization is required';
    }
    if (formData.doctorFee < 0) {
      newErrors.doctorFee = 'Fee cannot be negative';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'yearsOfExperience' || name === 'doctorFee' || name === 'roleId' || name === 'patientCount'
          ? Number(value)
          : value
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
    const token = localStorage.getItem('jwt');

    if (!token) {
      throw new Error('Authentication required. Please login.');
    }
    setIsLoading(true);

    try {
      // Prepare the data for API
      const apiData = {
        ...formData,
        gender: formData.gender.toUpperCase(),
        status: formData.status.toUpperCase(),
        qualificationName: formData.qualificationName.toLowerCase(),
        // Don't send password in edit mode unless it's being changed
        ...(isEditMode && { password: undefined })
      };

      const url = isEditMode
          ? `${API_BASE_URL}/update/${formData.id}`
          : `${API_BASE_URL}/save`;

      const method = isEditMode ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(apiData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save doctor data');
      }

      const result = await response.json();
      toast.success(isEditMode ? 'Doctor updated successfully' : 'Doctor registered successfully');
      navigate('/doctors');
    } catch (error: any) {
      console.error('Error saving doctor:', error);
      toast.error(error.message || 'Failed to save doctor. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
      <div className="space-y-6">
        <div className="flex items-center">
          <Button
              variant="outline"
              size="sm"
              icon={<ArrowLeftIcon className="h-4 w-4" />}
              onClick={() => navigate('/doctors')}
          >
            Back to Doctors
          </Button>
          <h1 className="text-2xl font-semibold text-gray-800 ml-4">
            {isEditMode ? 'Edit Doctor' : 'Register Doctor'}
          </h1>
        </div>

        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b">
            <h2 className="text-lg font-medium text-gray-900">
              Doctor Information
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Enter the doctor's details below
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
                      Full Name *
                    </label>
                    <input
                        type="text"
                        id="fullName"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleChange}
                        className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm ${
                            errors.fullName ? 'border-red-300 text-red-900 placeholder-red-300 focus:outline-none focus:ring-red-500 focus:border-red-500'
                                : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                        }`}
                        placeholder="Dr. Ruwan Jayasena"
                    />
                    {errors.fullName && <p className="mt-1 text-sm text-red-600">{errors.fullName}</p>}
                  </div>

                  {/* Gender */}
                  <div>
                    <label htmlFor="gender" className="block text-sm font-medium text-gray-700">
                      Gender *
                    </label>
                    <select
                        id="gender"
                        name="gender"
                        value={formData.gender}
                        onChange={handleChange}
                        className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm ${
                            errors.gender ? 'border-red-300 text-red-900 placeholder-red-300 focus:outline-none focus:ring-red-500 focus:border-red-500'
                                : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                        }`}
                    >
                      <option value="">Select Gender</option>
                      {genders.map(gender => (
                          <option key={gender} value={gender}>{gender}</option>
                      ))}
                    </select>
                    {errors.gender && <p className="mt-1 text-sm text-red-600">{errors.gender}</p>}
                  </div>

                  {/* Contact */}
                  <div>
                    <label htmlFor="contact" className="block text-sm font-medium text-gray-700">
                      Contact Number *
                    </label>
                    <input
                        type="text"
                        id="contact"
                        name="contact"
                        value={formData.contact}
                        onChange={handleChange}
                        className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm ${
                            errors.contact ? 'border-red-300 text-red-900 placeholder-red-300 focus:outline-none focus:ring-red-500 focus:border-red-500'
                                : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                        }`}
                        placeholder="0777654321"
                    />
                    {errors.contact && <p className="mt-1 text-sm text-red-600">{errors.contact}</p>}
                  </div>

                  {/* Email */}
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                      Email *
                    </label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm ${
                            errors.email ? 'border-red-300 text-red-900 placeholder-red-300 focus:outline-none focus:ring-red-500 focus:border-red-500'
                                : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                        }`}
                        placeholder="ruwan.jayasena@example.com"
                    />
                    {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
                  </div>

                  {/* Password (only for new doctors) */}
                  {!isEditMode && (
                      <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                          Password *
                        </label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm ${
                                errors.password ? 'border-red-300 text-red-900 placeholder-red-300 focus:outline-none focus:ring-red-500 focus:border-red-500'
                                    : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                            }`}
                            placeholder="••••••••"
                        />
                        {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
                      </div>
                  )}

                  {/* NIC */}
                  <div>
                    <label htmlFor="nic" className="block text-sm font-medium text-gray-700">
                      NIC *
                    </label>
                    <input
                        type="text"
                        id="nic"
                        name="nic"
                        value={formData.nic}
                        onChange={handleChange}
                        className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm ${
                            errors.nic ? 'border-red-300 text-red-900 placeholder-red-300 focus:outline-none focus:ring-red-500 focus:border-red-500'
                                : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                        }`}
                        placeholder="881234567V"
                    />
                    {errors.nic && <p className="mt-1 text-sm text-red-600">{errors.nic}</p>}
                  </div>

                  {/* Address 1 */}
                  <div>
                    <label htmlFor="address1" className="block text-sm font-medium text-gray-700">
                      Address Line 1 *
                    </label>
                    <input
                        type="text"
                        id="address1"
                        name="address1"
                        value={formData.address1}
                        onChange={handleChange}
                        className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm ${
                            errors.address1 ? 'border-red-300 text-red-900 placeholder-red-300 focus:outline-none focus:ring-red-500 focus:border-red-500'
                                : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                        }`}
                        placeholder="No 78"
                    />
                    {errors.address1 && <p className="mt-1 text-sm text-red-600">{errors.address1}</p>}
                  </div>

                  {/* Address 2 */}
                  <div>
                    <label htmlFor="address2" className="block text-sm font-medium text-gray-700">
                      Address Line 2
                    </label>
                    <input
                        type="text"
                        id="address2"
                        name="address2"
                        value={formData.address2}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        placeholder="Lake Road, Anuradhapura"
                    />
                  </div>

                  {/* Medical Registration Number */}
                  <div>
                    <label htmlFor="medicalRegistrationNo" className="block text-sm font-medium text-gray-700">
                      Medical Registration Number *
                    </label>
                    <input
                        type="text"
                        id="medicalRegistrationNo"
                        name="medicalRegistrationNo"
                        value={formData.medicalRegistrationNo}
                        onChange={handleChange}
                        className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm ${
                            errors.medicalRegistrationNo ? 'border-red-300 text-red-900 placeholder-red-300 focus:outline-none focus:ring-red-500 focus:border-red-500'
                                : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                        }`}
                        placeholder="SLMC23456"
                    />
                    {errors.medicalRegistrationNo && <p className="mt-1 text-sm text-red-600">{errors.medicalRegistrationNo}</p>}
                  </div>

                  {/* Years of Experience */}
                  <div>
                    <label htmlFor="yearsOfExperience" className="block text-sm font-medium text-gray-700">
                      Years of Experience
                    </label>
                    <input
                        type="number"
                        id="yearsOfExperience"
                        name="yearsOfExperience"
                        min="0"
                        value={formData.yearsOfExperience}
                        onChange={handleChange}
                        className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm ${
                            errors.yearsOfExperience ? 'border-red-300 text-red-900 placeholder-red-300 focus:outline-none focus:ring-red-500 focus:border-red-500'
                                : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                        }`}
                    />
                    {errors.yearsOfExperience && <p className="mt-1 text-sm text-red-600">{errors.yearsOfExperience}</p>}
                  </div>

                  {/* Hospital Affiliation */}
                  <div>
                    <label htmlFor="hospitalAffiliation" className="block text-sm font-medium text-gray-700">
                      Hospital Affiliation *
                    </label>
                    <input
                        type="text"
                        id="hospitalAffiliation"
                        name="hospitalAffiliation"
                        value={formData.hospitalAffiliation}
                        onChange={handleChange}
                        className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm ${
                            errors.hospitalAffiliation
                                ? 'border-red-300 text-red-900 placeholder-red-300 focus:outline-none focus:ring-red-500 focus:border-red-500'
                                : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                        }`}
                        placeholder="Enter hospital name"
                    />
                    {errors.hospitalAffiliation && <p className="mt-1 text-sm text-red-600">{errors.hospitalAffiliation}</p>}
                  </div>

                  {/* Qualification */}
                  <div>
                    <label htmlFor="qualificationName" className="block text-sm font-medium text-gray-700">
                      Qualification *
                    </label>
                    <select
                        id="qualificationName"
                        name="qualificationName"
                        value={formData.qualificationName}
                        onChange={handleChange}
                        className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm ${
                            errors.qualificationName ? 'border-red-300 text-red-900 placeholder-red-300 focus:outline-none focus:ring-red-500 focus:border-red-500'
                                : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                        }`}
                    >
                      <option value="">Select Qualification</option>
                      {qualifications.map(qual => (
                          <option key={qual} value={qual}>{qual}</option>
                      ))}
                    </select>
                    {errors.qualificationName && <p className="mt-1 text-sm text-red-600">{errors.qualificationName}</p>}
                  </div>

                  {/* Specialization */}
                  <div>
                    <label htmlFor="specialization" className="block text-sm font-medium text-gray-700">
                      Specialization *
                    </label>
                    <select
                        id="specialization"
                        name="specialization"
                        value={formData.specialization}
                        onChange={handleChange}
                        className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm ${
                            errors.specialization ? 'border-red-300 text-red-900 placeholder-red-300 focus:outline-none focus:ring-red-500 focus:border-red-500'
                                : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                        }`}
                    >
                      <option value="">Select Specialization</option>
                      {specializations.map(spec => (
                          <option key={spec} value={spec}>{spec}</option>
                      ))}
                    </select>
                    {errors.specialization && <p className="mt-1 text-sm text-red-600">{errors.specialization}</p>}
                  </div>

                  {/* Doctor Fee */}
                  <div>
                    <label htmlFor="doctorFee" className="block text-sm font-medium text-gray-700">
                      Consultation Fee (LKR)
                    </label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-500 sm:text-sm">Rs.</span>
                      </div>
                      <input
                          type="number"
                          id="doctorFee"
                          name="doctorFee"
                          min="0"
                          step="0.01"
                          value={formData.doctorFee}
                          onChange={handleChange}
                          className={`block w-full pl-7 pr-12 rounded-md shadow-sm sm:text-sm ${
                              errors.doctorFee ? 'border-red-300 text-red-900 placeholder-red-300 focus:outline-none focus:ring-red-500 focus:border-red-500'
                                  : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                          }`}
                          placeholder="3500.00"
                      />
                    </div>
                    {errors.doctorFee && <p className="mt-1 text-sm text-red-600">{errors.doctorFee}</p>}
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
                      {statusOptions.map(status => (
                          <option key={status} value={status}>{status}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-4 border-t">
                  <Button variant="outline" onClick={() => navigate('/doctors')}>
                    Cancel
                  </Button>
                  <Button
                      type="submit"
                      variant="primary"
                      icon={<SaveIcon className="h-5 w-5" />}
                      isLoading={isLoading}
                  >
                    {isEditMode ? 'Update Doctor' : 'Register Doctor'}
                  </Button>
                </div>
              </form>
          )}
        </div>
      </div>
  );
};

export default DoctorForm;