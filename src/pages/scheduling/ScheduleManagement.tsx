import React, { useEffect, useState } from 'react';
import { CalendarIcon, ClockIcon, PlusIcon, FilterIcon, EditIcon, TrashIcon, ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import { toast } from 'sonner';

interface Doctor {
  id: number;
  fullName: string;
  specialization: string;
  uniqId: string;
  status: string;
}

interface MedicalCenter {
  id: number;
  centerName: string;
  address: string;
  status: string;
}

interface Room {
  roomId: number;
  roomName: string;
  description: string;
  status: string;
}

interface Schedule {
  scheduleId: number;
  doctorName: string;
  medicalCenterName: string;
  roomName: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  scheduleStatus: 'ACTIVE' | 'INACTIVE' | 'CANCELLED';
}

const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const ScheduleManagement: React.FC = () => {
  // State for filters
  const [selectedCenter, setSelectedCenter] = useState<string>('');
  const [selectedDoctor, setSelectedDoctor] = useState<string>('');
  const [selectedDay, setSelectedDay] = useState<string>('');

  // State for data
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [medicalCenters, setMedicalCenters] = useState<MedicalCenter[]>([]);
  const [availableRooms, setAvailableRooms] = useState<Room[]>([]);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [filteredSchedules, setFilteredSchedules] = useState<Schedule[]>([]);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [currentSchedule, setCurrentSchedule] = useState<Schedule | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    id: 0,
    doctorId: '',
    medicalCenterId: '',
    channelingRoomId: '',
    dayOfWeek: '',
    startTime: '',
    endTime: '',
    status: 'ACTIVE' as 'ACTIVE' | 'INACTIVE' | 'CANCELLED'
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [currentWeek, setCurrentWeek] = useState<Date>(new Date());
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');

  // Helper function to get auth headers
  const getAuthHeaders = () => {
    const token = localStorage.getItem('jwt');
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  };

  // Fetch doctors from API
  const fetchDoctors = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/v1/doctor/getDoctors', {
        headers: getAuthHeaders()
      });
      const data = await response.json();
      if (data.code === 200) {
        setDoctors(data.data);
      } else {
        toast.error('Failed to fetch doctors');
      }
    } catch (error) {
      toast.error('Error fetching doctors');
      console.error('Error fetching doctors:', error);
    }
  };

  // Fetch medical centers from API
  const fetchMedicalCenters = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/v1/medical/center/getAll', {
        headers: getAuthHeaders()
      });
      const data = await response.json();
      if (data.code === 200) {
        setMedicalCenters(data.data);
      } else {
        toast.error('Failed to fetch medical centers');
      }
    } catch (error) {
      toast.error('Error fetching medical centers');
      console.error('Error fetching medical centers:', error);
    }
  };

  // Fetch rooms for a medical center
  const fetchRoomsForMedicalCenter = async (centerId: string) => {
    try {
      const response = await fetch(`http://localhost:8080/api/v1/medical/center/channelingRooms?id=${centerId}`, {
        headers: getAuthHeaders()
      });
      const data = await response.json();
      if (data.code === 200) {
        setAvailableRooms(data.data);
      } else {
        toast.error('Failed to fetch rooms for medical center');
        setAvailableRooms([]);
      }
    } catch (error) {
      toast.error('Error fetching rooms for medical center');
      console.error('Error fetching rooms:', error);
      setAvailableRooms([]);
    }
  };

  // Fetch schedules from API
  const fetchSchedules = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/v1/channeling/room/schedule/all-active-schedules', {
        headers: getAuthHeaders()
      });
      const data = await response.json();
      if (data.code === 200) {
        setSchedules(data.data);
        setFilteredSchedules(data.data);
      } else {
        toast.error('Failed to fetch schedules');
      }
    } catch (error) {
      toast.error('Error fetching schedules');
      console.error('Error fetching schedules:', error);
    }
  };

  // Load initial data
  useEffect(() => {
    fetchDoctors();
    fetchMedicalCenters();
    fetchSchedules();
  }, []);

  // Update available rooms when medical center is selected in filters
  useEffect(() => {
    if (selectedCenter) {
      fetchRoomsForMedicalCenter(selectedCenter);
    } else {
      setAvailableRooms([]);
    }
  }, [selectedCenter]);

  // Update available rooms when medical center is selected in form
  useEffect(() => {
    if (formData.medicalCenterId && formData.medicalCenterId !== selectedCenter) {
      fetchRoomsForMedicalCenter(formData.medicalCenterId);
    }
  }, [formData.medicalCenterId]);

  // Filter schedules based on selected filters
  useEffect(() => {
    let filtered = [...schedules];
    if (selectedCenter) {
      filtered = filtered.filter(schedule =>
          medicalCenters.some(mc =>
              mc.centerName === schedule.medicalCenterName && mc.id.toString() === selectedCenter
          )
      );
    }
    if (selectedDoctor) {
      filtered = filtered.filter(schedule =>
          doctors.some(d =>
              d.fullName === schedule.doctorName && d.id.toString() === selectedDoctor
          )
      );
    }
    if (selectedDay) {
      filtered = filtered.filter(schedule => schedule.dayOfWeek === selectedDay);
    }
    setFilteredSchedules(filtered);
  }, [schedules, selectedCenter, selectedDoctor, selectedDay, medicalCenters, doctors]);

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }

    // Clear room selection when medical center changes
    if (name === 'medicalCenterId') {
      setFormData(prev => ({
        ...prev,
        channelingRoomId: ''
      }));
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.doctorId) newErrors.doctorId = 'Doctor is required';
    if (!formData.medicalCenterId) newErrors.medicalCenterId = 'Medical center is required';
    if (!formData.channelingRoomId) newErrors.channelingRoomId = 'Room is required';
    if (!formData.dayOfWeek) newErrors.dayOfWeek = 'Day of week is required';
    if (!formData.startTime) newErrors.startTime = 'Start time is required';
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
      id: 0,
      doctorId: '',
      medicalCenterId: selectedCenter,
      channelingRoomId: '',
      dayOfWeek: '',
      startTime: '',
      endTime: '',
      status: 'ACTIVE'
    });
    setErrors({});
    setIsModalOpen(true);
  };

  // Open modal for editing schedule
  const openEditModal = (schedule: Schedule) => {
    setCurrentSchedule(schedule);
    // Find doctor and medical center IDs by name
    const doctor = doctors.find(d => d.fullName === schedule.doctorName);
    const center = medicalCenters.find(mc => mc.centerName === schedule.medicalCenterName);
    const room = availableRooms.find(r => r.roomName === schedule.roomName);

    setFormData({
      id: schedule.scheduleId,
      doctorId: doctor?.id.toString() || '',
      medicalCenterId: center?.id.toString() || '',
      channelingRoomId: room?.roomId.toString() || '',
      dayOfWeek: schedule.dayOfWeek,
      startTime: schedule.startTime,
      endTime: schedule.endTime,
      status: schedule.scheduleStatus
    });
    setErrors({});
    setIsModalOpen(true);
    if (center) {
      fetchRoomsForMedicalCenter(center.id.toString());
    }
  };

  // Open delete confirmation modal
  const openDeleteModal = (schedule: Schedule) => {
    setCurrentSchedule(schedule);
    setIsDeleteModalOpen(true);
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    setIsLoading(true);

    try {
      const scheduleData = {
        id: formData.id || undefined,
        doctorId: parseInt(formData.doctorId),
        medicalCenterId: parseInt(formData.medicalCenterId),
        channelingRoomId: parseInt(formData.channelingRoomId),
        dayOfWeek: formData.dayOfWeek,
        startTime: formData.startTime,
        endTime: formData.endTime,
        status: formData.status
      };

      const url = formData.id
          ? 'http://localhost:8080/api/v1/channeling/room/schedule/update'
          : 'http://localhost:8080/api/v1/channeling/room/schedule/save';

      const method = formData.id ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: getAuthHeaders(),
        body: JSON.stringify(scheduleData)
      });

      const data = await response.json();

      if (data.code === 200) {
        toast.success(formData.id ? 'Schedule updated successfully' : 'Schedule created successfully');
        fetchSchedules();
        setIsModalOpen(false);
      } else {
        toast.error(data.message || 'Operation failed');
      }
    } catch (error) {
      toast.error('An error occurred while saving the schedule');
      console.error('Error saving schedule:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle schedule deletion
  const handleDelete = async () => {
    if (!currentSchedule) return;
    setIsLoading(true);

    try {
      const response = await fetch(`http://localhost:8080/api/v1/channeling/room/schedule/delete?id=${currentSchedule.scheduleId}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });

      const data = await response.json();

      if (data.code === 200) {
        toast.success('Schedule deleted successfully');
        fetchSchedules();
        setIsDeleteModalOpen(false);
      } else {
        toast.error(data.message || 'Failed to delete schedule');
      }
    } catch (error) {
      toast.error('An error occurred while deleting the schedule');
      console.error('Error deleting schedule:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Calendar view helpers
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

  const previousWeek = () => {
    const prevWeek = new Date(currentWeek);
    prevWeek.setDate(currentWeek.getDate() - 7);
    setCurrentWeek(prevWeek);
  };

  const nextWeek = () => {
    const nextWeek = new Date(currentWeek);
    nextWeek.setDate(currentWeek.getDate() + 7);
    setCurrentWeek(nextWeek);
  };

  const getSchedulesForDay = (day: string) => {
    return filteredSchedules.filter(schedule => schedule.dayOfWeek === day);
  };

  // The JSX rendering part remains exactly the same as in your original code
  // [Rest of your JSX code...]
  return (
      <div className="space-y-6">
        {/* Header and View Toggle */}
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-semibold text-gray-800">Schedule Management</h1>
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
              <select
                  id="center-filter"
                  value={selectedCenter}
                  onChange={e => setSelectedCenter(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              >
                <option value="">All Centers</option>
                {medicalCenters.map(center => (
                    <option key={center.id} value={center.id.toString()}>
                      {center.centerName}
                    </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="doctor-filter" className="block text-sm font-medium text-gray-700">
                Doctor
              </label>
              <select
                  id="doctor-filter"
                  value={selectedDoctor}
                  onChange={e => setSelectedDoctor(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              >
                <option value="">All Doctors</option>
                {doctors.map(doctor => (
                    <option key={doctor.id} value={doctor.id.toString()}>
                      {doctor.fullName} ({doctor.specialization})
                    </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="day-filter" className="block text-sm font-medium text-gray-700">
                Day of Week
              </label>
              <select
                  id="day-filter"
                  value={selectedDay}
                  onChange={e => setSelectedDay(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              >
                <option value="">All Days</option>
                {daysOfWeek.map(day => (
                    <option key={day} value={day}>
                      {day}
                    </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* List View */}
        {viewMode === 'list' && (
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <div className="px-6 py-4 border-b">
                <h2 className="text-lg font-medium text-gray-900">Scheduled Sessions</h2>
              </div>
              {filteredSchedules.length > 0 ? (
                  <div className="overflow-x-auto">
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
                          Day
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
                      {filteredSchedules.map(schedule => (
                          <tr key={schedule.scheduleId} className="hover:bg-gray-50">
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
                              {schedule.dayOfWeek}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {schedule.startTime} - {schedule.endTime}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        schedule.scheduleStatus === 'Active' ? 'bg-blue-100 text-blue-800' :
                            schedule.scheduleStatus === 'Inactive' ? 'bg-gray-100 text-gray-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {schedule.scheduleStatus}
                    </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <div className="flex justify-end space-x-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    icon={<EditIcon className="h-4 w-4" />}
                                    onClick={() => openEditModal(schedule)}
                                >
                                  Edit
                                </Button>
                                <Button
                                    variant="danger"
                                    size="sm"
                                    icon={<TrashIcon className="h-4 w-4" />}
                                    onClick={() => openDeleteModal(schedule)}
                                >
                                  Delete
                                </Button>
                              </div>
                            </td>
                          </tr>
                      ))}
                      </tbody>
                    </table>
                  </div>
              ) : (
                  <div className="px-6 py-12 text-center">
                    <CalendarIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No schedules found</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      No schedules match your current filter criteria.
                    </p>
                    <div className="mt-6">
                      <Button variant="primary" icon={<PlusIcon className="h-5 w-5" />} onClick={openCreateModal}>
                        Create New Schedule
                      </Button>
                    </div>
                  </div>
              )}
            </div>
        )}

        {/* Calendar View */}
        {viewMode === 'calendar' && (
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <div className="px-6 py-4 border-b flex justify-between items-center">
                <h2 className="text-lg font-medium text-gray-900">Weekly Schedule</h2>
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
                {getWeekDates().map((date, index) => (
                    <div
                        key={index}
                        className={`text-center py-2 border-r last:border-r-0 ${
                            date.toDateString() === new Date().toDateString() ? 'bg-blue-50' : ''
                        }`}
                    >
                      <p className="text-xs text-gray-500">
                        {date.toLocaleDateString(undefined, { weekday: 'short' })}
                      </p>
                      <p className="font-medium">{date.getDate()}</p>
                    </div>
                ))}
              </div>
              <div className="grid grid-cols-7 min-h-[400px]">
                {daysOfWeek.map((day, index) => {
                  const daySchedules = getSchedulesForDay(day);
                  return (
                      <div key={index} className="border-r last:border-r-0 min-h-full p-2 overflow-y-auto">
                        {daySchedules.length > 0 ? (
                            daySchedules.map(schedule => (
                                <div
                                    key={schedule.scheduleId}
                                    className="mb-2 p-2 rounded bg-blue-50 border border-blue-100 text-xs cursor-pointer hover:bg-blue-100"
                                    onClick={() => openEditModal(schedule)}
                                >
                                  <p className="font-medium truncate">{schedule.doctorName}</p>
                                  <div className="flex items-center text-gray-500 mt-1">
                                    <ClockIcon className="h-3 w-3 mr-1" />
                                    <span>{schedule.startTime} - {schedule.endTime}</span>
                                  </div>
                                  <p className="text-gray-500 truncate mt-1">{schedule.roomName}</p>
                                </div>
                            ))
                        ) : (
                            <div className="h-full flex items-center justify-center">
                              <p className="text-xs text-gray-400">No schedules</p>
                            </div>
                        )}
                      </div>
                  );
                })}
              </div>
            </div>
        )}

        {/* Create/Edit Schedule Modal */}
        <Modal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            title={currentSchedule ? 'Edit Schedule' : 'Create New Schedule'}
            size="lg"
        >
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Doctor */}
              <div>
                <label htmlFor="doctorId" className="block text-sm font-medium text-gray-700">
                  Doctor
                </label>
                <select
                    id="doctorId"
                    name="doctorId"
                    value={formData.doctorId}
                    onChange={handleInputChange}
                    className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm ${
                        errors.doctorId ? 'border-red-300 text-red-900 focus:outline-none focus:ring-red-500 focus:border-red-500' :
                            'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                    }`}
                >
                  <option value="">Select Doctor</option>
                  {doctors.map(doctor => (
                      <option key={doctor.id} value={doctor.id.toString()}>
                        {doctor.fullName} ({doctor.specialization})
                      </option>
                  ))}
                </select>
                {errors.doctorId && <p className="mt-1 text-sm text-red-600">{errors.doctorId}</p>}
              </div>

              {/* Medical Center */}
              <div>
                <label htmlFor="medicalCenterId" className="block text-sm font-medium text-gray-700">
                  Medical Center
                </label>
                <select
                    id="medicalCenterId"
                    name="medicalCenterId"
                    value={formData.medicalCenterId}
                    onChange={handleInputChange}
                    className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm ${
                        errors.medicalCenterId ? 'border-red-300 text-red-900 focus:outline-none focus:ring-red-500 focus:border-red-500' :
                            'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                    }`}
                >
                  <option value="">Select Medical Center</option>
                  {medicalCenters.map(center => (
                      <option key={center.id} value={center.id.toString()}>
                        {center.centerName}
                      </option>
                  ))}
                </select>
                {errors.medicalCenterId && (
                    <p className="mt-1 text-sm text-red-600">{errors.medicalCenterId}</p>
                )}
              </div>

              {/* Room */}
              <div>
                <label htmlFor="channelingRoomId" className="block text-sm font-medium text-gray-700">
                  Room
                </label>
                <select
                    id="channelingRoomId"
                    name="channelingRoomId"
                    value={formData.channelingRoomId}
                    onChange={handleInputChange}
                    disabled={!formData.medicalCenterId || availableRooms.length === 0}
                    className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm ${
                        errors.channelingRoomId ? 'border-red-300 text-red-900 focus:outline-none focus:ring-red-500 focus:border-red-500' :
                            'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                    } ${!formData.medicalCenterId ? 'bg-gray-100' : ''}`}
                >
                  <option value="">Select Room</option>
                  {availableRooms.map(room => (
                      <option key={room.roomId} value={room.roomId.toString()}>
                        {room.roomName} ({room.description})
                      </option>
                  ))}
                </select>
                {!formData.medicalCenterId && !errors.channelingRoomId && (
                    <p className="mt-1 text-xs text-gray-500">Select a medical center first</p>
                )}
                {formData.medicalCenterId && availableRooms.length === 0 && !errors.channelingRoomId && (
                    <p className="mt-1 text-xs text-gray-500">No rooms available for this center</p>
                )}
                {errors.channelingRoomId && <p className="mt-1 text-sm text-red-600">{errors.channelingRoomId}</p>}
              </div>

              {/* Day of Week */}
              <div>
                <label htmlFor="dayOfWeek" className="block text-sm font-medium text-gray-700">
                  Day of Week
                </label>
                <select
                    id="dayOfWeek"
                    name="dayOfWeek"
                    value={formData.dayOfWeek}
                    onChange={handleInputChange}
                    className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm ${
                        errors.dayOfWeek ? 'border-red-300 text-red-900 focus:outline-none focus:ring-red-500 focus:border-red-500' :
                            'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                    }`}
                >
                  <option value="">Select Day</option>
                  {daysOfWeek.map(day => (
                      <option key={day} value={day}>
                        {day}
                      </option>
                  ))}
                </select>
                {errors.dayOfWeek && <p className="mt-1 text-sm text-red-600">{errors.dayOfWeek}</p>}
              </div>

              {/* Start Time */}
              <div>
                <label htmlFor="startTime" className="block text-sm font-medium text-gray-700">
                  Start Time
                </label>
                <input
                    type="time"
                    id="startTime"
                    name="startTime"
                    value={formData.startTime}
                    onChange={handleInputChange}
                    className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm ${
                        errors.startTime ? 'border-red-300 text-red-900 focus:outline-none focus:ring-red-500 focus:border-red-500' :
                            'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                    }`}
                />
                {errors.startTime && <p className="mt-1 text-sm text-red-600">{errors.startTime}</p>}
              </div>

              {/* End Time */}
              <div>
                <label htmlFor="endTime" className="block text-sm font-medium text-gray-700">
                  End Time
                </label>
                <input
                    type="time"
                    id="endTime"
                    name="endTime"
                    value={formData.endTime}
                    onChange={handleInputChange}
                    className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm ${
                        errors.endTime ? 'border-red-300 text-red-900 focus:outline-none focus:ring-red-500 focus:border-red-500' :
                            'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                    }`}
                />
                {errors.endTime && <p className="mt-1 text-sm text-red-600">{errors.endTime}</p>}
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
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                >
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>
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
        <Modal
            isOpen={isDeleteModalOpen}
            onClose={() => setIsDeleteModalOpen(false)}
            title="Confirm Deletion"
            size="sm"
        >
          {currentSchedule && (
              <>
                <p className="text-gray-700">
                  Are you sure you want to delete this schedule for{' '}
                  <span className="font-medium">{currentSchedule.doctorName}</span> on{' '}
                  <span className="font-medium">{currentSchedule.dayOfWeek}</span>?
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
              </>
          )}
        </Modal>
      </div>
  );
};

export default ScheduleManagement;