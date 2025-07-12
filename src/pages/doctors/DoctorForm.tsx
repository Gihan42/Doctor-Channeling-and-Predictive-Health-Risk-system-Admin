import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeftIcon, SaveIcon } from 'lucide-react';
import Button from '../../components/ui/Button';
import { toast } from 'sonner';
interface Doctor {
  id: string;
  name: string;
  specialization: string;
  qualification: string;
  contact: string;
  medicalCenter: string;
  registrationNumber: string;
}
// Mock data for medical centers
const medicalCenters = [{
  id: '1',
  name: 'Central Hospital'
}, {
  id: '2',
  name: 'Westside Medical Center'
}, {
  id: '3',
  name: 'Eastside Clinic'
}, {
  id: '4',
  name: 'North Community Health'
}];
// Mock data for qualifications
const qualifications = ['MBBS', 'MD', 'MS', 'MBBS, MD', 'MBBS, MS', 'PhD'];
// Mock data for specializations
const specializations = ['Cardiology', 'Neurology', 'Pediatrics', 'Orthopedics', 'Dermatology', 'General Medicine', 'Psychiatry', 'Ophthalmology', 'ENT', 'Gynecology'];
const DoctorForm: React.FC = () => {
  const {
    id
  } = useParams<{
    id: string;
  }>();
  const navigate = useNavigate();
  const isEditMode = !!id;
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    specialization: '',
    qualification: '',
    contact: '',
    medicalCenter: '',
    registrationNumber: ''
  });
  // Form validation state
  const [errors, setErrors] = useState<{
    [key: string]: string;
  }>({});
  // Loading state
  const [isLoading, setIsLoading] = useState(false);
  // Fetch doctor data if in edit mode
  useEffect(() => {
    if (isEditMode) {
      // In a real app, this would be an API call
      // For demo, we'll simulate loading data
      setIsLoading(true);
      setTimeout(() => {
        setFormData({
          name: 'Dr. Sarah Johnson',
          specialization: 'Cardiology',
          qualification: 'MBBS, MD',
          contact: '+1 (555) 123-4567',
          medicalCenter: 'Central Hospital',
          registrationNumber: 'REG12345'
        });
        setIsLoading(false);
      }, 500);
    }
  }, [id, isEditMode]);
  const validateForm = () => {
    const newErrors: {
      [key: string]: string;
    } = {};
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    if (!formData.specialization) {
      newErrors.specialization = 'Specialization is required';
    }
    if (!formData.qualification) {
      newErrors.qualification = 'Qualification is required';
    }
    if (!formData.contact.trim()) {
      newErrors.contact = 'Contact information is required';
    } else if (!/^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/.test(formData.contact)) {
      newErrors.contact = 'Please enter a valid phone number';
    }
    if (!formData.medicalCenter) {
      newErrors.medicalCenter = 'Medical center is required';
    }
    if (!formData.registrationNumber.trim()) {
      newErrors.registrationNumber = 'Registration number is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
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
      setIsLoading(false);
      toast.success(isEditMode ? `Dr. ${formData.name.split(' ')[1]} updated successfully` : `Dr. ${formData.name.split(' ')[1]} registered successfully`);
      navigate('/doctors');
    }, 1000);
  };
  return <div className="space-y-6">
      <div className="flex items-center">
        <Button variant="outline" size="sm" icon={<ArrowLeftIcon className="h-4 w-4" />} onClick={() => navigate('/doctors')}>
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
        {isLoading && !isEditMode ? <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div> : <form onSubmit={handleSubmit} className="px-6 py-4 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Full Name */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Full Name
                </label>
                <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm
                    ${errors.name ? 'border-red-300 text-red-900 placeholder-red-300 focus:outline-none focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'}
                  `} placeholder="Dr. John Doe" />
                {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
              </div>
              {/* Contact */}
              <div>
                <label htmlFor="contact" className="block text-sm font-medium text-gray-700">
                  Contact (Phone/Email)
                </label>
                <input type="text" id="contact" name="contact" value={formData.contact} onChange={handleChange} className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm
                    ${errors.contact ? 'border-red-300 text-red-900 placeholder-red-300 focus:outline-none focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'}
                  `} placeholder="+1 (555) 123-4567 or doctor@email.com" />
                {errors.contact && <p className="mt-1 text-sm text-red-600">{errors.contact}</p>}
              </div>
              {/* Specialization */}
              <div>
                <label htmlFor="specialization" className="block text-sm font-medium text-gray-700">
                  Specialization
                </label>
                <select id="specialization" name="specialization" value={formData.specialization} onChange={handleChange} className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm
                    ${errors.specialization ? 'border-red-300 text-red-900 placeholder-red-300 focus:outline-none focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'}
                  `}>
                  <option value="">Select Specialization</option>
                  {specializations.map(spec => <option key={spec} value={spec}>
                      {spec}
                    </option>)}
                </select>
                {errors.specialization && <p className="mt-1 text-sm text-red-600">
                    {errors.specialization}
                  </p>}
              </div>
              {/* Qualification */}
              <div>
                <label htmlFor="qualification" className="block text-sm font-medium text-gray-700">
                  Qualification
                </label>
                <select id="qualification" name="qualification" value={formData.qualification} onChange={handleChange} className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm
                    ${errors.qualification ? 'border-red-300 text-red-900 placeholder-red-300 focus:outline-none focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'}
                  `}>
                  <option value="">Select Qualification</option>
                  {qualifications.map(qual => <option key={qual} value={qual}>
                      {qual}
                    </option>)}
                </select>
                {errors.qualification && <p className="mt-1 text-sm text-red-600">
                    {errors.qualification}
                  </p>}
              </div>
              {/* Registration Number */}
              <div>
                <label htmlFor="registrationNumber" className="block text-sm font-medium text-gray-700">
                  Registration Number
                </label>
                <input type="text" id="registrationNumber" name="registrationNumber" value={formData.registrationNumber} onChange={handleChange} className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm
                    ${errors.registrationNumber ? 'border-red-300 text-red-900 placeholder-red-300 focus:outline-none focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'}
                  `} placeholder="REG12345" />
                {errors.registrationNumber && <p className="mt-1 text-sm text-red-600">
                    {errors.registrationNumber}
                  </p>}
              </div>
              {/* Medical Center */}
              <div>
                <label htmlFor="medicalCenter" className="block text-sm font-medium text-gray-700">
                  Medical Center
                </label>
                <select id="medicalCenter" name="medicalCenter" value={formData.medicalCenter} onChange={handleChange} className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm
                    ${errors.medicalCenter ? 'border-red-300 text-red-900 placeholder-red-300 focus:outline-none focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'}
                  `}>
                  <option value="">Select Medical Center</option>
                  {medicalCenters.map(center => <option key={center.id} value={center.name}>
                      {center.name}
                    </option>)}
                </select>
                {errors.medicalCenter && <p className="mt-1 text-sm text-red-600">
                    {errors.medicalCenter}
                  </p>}
              </div>
            </div>
            <div className="flex justify-end space-x-3 pt-4 border-t">
              <Button variant="outline" onClick={() => navigate('/doctors')}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" icon={<SaveIcon className="h-5 w-5" />} isLoading={isLoading}>
                {isEditMode ? 'Update Doctor' : 'Register Doctor'}
              </Button>
            </div>
          </form>}
      </div>
    </div>;
};
export default DoctorForm;