import React, { useEffect, useState } from 'react';
import { CalendarIcon, ClockIcon, PlusIcon, FilterIcon, EditIcon, TrashIcon, ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import { toast } from 'sonner';
interface Doctor {
  id: string;
  name: string;
  specialization: string;
}
interface MedicalCenter {
  id: string;
  name: string;
}
interface Room {
  id: string;
  name: string;
  type: string;
}
interface Schedule {
  id: string;
  doctorId: string;
  doctorName: string;
  medicalCenterId: string;
  medicalCenterName: string;
  roomId: string;
  roomName: string;
  date: string;
  startTime: string;
  endTime: string;
  status: 'scheduled' | 'completed' | 'cancelled';
}
// Mock data
const mockDoctors: Doctor[] = [{
  id: '1',
  name: 'Dr. Sarah Johnson',
  specialization: 'Cardiology'
}, {
  id: '2',
  name: 'Dr. Michael Chen',
  specialization: 'Neurology'
}, {
  id: '3',
  name: 'Dr. Emily Rodriguez',
  specialization: 'Pediatrics'
}, {
  id: '4',
  name: 'Dr. James Wilson',
  specialization: 'Orthopedics'
}];
const mockMedicalCenters: MedicalCenter[] = [{
  id: '1',
  name: 'Central Hospital'
}, {
  id: '2',
  name: 'Westside Medical Center'
}, {
  id: '3',
  name: 'Eastside Clinic'
}];
const mockRooms: Record<string, Room[]> = {
  '1': [{
    id: '101',
    name: 'Room 101',
    type: 'Consultation Room'
  }, {
    id: '102',
    name: 'Room 102',
    type: 'Consultation Room'
  }, {
    id: '103',
    name: 'Room 103',
    type: 'Operating Room'
  }],
  '2': [{
    id: '201',
    name: 'Room 201',
    type: 'Consultation Room'
  }, {
    id: '202',
    name: 'Room 202',
    type: 'X-Ray Room'
  }],
  '3': [{
    id: '301',
    name: 'Room 301',
    type: 'Consultation Room'
  }]
};
const mockSchedules: Schedule[] = [{
  id: '1',
  doctorId: '1',
  doctorName: 'Dr. Sarah Johnson',
  medicalCenterId: '1',
  medicalCenterName: 'Central Hospital',
  roomId: '101',
  roomName: 'Room 101',
  date: '2023-07-15',
  startTime: '09:00',
  endTime: '12:00',
  status: 'scheduled'
}, {
  id: '2',
  doctorId: '2',
  doctorName: 'Dr. Michael Chen',
  medicalCenterId: '1',
  medicalCenterName: 'Central Hospital',
  roomId: '102',
  roomName: 'Room 102',
  date: '2023-07-15',
  startTime: '13:00',
  endTime: '16:00',
  status: 'scheduled'
}, {
  id: '3',
  doctorId: '3',
  doctorName: 'Dr. Emily Rodriguez',
  medicalCenterId: '2',
  medicalCenterName: 'Westside Medical Center',
  roomId: '201',
  roomName: 'Room 201',
  date: '2023-07-16',
  startTime: '10:00',
  endTime: '13:00',
  status: 'scheduled'
}];
// Helper to format date for display
const formatDate = (dateString: string) => {
  const options: Intl.DateTimeFormatOptions = {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  };
  return new Date(dateString).toLocaleDateString(undefined, options);
};
const ScheduleManagement: React.FC = () => {
  // State for filters
  const [selectedCenter, setSelectedCenter] = useState<string>('');
  const [selectedDoctor, setSelectedDoctor] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>('');
  // State for available rooms based on selected center
  const [availableRooms, setAvailableRooms] = useState<Room[]>([]);
  // State for schedules
  const [schedules, setSchedules] = useState<Schedule[]>(mockSchedules);
  const [filteredSchedules, setFilteredSchedules] = useState<Schedule[]>(mockSchedules);
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [currentSchedule, setCurrentSchedule] = useState<Schedule | null>(null);
  // Form state for new/edit schedule
  const [formData, setFormData] = useState({
    doctorId: '',
    medicalCenterId: '',
    roomId: '',
    date: '',
    startTime: '',
    endTime: ''
  });
  // Form errors
  const [errors, setErrors] = useState<{
    [key: string]: string;
  }>({});
  // Loading state
  const [isLoading, setIsLoading] = useState(false);
  // Calendar view state
  const [currentWeek, setCurrentWeek] = useState<Date>(new Date());
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  // Update available rooms when medical center is selected
  useEffect(() => {
    if (selectedCenter) {
      setAvailableRooms(mockRooms[selectedCenter] || []);
    } else {
      setAvailableRooms([]);
    }
    // Also update form data if we're in modal
    if (formData.medicalCenterId !== selectedCenter) {
      setFormData(prev => ({
        ...prev,
        medicalCenterId: selectedCenter,
        roomId: ''
      }));
    }
  }, [selectedCenter]);
  // Filter schedules based on selected filters
  useEffect(() => {
    let filtered = [...schedules];
    if (selectedCenter) {
      filtered = filtered.filter(schedule => schedule.medicalCenterId === selectedCenter);
    }
    if (selectedDoctor) {
      filtered = filtered.filter(schedule => schedule.doctorId === selectedDoctor);
    }
    if (selectedDate) {
      filtered = filtered.filter(schedule => schedule.date === selectedDate);
    }
    setFilteredSchedules(filtered);
  }, [schedules, selectedCenter, selectedDoctor, selectedDate]);
  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
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
    // Update available rooms if medical center is changed
    if (name === 'medicalCenterId' && value) {
      setAvailableRooms(mockRooms[value] || []);
    }
  };
  // Validate form
  const validateForm = () => {
    const newErrors: {
      [key: string]: string;
    } = {};
    if (!formData.doctorId) {
      newErrors.doctorId = 'Doctor is required';
    }
    if (!formData.medicalCenterId) {
      newErrors.medicalCenterId = 'Medical center is required';
    }
    if (!formData.roomId) {
      newErrors.roomId = 'Room is required';
    }
    if (!formData.date) {
      newErrors.date = 'Date is required';
    }
    if (!formData.startTime) {
      newErrors.startTime = 'Start time is required';
    }
    if (!formData.endTime) {
      newErrors.endTime = 'End time is required';
    } else if (formData.startTime && formData.endTime <= formData.startTime) {
      newErrors.endTime = 'End time must be after start time';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  // Open modal for creating new schedule
  const openCreateModal = () => {
    setCurrentSchedule(null);
    setFormData({
      doctorId: '',
      medicalCenterId: selectedCenter,
      roomId: '',
      date: '',
      startTime: '',
      endTime: ''
    });
    setErrors({});
    setIsModalOpen(true);
  };
  // Open modal for editing schedule
  const openEditModal = (schedule: Schedule) => {
    setCurrentSchedule(schedule);
    setFormData({
      doctorId: schedule.doctorId,
      medicalCenterId: schedule.medicalCenterId,
      roomId: schedule.roomId,
      date: schedule.date,
      startTime: schedule.startTime,
      endTime: schedule.endTime
    });
    setErrors({});
    setIsModalOpen(true);
    // Ensure available rooms are set
    setAvailableRooms(mockRooms[schedule.medicalCenterId] || []);
  };
  // Open delete confirmation modal
  const openDeleteModal = (schedule: Schedule) => {
    setCurrentSchedule(schedule);
    setIsDeleteModalOpen(true);
  };
  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }
    setIsLoading(true);
    // Find doctor and medical center names
    const doctor = mockDoctors.find(d => d.id === formData.doctorId);
    const center = mockMedicalCenters.find(c => c.id === formData.medicalCenterId);
    const room = availableRooms.find(r => r.id === formData.roomId);
    if (!doctor || !center || !room) {
      toast.error('Invalid selection');
      setIsLoading(false);
      return;
    }
    // Create new schedule object
    const scheduleData: Schedule = {
      id: currentSchedule?.id || `new_${Date.now()}`,
      doctorId: formData.doctorId,
      doctorName: doctor.name,
      medicalCenterId: formData.medicalCenterId,
      medicalCenterName: center.name,
      roomId: formData.roomId,
      roomName: room.name,
      date: formData.date,
      startTime: formData.startTime,
      endTime: formData.endTime,
      status: 'scheduled'
    };
    // Simulate API call
    setTimeout(() => {
      if (currentSchedule) {
        // Update existing schedule
        setSchedules(prev => prev.map(s => s.id === currentSchedule.id ? scheduleData : s));
        toast.success('Schedule updated successfully');
      } else {
        // Add new schedule
        setSchedules(prev => [...prev, scheduleData]);
        toast.success('Schedule created successfully');
      }
      setIsLoading(false);
      setIsModalOpen(false);
    }, 1000);
  };
  // Handle schedule deletion
  const handleDelete = () => {
    if (!currentSchedule) return;
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setSchedules(prev => prev.filter(s => s.id !== currentSchedule.id));
      toast.success('Schedule deleted successfully');
      setIsLoading(false);
      setIsDeleteModalOpen(false);
    }, 1000);
  };
  // Generate dates for calendar view
  const getWeekDates = () => {
    const dates = [];
    const startOfWeek = new Date(currentWeek);
    startOfWeek.setDate(currentWeek.getDate() - currentWeek.getDay());
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      dates.push(date);
    }
    return dates;
  };
  // Navigate to previous week
  const previousWeek = () => {
    const prevWeek = new Date(currentWeek);
    prevWeek.setDate(currentWeek.getDate() - 7);
    setCurrentWeek(prevWeek);
  };
  // Navigate to next week
  const nextWeek = () => {
    const nextWeek = new Date(currentWeek);
    nextWeek.setDate(currentWeek.getDate() + 7);
    setCurrentWeek(nextWeek);
  };
  // Format date to YYYY-MM-DD for filtering
  const formatDateForFilter = (date: Date) => {
    return date.toISOString().split('T')[0];
  };
  // Get schedules for a specific date
  const getSchedulesForDate = (date: string) => {
    return filteredSchedules.filter(schedule => schedule.date === date);
  };
  return <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-800">
          Schedule Management
        </h1>
        <div className="flex space-x-2">
          <Button variant={viewMode === 'list' ? 'primary' : 'outline'} onClick={() => setViewMode('list')}>
            List View
          </Button>
          <Button variant={viewMode === 'calendar' ? 'primary' : 'outline'} onClick={() => setViewMode('calendar')}>
            Calendar View
          </Button>
          <Button variant="primary" icon={<PlusIcon className="h-5 w-5" />} onClick={openCreateModal}>
            Create Schedule
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center mb-4">
          <FilterIcon className="h-5 w-5 text-gray-500 mr-2" />
          <h2 className="text-lg font-medium text-gray-900">Filters</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="center-filter" className="block text-sm font-medium text-gray-700">
              Medical Center
            </label>
            <select id="center-filter" value={selectedCenter} onChange={e => setSelectedCenter(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm">
              <option value="">All Centers</option>
              {mockMedicalCenters.map(center => <option key={center.id} value={center.id}>
                  {center.name}
                </option>)}
            </select>
          </div>
          <div>
            <label htmlFor="doctor-filter" className="block text-sm font-medium text-gray-700">
              Doctor
            </label>
            <select id="doctor-filter" value={selectedDoctor} onChange={e => setSelectedDoctor(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm">
              <option value="">All Doctors</option>
              {mockDoctors.map(doctor => <option key={doctor.id} value={doctor.id}>
                  {doctor.name}
                </option>)}
            </select>
          </div>
          <div>
            <label htmlFor="date-filter" className="block text-sm font-medium text-gray-700">
              Date
            </label>
            <input type="date" id="date-filter" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm" />
          </div>
        </div>
      </div>

      {/* List View */}
      {viewMode === 'list' && <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b">
            <h2 className="text-lg font-medium text-gray-900">
              Scheduled Sessions
            </h2>
          </div>
          {filteredSchedules.length > 0 ? <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Doctor
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Medical Center
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Room
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Time
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredSchedules.map(schedule => <tr key={schedule.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {schedule.doctorName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {schedule.medicalCenterName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {schedule.roomName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(schedule.date)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {schedule.startTime} - {schedule.endTime}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${schedule.status === 'scheduled' ? 'bg-blue-100 text-blue-800' : schedule.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {schedule.status.charAt(0).toUpperCase() + schedule.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <Button variant="outline" size="sm" icon={<EditIcon className="h-4 w-4" />} onClick={() => openEditModal(schedule)}>
                            Edit
                          </Button>
                          <Button variant="danger" size="sm" icon={<TrashIcon className="h-4 w-4" />} onClick={() => openDeleteModal(schedule)}>
                            Delete
                          </Button>
                        </div>
                      </td>
                    </tr>)}
                </tbody>
              </table>
            </div> : <div className="px-6 py-12 text-center">
              <CalendarIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                No schedules found
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                No schedules match your current filter criteria.
              </p>
              <div className="mt-6">
                <Button variant="primary" icon={<PlusIcon className="h-5 w-5" />} onClick={openCreateModal}>
                  Create New Schedule
                </Button>
              </div>
            </div>}
        </div>}

      {/* Calendar View */}
      {viewMode === 'calendar' && <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b flex justify-between items-center">
            <h2 className="text-lg font-medium text-gray-900">
              Weekly Schedule
            </h2>
            <div className="flex items-center space-x-4">
              <button onClick={previousWeek} className="p-1 rounded-full hover:bg-gray-100">
                <ChevronLeftIcon className="h-5 w-5 text-gray-600" />
              </button>
              <span className="text-sm font-medium">
                {currentWeek.toLocaleDateString(undefined, {
              month: 'long',
              year: 'numeric'
            })}
              </span>
              <button onClick={nextWeek} className="p-1 rounded-full hover:bg-gray-100">
                <ChevronRightIcon className="h-5 w-5 text-gray-600" />
              </button>
            </div>
          </div>
          <div className="grid grid-cols-7 border-b">
            {getWeekDates().map((date, index) => <div key={index} className={`text-center py-2 border-r last:border-r-0 ${date.toDateString() === new Date().toDateString() ? 'bg-blue-50' : ''}`}>
                <p className="text-xs text-gray-500">
                  {date.toLocaleDateString(undefined, {
              weekday: 'short'
            })}
                </p>
                <p className="font-medium">{date.getDate()}</p>
              </div>)}
          </div>
          <div className="grid grid-cols-7 min-h-[400px]">
            {getWeekDates().map((date, index) => {
          const dateStr = formatDateForFilter(date);
          const daySchedules = getSchedulesForDate(dateStr);
          return <div key={index} className="border-r last:border-r-0 min-h-full p-2 overflow-y-auto">
                  {daySchedules.length > 0 ? daySchedules.map(schedule => <div key={schedule.id} className="mb-2 p-2 rounded bg-blue-50 border border-blue-100 text-xs cursor-pointer hover:bg-blue-100" onClick={() => openEditModal(schedule)}>
                        <p className="font-medium truncate">
                          {schedule.doctorName}
                        </p>
                        <div className="flex items-center text-gray-500 mt-1">
                          <ClockIcon className="h-3 w-3 mr-1" />
                          <span>
                            {schedule.startTime} - {schedule.endTime}
                          </span>
                        </div>
                        <p className="text-gray-500 truncate mt-1">
                          {schedule.roomName}
                        </p>
                      </div>) : <div className="h-full flex items-center justify-center">
                      <p className="text-xs text-gray-400">No schedules</p>
                    </div>}
                </div>;
        })}
          </div>
        </div>}

      {/* Create/Edit Schedule Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={currentSchedule ? 'Edit Schedule' : 'Create New Schedule'} size="lg">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Doctor */}
            <div>
              <label htmlFor="doctorId" className="block text-sm font-medium text-gray-700">
                Doctor
              </label>
              <select id="doctorId" name="doctorId" value={formData.doctorId} onChange={handleInputChange} className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm
                  ${errors.doctorId ? 'border-red-300 text-red-900 focus:outline-none focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'}
                `}>
                <option value="">Select Doctor</option>
                {mockDoctors.map(doctor => <option key={doctor.id} value={doctor.id}>
                    {doctor.name} ({doctor.specialization})
                  </option>)}
              </select>
              {errors.doctorId && <p className="mt-1 text-sm text-red-600">{errors.doctorId}</p>}
            </div>
            {/* Medical Center */}
            <div>
              <label htmlFor="medicalCenterId" className="block text-sm font-medium text-gray-700">
                Medical Center
              </label>
              <select id="medicalCenterId" name="medicalCenterId" value={formData.medicalCenterId} onChange={handleInputChange} className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm
                  ${errors.medicalCenterId ? 'border-red-300 text-red-900 focus:outline-none focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'}
                `}>
                <option value="">Select Medical Center</option>
                {mockMedicalCenters.map(center => <option key={center.id} value={center.id}>
                    {center.name}
                  </option>)}
              </select>
              {errors.medicalCenterId && <p className="mt-1 text-sm text-red-600">
                  {errors.medicalCenterId}
                </p>}
            </div>
            {/* Room */}
            <div>
              <label htmlFor="roomId" className="block text-sm font-medium text-gray-700">
                Room
              </label>
              <select id="roomId" name="roomId" value={formData.roomId} onChange={handleInputChange} disabled={!formData.medicalCenterId} className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm
                  ${errors.roomId ? 'border-red-300 text-red-900 focus:outline-none focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'} ${!formData.medicalCenterId ? 'bg-gray-100' : ''}
                `}>
                <option value="">Select Room</option>
                {availableRooms.map(room => <option key={room.id} value={room.id}>
                    {room.name} ({room.type})
                  </option>)}
              </select>
              {!formData.medicalCenterId && !errors.roomId && <p className="mt-1 text-xs text-gray-500">
                  Select a medical center first
                </p>}
              {errors.roomId && <p className="mt-1 text-sm text-red-600">{errors.roomId}</p>}
            </div>
            {/* Date */}
            <div>
              <label htmlFor="date" className="block text-sm font-medium text-gray-700">
                Date
              </label>
              <input type="date" id="date" name="date" value={formData.date} onChange={handleInputChange} className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm
                  ${errors.date ? 'border-red-300 text-red-900 focus:outline-none focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'}
                `} />
              {errors.date && <p className="mt-1 text-sm text-red-600">{errors.date}</p>}
            </div>
            {/* Start Time */}
            <div>
              <label htmlFor="startTime" className="block text-sm font-medium text-gray-700">
                Start Time
              </label>
              <input type="time" id="startTime" name="startTime" value={formData.startTime} onChange={handleInputChange} className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm
                  ${errors.startTime ? 'border-red-300 text-red-900 focus:outline-none focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'}
                `} />
              {errors.startTime && <p className="mt-1 text-sm text-red-600">{errors.startTime}</p>}
            </div>
            {/* End Time */}
            <div>
              <label htmlFor="endTime" className="block text-sm font-medium text-gray-700">
                End Time
              </label>
              <input type="time" id="endTime" name="endTime" value={formData.endTime} onChange={handleInputChange} className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm
                  ${errors.endTime ? 'border-red-300 text-red-900 focus:outline-none focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'}
                `} />
              {errors.endTime && <p className="mt-1 text-sm text-red-600">{errors.endTime}</p>}
            </div>
          </div>
          <div className="mt-6 flex justify-end space-x-3">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={isLoading}>
              {currentSchedule ? 'Update Schedule' : 'Create Schedule'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} title="Confirm Deletion" size="sm">
        {currentSchedule && <>
            <p className="text-gray-700">
              Are you sure you want to delete this schedule for{' '}
              <span className="font-medium">{currentSchedule.doctorName}</span>{' '}
              on{' '}
              <span className="font-medium">
                {formatDate(currentSchedule.date)}
              </span>
              ?
            </p>
            <p className="text-sm text-gray-500 mt-2">
              This action cannot be undone.
            </p>
            <div className="mt-6 flex justify-end space-x-3">
              <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="danger" isLoading={isLoading} onClick={handleDelete}>
                Delete
              </Button>
            </div>
          </>}
      </Modal>
    </div>;
};
export default ScheduleManagement;