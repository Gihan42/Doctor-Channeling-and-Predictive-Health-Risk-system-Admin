import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeftIcon, SaveIcon, PlusIcon, TrashIcon } from 'lucide-react';
import Button from '../../components/ui/Button';
import { toast } from 'sonner';
interface Room {
  id: string;
  name: string;
  type: string;
  capacity: number;
}
interface MedicalCenterFormData {
  name: string;
  location: string;
  contact: string;
  establishedDate: string;
  rooms: Room[];
}
// Room types for dropdown
const roomTypes = ['Consultation Room', 'Operating Room', 'Emergency Room', 'Laboratory', 'X-Ray Room', 'General Ward', 'ICU'];
const MedicalCenterForm: React.FC = () => {
  const {
    id
  } = useParams<{
    id: string;
  }>();
  const navigate = useNavigate();
  const isEditMode = !!id;
  // Form state
  const [formData, setFormData] = useState<MedicalCenterFormData>({
    name: '',
    location: '',
    contact: '',
    establishedDate: new Date().toISOString().split('T')[0],
    rooms: []
  });
  // Form validation state
  const [errors, setErrors] = useState<{
    [key: string]: string;
  }>({});
  // Loading state
  const [isLoading, setIsLoading] = useState(false);
  // Fetch medical center data if in edit mode
  useEffect(() => {
    if (isEditMode) {
      setIsLoading(true);
      // Simulate API call
      setTimeout(() => {
        setFormData({
          name: 'Central Hospital',
          location: '123 Main Street, Downtown',
          contact: '+1 (555) 123-4567',
          establishedDate: '2005-06-15',
          rooms: [{
            id: '1',
            name: 'Room 101',
            type: 'Consultation Room',
            capacity: 1
          }, {
            id: '2',
            name: 'Room 102',
            type: 'Consultation Room',
            capacity: 1
          }, {
            id: '3',
            name: 'Room 201',
            type: 'Operating Room',
            capacity: 5
          }]
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
      newErrors.name = 'Center name is required';
    }
    if (!formData.location.trim()) {
      newErrors.location = 'Location is required';
    }
    if (!formData.contact.trim()) {
      newErrors.contact = 'Contact information is required';
    } else if (!/^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/.test(formData.contact)) {
      newErrors.contact = 'Please enter a valid phone number';
    }
    if (!formData.establishedDate) {
      newErrors.establishedDate = 'Established date is required';
    }
    if (formData.rooms.length === 0) {
      newErrors.rooms = 'At least one room is required';
    } else {
      formData.rooms.forEach((room, index) => {
        if (!room.name.trim()) {
          newErrors[`room_${index}_name`] = 'Room name is required';
        }
        if (!room.type) {
          newErrors[`room_${index}_type`] = 'Room type is required';
        }
        if (!room.capacity || room.capacity <= 0) {
          newErrors[`room_${index}_capacity`] = 'Valid capacity is required';
        }
      });
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
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
  const handleRoomChange = (index: number, field: keyof Room, value: any) => {
    const updatedRooms = [...formData.rooms];
    updatedRooms[index] = {
      ...updatedRooms[index],
      [field]: value
    };
    setFormData(prev => ({
      ...prev,
      rooms: updatedRooms
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
    const newRoom: Room = {
      id: `temp_${Date.now()}`,
      name: '',
      type: '',
      capacity: 1
    };
    setFormData(prev => ({
      ...prev,
      rooms: [...prev.rooms, newRoom]
    }));
  };
  const removeRoom = (index: number) => {
    const updatedRooms = [...formData.rooms];
    updatedRooms.splice(index, 1);
    setFormData(prev => ({
      ...prev,
      rooms: updatedRooms
    }));
    // Clear any errors related to this room
    const updatedErrors = {
      ...errors
    };
    Object.keys(updatedErrors).forEach(key => {
      if (key.startsWith(`room_${index}_`)) {
        delete updatedErrors[key];
      }
    });
    setErrors(updatedErrors);
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
      toast.success(isEditMode ? `${formData.name} updated successfully` : `${formData.name} registered successfully`);
      navigate('/medical-centers');
    }, 1000);
  };
  return <div className="space-y-6">
      <div className="flex items-center">
        <Button variant="outline" size="sm" icon={<ArrowLeftIcon className="h-4 w-4" />} onClick={() => navigate('/medical-centers')}>
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
        {isLoading && !isEditMode ? <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div> : <form onSubmit={handleSubmit} className="px-6 py-4 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Center Name */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Center Name
                </label>
                <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm
                    ${errors.name ? 'border-red-300 text-red-900 placeholder-red-300 focus:outline-none focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'}
                  `} placeholder="Central Hospital" />
                {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
              </div>
              {/* Contact */}
              <div>
                <label htmlFor="contact" className="block text-sm font-medium text-gray-700">
                  Contact Number
                </label>
                <input type="text" id="contact" name="contact" value={formData.contact} onChange={handleChange} className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm
                    ${errors.contact ? 'border-red-300 text-red-900 placeholder-red-300 focus:outline-none focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'}
                  `} placeholder="+1 (555) 123-4567" />
                {errors.contact && <p className="mt-1 text-sm text-red-600">{errors.contact}</p>}
              </div>
              {/* Location */}
              <div className="md:col-span-2">
                <label htmlFor="location" className="block text-sm font-medium text-gray-700">
                  Location Address
                </label>
                <textarea id="location" name="location" rows={2} value={formData.location} onChange={handleChange} className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm
                    ${errors.location ? 'border-red-300 text-red-900 placeholder-red-300 focus:outline-none focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'}
                  `} placeholder="123 Main Street, City, State, ZIP" />
                {errors.location && <p className="mt-1 text-sm text-red-600">{errors.location}</p>}
              </div>
              {/* Established Date */}
              <div>
                <label htmlFor="establishedDate" className="block text-sm font-medium text-gray-700">
                  Established Date
                </label>
                <input type="date" id="establishedDate" name="establishedDate" value={formData.establishedDate} onChange={handleChange} className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm
                    ${errors.establishedDate ? 'border-red-300 text-red-900 placeholder-red-300 focus:outline-none focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'}
                  `} />
                {errors.establishedDate && <p className="mt-1 text-sm text-red-600">
                    {errors.establishedDate}
                  </p>}
              </div>
            </div>
            {/* Rooms Section */}
            <div className="pt-4 border-t">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">Rooms</h3>
                <Button type="button" variant="outline" size="sm" icon={<PlusIcon className="h-4 w-4" />} onClick={addRoom}>
                  Add Room
                </Button>
              </div>
              {errors.rooms && formData.rooms.length === 0 && <p className="mb-4 text-sm text-red-600">{errors.rooms}</p>}
              <div className="space-y-4">
                {formData.rooms.map((room, index) => <div key={room.id} className="border rounded-md p-4 bg-gray-50">
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="text-sm font-medium text-gray-700">
                        Room #{index + 1}
                      </h4>
                      <Button type="button" variant="danger" size="sm" icon={<TrashIcon className="h-4 w-4" />} onClick={() => removeRoom(index)}>
                        Remove
                      </Button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* Room Name */}
                      <div>
                        <label htmlFor={`room-name-${index}`} className="block text-sm font-medium text-gray-700">
                          Room Name
                        </label>
                        <input type="text" id={`room-name-${index}`} value={room.name} onChange={e => handleRoomChange(index, 'name', e.target.value)} className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm
                            ${errors[`room_${index}_name`] ? 'border-red-300 text-red-900 focus:outline-none focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'}
                          `} placeholder="Room 101" />
                        {errors[`room_${index}_name`] && <p className="mt-1 text-sm text-red-600">
                            {errors[`room_${index}_name`]}
                          </p>}
                      </div>
                      {/* Room Type */}
                      <div>
                        <label htmlFor={`room-type-${index}`} className="block text-sm font-medium text-gray-700">
                          Room Type
                        </label>
                        <select id={`room-type-${index}`} value={room.type} onChange={e => handleRoomChange(index, 'type', e.target.value)} className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm
                            ${errors[`room_${index}_type`] ? 'border-red-300 text-red-900 focus:outline-none focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'}
                          `}>
                          <option value="">Select Type</option>
                          {roomTypes.map(type => <option key={type} value={type}>
                              {type}
                            </option>)}
                        </select>
                        {errors[`room_${index}_type`] && <p className="mt-1 text-sm text-red-600">
                            {errors[`room_${index}_type`]}
                          </p>}
                      </div>
                      {/* Room Capacity */}
                      <div>
                        <label htmlFor={`room-capacity-${index}`} className="block text-sm font-medium text-gray-700">
                          Capacity
                        </label>
                        <input type="number" id={`room-capacity-${index}`} value={room.capacity} min="1" onChange={e => handleRoomChange(index, 'capacity', parseInt(e.target.value) || 0)} className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm
                            ${errors[`room_${index}_capacity`] ? 'border-red-300 text-red-900 focus:outline-none focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'}
                          `} />
                        {errors[`room_${index}_capacity`] && <p className="mt-1 text-sm text-red-600">
                            {errors[`room_${index}_capacity`]}
                          </p>}
                      </div>
                    </div>
                  </div>)}
              </div>
            </div>
            <div className="flex justify-end space-x-3 pt-4 border-t">
              <Button variant="outline" onClick={() => navigate('/medical-centers')}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" icon={<SaveIcon className="h-5 w-5" />} isLoading={isLoading}>
                {isEditMode ? 'Update Medical Center' : 'Register Medical Center'}
              </Button>
            </div>
          </form>}
      </div>
    </div>;
};
export default MedicalCenterForm;