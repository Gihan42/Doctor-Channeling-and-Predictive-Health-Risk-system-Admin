import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeftIcon, SaveIcon, PlusIcon, TrashIcon } from 'lucide-react';
import Button from '../../components/ui/Button';
import { toast } from 'sonner';
import axios from 'axios';

interface ChannelingRoom {
  id?: number;
  roomName: string;
  description: string;
  status: string;
}

interface MedicalCenterFormData {
  id?: number;
  centerName: string;
  registrationNumber: string;
  contact1: string;
  contact2: string;
  email: string;
  address: string;
  distric: string;
  openTime: string;
  closeTime: string;
  channelingFee: number;
  centerTypeId: number;
  status: string;
  channelingRooms: ChannelingRoom[];
  medicalCenterType: string;
}

const MedicalCenterForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditMode = !!id;

  // Form state
  const [formData, setFormData] = useState<MedicalCenterFormData>({
    id:0,
    centerName: '',
    registrationNumber: '',
    contact1: '',
    contact2: '',
    email: '',
    address: '',
    distric: '',
    openTime: new Date().toISOString().split('T')[0] + 'T09:00:00', // Current date at 09:00:00
    closeTime: new Date().toISOString().split('T')[0] + 'T17:00:00', // Current date at 17:00:00
    channelingFee: 0,
    centerTypeId: 1,
    status: 'Active',
    channelingRooms: [],
    medicalCenterType: 'General'
  });

  // Form validation state
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Loading state
  const [isLoading, setIsLoading] = useState(false);

  // Medical center types for dropdown
  const centerTypes = [
    { id: 1, name: 'General Hospital' },
    { id: 2, name: 'Specialized Clinic' },
    { id: 3, name: 'Dental Clinic' },
    { id: 4, name: 'Ayurvedic Center' },
    { id: 5, name: 'Children’s Hospital' },
    { id: 6, name: 'Eye Hospital' },
    { id: 7, name: 'Cancer Treatment Center' },
    { id: 8, name: 'Cardiology Center' },
    { id: 9, name: 'Orthopedic Center' },
    { id: 10, name: 'Psychiatric Hospital' },
    { id: 11, name: 'Physiotherapy Clinic' },
    { id: 12, name: 'Dermatology Clinic' },
    { id: 13, name: 'ENT Clinic' },
    { id: 14, name: 'Radiology Center' },
    { id: 15, name: 'Rehabilitation Center' },
    { id: 16, name: 'Maternity Hospital' },
    { id: 17, name: 'Fertility Clinic' },
    { id: 18, name: 'Neurology Center' },
    { id: 19, name: 'Geriatric Care Center' },
    { id: 20, name: 'Diagnostic Center' },
    {id:21,name: 'Private Hospital' }
  ];


  // Status options
  const statusOptions = ['Active', 'Inactive', 'Under Maintenance'];

  // Fetch medical center data if in edit mode
  useEffect(() => {
    if (isEditMode) {
      const fetchMedicalCenter = async () => {
        setIsLoading(true);
        try {
          const response = await axios.get(`http://localhost:8080/api/v1/medical/center/${id}`);
          const data = response.data;

          const openDate = data.openTime ? new Date(data.openTime) : new Date();
          const closeDate = data.closeTime ? new Date(data.closeTime) : new Date();

          setFormData(prev => ({
            ...prev,
            // ... other fields
            selectedDate: openDate.toISOString().split('T')[0],
            selectedOpenTime: `${String(openDate.getHours()).padStart(2, '0')}:${String(openDate.getMinutes()).padStart(2, '0')}`,
            selectedCloseTime: `${String(closeDate.getHours()).padStart(2, '0')}:${String(closeDate.getMinutes()).padStart(2, '0')}`,
            openTime: data.openTime || `${openDate.toISOString().split('T')[0]}T09:00:00`,
            closeTime: data.closeTime || `${closeDate.toISOString().split('T')[0]}T17:00:00`
          }));
        } catch (error) {
          // ... error handling
        } finally {
          setIsLoading(false);
        }
      };

      fetchMedicalCenter();
    }
  }, [id, isEditMode]);

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.centerName.trim()) {
      newErrors.centerName = 'Center name is required';
    }

    if (!formData.registrationNumber.trim()) {
      newErrors.registrationNumber = 'Registration number is required';
    }

    if (!formData.contact1.trim()) {
      newErrors.contact1 = 'Primary contact is required';
    } else if (!/^[0-9]{10}$/.test(formData.contact1)) {
      newErrors.contact1 = 'Please enter a valid 10-digit phone number';
    }

    if (formData.contact2 && !/^[0-9]{10}$/.test(formData.contact2)) {
      newErrors.contact2 = 'Please enter a valid 10-digit phone number';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.address.trim()) {
      newErrors.address = 'Address is required';
    }

    if (!formData.distric.trim()) {
      newErrors.distric = 'District is required';
    }

    if (!formData.openTime) {
      newErrors.openTime = 'Opening time is required';
    }

    if (!formData.closeTime) {
      newErrors.closeTime = 'Closing time is required';
    }

    if (formData.channelingFee < 0) {
      newErrors.channelingFee = 'Channeling fee cannot be negative';
    }

    if (formData.channelingRooms.length === 0) {
      newErrors.channelingRooms = 'At least one channeling room is required';
    } else {
      formData.channelingRooms.forEach((room, index) => {
        if (!room.roomName.trim()) {
          newErrors[`room_${index}_name`] = 'Room name is required';
        }
        if (!room.description.trim()) {
          newErrors[`room_${index}_description`] = 'Description is required';
        }
        if (!room.status) {
          newErrors[`room_${index}_status`] = 'Status is required';
        }
      });
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
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

  const handleRoomChange = (index: number, field: keyof ChannelingRoom, value: string) => {
    const updatedRooms = [...formData.channelingRooms];
    updatedRooms[index] = {
      ...updatedRooms[index],
      [field]: value
    };
    setFormData(prev => ({
      ...prev,
      channelingRooms: updatedRooms
    }));

    // Clear error when field is edited
    const errorKey = `room_${index}_${field}`;
    if (errors[errorKey]) {
      setErrors(prev => ({
        ...prev,
        [errorKey]: ''
      }));
    }
  };

  const addRoom = () => {
    const newRoom: ChannelingRoom = {
      roomName: '',
      description: '',
      status: 'Available'
    };
    setFormData(prev => ({
      ...prev,
      channelingRooms: [...prev.channelingRooms, newRoom]
    }));
  };

  const removeRoom = (index: number) => {
    const updatedRooms = [...formData.channelingRooms];
    updatedRooms.splice(index, 1);
    setFormData(prev => ({
      ...prev,
      channelingRooms: updatedRooms
    }));

    // Clear any errors related to this room
    const updatedErrors = { ...errors };
    Object.keys(updatedErrors).forEach(key => {
      if (key.startsWith(`room_${index}_`)) {
        delete updatedErrors[key];
      }
    });
    setErrors(updatedErrors);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    setIsLoading(true);

    try {
      const token = localStorage.getItem('jwt');

      if (!token) {
        throw new Error('No authentication token found');
      }

      console.log(formData)
      // Prepare the data for API
      const payload = {
        ...formData,
        // Format times as ISO strings with a fixed date (time portion is what matters)
        openTime: `2000-01-01T${formData.openTime}:00`,
        closeTime: `2000-01-01T${formData.closeTime}:00`,
        channelingRooms: formData.channelingRooms.map(room => ({
          ...room,
          id: room.id || 0
        }))
      };

      const config = {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      };

      console.log(payload)
      if (isEditMode) {
        await axios.put(`http://localhost:8080/api/v1/medical/center/update`, payload, config);
        toast.success(`${formData.centerName} updated successfully`);
      } else {
        await axios.post(`http://localhost:8080/api/v1/medical/center/save`, payload, config);
        toast.success(`${formData.centerName} registered successfully`);
      }
      navigate('/medical-centers');
    } catch (error) {
      console.error('Error saving medical center:', error);
      toast.error('Failed to save medical center. Please try again.');
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
              onClick={() => navigate('/medical-centers')}
          >
            Back to Medical Centers
          </Button>
          <h1 className="text-2xl font-semibold text-gray-800 ml-4">
            {isEditMode ? 'Edit Medical Center' : 'Register Medical Center'}
          </h1>
        </div>

        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b">
            <h2 className="text-lg font-medium text-gray-900">
              Medical Center Information
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Enter the medical center's details below
            </p>
          </div>

          {isLoading && isEditMode ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
              </div>
          ) : (
              <form onSubmit={handleSubmit} className="px-6 py-4 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Center Name */}
                  <div>
                    <label htmlFor="centerName" className="block text-sm font-medium text-gray-700">
                      Center Name*
                    </label>
                    <input
                        type="text"
                        id="centerName"
                        name="centerName"
                        value={formData.centerName}
                        onChange={handleChange}
                        className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm ${
                            errors.centerName
                                ? 'border-red-300 text-red-900 placeholder-red-300 focus:outline-none focus:ring-red-500 focus:border-red-500'
                                : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                        }`}
                        placeholder="Pearl Dental Care"
                    />
                    {errors.centerName && <p className="mt-1 text-sm text-red-600">{errors.centerName}</p>}
                  </div>

                  {/* Registration Number */}
                  <div>
                    <label htmlFor="registrationNumber" className="block text-sm font-medium text-gray-700">
                      Registration Number*
                    </label>
                    <input
                        type="text"
                        id="registrationNumber"
                        name="registrationNumber"
                        value={formData.registrationNumber}
                        onChange={handleChange}
                        className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm ${
                            errors.registrationNumber
                                ? 'border-red-300 text-red-900 placeholder-red-300 focus:outline-none focus:ring-red-500 focus:border-red-500'
                                : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                        }`}
                        placeholder="REG-PDC-2024-012"
                    />
                    {errors.registrationNumber && (
                        <p className="mt-1 text-sm text-red-600">{errors.registrationNumber}</p>
                    )}
                  </div>

                  {/* Contact 1 */}
                  <div>
                    <label htmlFor="contact1" className="block text-sm font-medium text-gray-700">
                      Primary Contact*
                    </label>
                    <input
                        type="text"
                        id="contact1"
                        name="contact1"
                        value={formData.contact1}
                        onChange={handleChange}
                        className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm ${
                            errors.contact1
                                ? 'border-red-300 text-red-900 placeholder-red-300 focus:outline-none focus:ring-red-500 focus:border-red-500'
                                : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                        }`}
                        placeholder="0754567890"
                    />
                    {errors.contact1 && <p className="mt-1 text-sm text-red-600">{errors.contact1}</p>}
                  </div>

                  {/* Contact 2 */}
                  <div>
                    <label htmlFor="contact2" className="block text-sm font-medium text-gray-700">
                      Secondary Contact
                    </label>
                    <input
                        type="text"
                        id="contact2"
                        name="contact2"
                        value={formData.contact2}
                        onChange={handleChange}
                        className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm ${
                            errors.contact2
                                ? 'border-red-300 text-red-900 placeholder-red-300 focus:outline-none focus:ring-red-500 focus:border-red-500'
                                : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                        }`}
                        placeholder="0114455667"
                    />
                    {errors.contact2 && <p className="mt-1 text-sm text-red-600">{errors.contact2}</p>}
                  </div>

                  {/* Email */}
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                      Email*
                    </label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm ${
                            errors.email
                                ? 'border-red-300 text-red-900 placeholder-red-300 focus:outline-none focus:ring-red-500 focus:border-red-500'
                                : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                        }`}
                        placeholder="info@pearldental.lk"
                    />
                    {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
                  </div>

                  {/* Address */}
                  <div className="md:col-span-2">
                    <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                      Address*
                    </label>
                    <textarea
                        id="address"
                        name="address"
                        rows={2}
                        value={formData.address}
                        onChange={handleChange}
                        className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm ${
                            errors.address
                                ? 'border-red-300 text-red-900 placeholder-red-300 focus:outline-none focus:ring-red-500 focus:border-red-500'
                                : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                        }`}
                        placeholder="78, Galle Road, Mount Lavinia"
                    />
                    {errors.address && <p className="mt-1 text-sm text-red-600">{errors.address}</p>}
                  </div>

                  {/* District */}
                  <div>
                    <label htmlFor="distric" className="block text-sm font-medium text-gray-700">
                      District*
                    </label>
                    <input
                        type="text"
                        id="distric"
                        name="distric"
                        value={formData.distric}
                        onChange={handleChange}
                        className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm ${
                            errors.distric
                                ? 'border-red-300 text-red-900 placeholder-red-300 focus:outline-none focus:ring-red-500 focus:border-red-500'
                                : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                        }`}
                        placeholder="Colombo"
                    />
                    {errors.distric && <p className="mt-1 text-sm text-red-600">{errors.distric}</p>}
                  </div>

                  {/* Center Type */}
                  <div>
                    <label htmlFor="centerTypeId" className="block text-sm font-medium text-gray-700">
                      Center Type*
                    </label>
                    <select
                        id="centerTypeId"
                        name="centerTypeId"
                        value={formData.centerTypeId}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    >
                      {centerTypes.map(type => (
                          <option key={type.id} value={type.id}>
                            {type.name}
                          </option>
                      ))}
                    </select>
                  </div>

                  {/* Medical Center Type */}
                  <div>
                    <label htmlFor="medicalCenterType" className="block text-sm font-medium text-gray-700">
                      Medical Center Type
                    </label>
                    <input
                        type="text"
                        id="medicalCenterType"
                        name="medicalCenterType"
                        value={formData.medicalCenterType}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        placeholder="Dental"
                    />
                  </div>

                  {/* Open Time */}
                  <div>
                    <label htmlFor="openTime" className="block text-sm font-medium text-gray-700">
                      Opening Time*
                    </label>
                    <input
                        type="time"
                        id="openTime"
                        name="openTime"
                        value={formData.openTime}
                        onChange={handleChange}
                        className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm ${
                            errors.openTime
                                ? 'border-red-300 text-red-900 placeholder-red-300 focus:outline-none focus:ring-red-500 focus:border-red-500'
                                : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                        }`}
                        step="300" // Optional: allows selecting times in 5-minute increments
                    />
                    {errors.openTime && <p className="mt-1 text-sm text-red-600">{errors.openTime}</p>}
                  </div>

                  {/* Close Time */}
                  <div>
                    <label htmlFor="closeTime" className="block text-sm font-medium text-gray-700">
                      Closing Time*
                    </label>
                    <input
                        type="time"
                        id="closeTime"
                        name="closeTime"
                        value={formData.closeTime}
                        onChange={handleChange}
                        className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm ${
                            errors.closeTime
                                ? 'border-red-300 text-red-900 placeholder-red-300 focus:outline-none focus:ring-red-500 focus:border-red-500'
                                : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                        }`}
                        step="300" // Optional: allows selecting times in 5-minute increments
                    />
                    {errors.closeTime && <p className="mt-1 text-sm text-red-600">{errors.closeTime}</p>}
                  </div>

                  {/* Channeling Fee */}
                  <div>
                    <label htmlFor="channelingFee" className="block text-sm font-medium text-gray-700">
                      Channeling Fee (LKR)
                    </label>
                    <input
                        type="number"
                        id="channelingFee"
                        name="channelingFee"
                        value={formData.channelingFee}
                        onChange={handleChange}
                        min="0"
                        step="100"
                        className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm ${
                            errors.channelingFee
                                ? 'border-red-300 text-red-900 placeholder-red-300 focus:outline-none focus:ring-red-500 focus:border-red-500'
                                : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                        }`}
                    />
                    {errors.channelingFee && <p className="mt-1 text-sm text-red-600">{errors.channelingFee}</p>}
                  </div>

                  {/* Status */}
                  <div>
                    <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                      Status*
                    </label>
                    <select
                        id="status"
                        name="status"
                        value={formData.status}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    >
                      {statusOptions.map(status => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Channeling Rooms Section */}
                <div className="pt-4 border-t">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium text-gray-900">Channeling Rooms</h3>
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        icon={<PlusIcon className="h-4 w-4" />}
                        onClick={addRoom}
                    >
                      Add Room
                    </Button>
                  </div>

                  {errors.channelingRooms && formData.channelingRooms.length === 0 && (
                      <p className="mb-4 text-sm text-red-600">{errors.channelingRooms}</p>
                  )}

                  <div className="space-y-4">
                    {formData.channelingRooms.map((room, index) => (
                        <div key={index} className="border rounded-md p-4 bg-gray-50">
                          <div className="flex justify-between items-center mb-3">
                            <h4 className="text-sm font-medium text-gray-700">Room #{index + 1}</h4>
                            <Button
                                type="button"
                                variant="danger"
                                size="sm"
                                icon={<TrashIcon className="h-4 w-4" />}
                                onClick={() => removeRoom(index)}
                            >
                              Remove
                            </Button>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {/* Room Name */}
                            <div>
                              <label
                                  htmlFor={`room-name-${index}`}
                                  className="block text-sm font-medium text-gray-700"
                              >
                                Room Name*
                              </label>
                              <input
                                  type="text"
                                  id={`room-name-${index}`}
                                  value={room.roomName}
                                  onChange={e => handleRoomChange(index, 'roomName', e.target.value)}
                                  className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm ${
                                      errors[`room_${index}_name`]
                                          ? 'border-red-300 text-red-900 focus:outline-none focus:ring-red-500 focus:border-red-500'
                                          : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                                  }`}
                                  placeholder="Consult Room 1"
                              />
                              {errors[`room_${index}_name`] && (
                                  <p className="mt-1 text-sm text-red-600">{errors[`room_${index}_name`]}</p>
                              )}
                            </div>

                            {/* Room Description */}
                            <div className="md:col-span-2">
                              <label
                                  htmlFor={`room-description-${index}`}
                                  className="block text-sm font-medium text-gray-700"
                              >
                                Description*
                              </label>
                              <input
                                  type="text"
                                  id={`room-description-${index}`}
                                  value={room.description}
                                  onChange={e => handleRoomChange(index, 'description', e.target.value)}
                                  className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm ${
                                      errors[`room_${index}_description`]
                                          ? 'border-red-300 text-red-900 focus:outline-none focus:ring-red-500 focus:border-red-500'
                                          : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                                  }`}
                                  placeholder="Routine check-ups and cleanings"
                              />
                              {errors[`room_${index}_description`] && (
                                  <p className="mt-1 text-sm text-red-600">
                                    {errors[`room_${index}_description`]}
                                  </p>
                              )}
                            </div>

                            {/* Room Status */}
                            <div>
                              <label
                                  htmlFor={`room-status-${index}`}
                                  className="block text-sm font-medium text-gray-700"
                              >
                                Status*
                              </label>
                              <select
                                  id={`room-status-${index}`}
                                  value={room.status}
                                  onChange={e => handleRoomChange(index, 'status', e.target.value)}
                                  className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm ${
                                      errors[`room_${index}_status`]
                                          ? 'border-red-300 text-red-900 focus:outline-none focus:ring-red-500 focus:border-red-500'
                                          : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                                  }`}
                              >
                                <option value="Available">Available</option>
                                <option value="Unavailable">Unavailable</option>
                                <option value="Under Maintenance">Under Maintenance</option>
                              </select>
                              {errors[`room_${index}_status`] && (
                                  <p className="mt-1 text-sm text-red-600">{errors[`room_${index}_status`]}</p>
                              )}
                            </div>
                          </div>
                        </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-4 border-t">
                  <Button variant="outline" onClick={() => navigate('/medical-centers')}>
                    Cancel
                  </Button>
                  <Button
                      type="submit"
                      variant="primary"
                      icon={<SaveIcon className="h-5 w-5" />}
                      isLoading={isLoading}
                  >
                    {isEditMode ? 'Update Medical Center' : 'Register Medical Center'}
                  </Button>
                </div>
              </form>
          )}
        </div>
      </div>
  );
};

export default MedicalCenterForm;