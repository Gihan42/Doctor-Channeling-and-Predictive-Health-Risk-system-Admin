import React, { useEffect, useState } from 'react';
import { UsersIcon, UserIcon, CalendarIcon, ActivityIcon, ClipboardListIcon, HospitalIcon } from 'lucide-react';
import axios from 'axios';

const StatCard: React.FC<{
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
}> = ({
        title,
        value,
        icon,
        color
      }) => {
  return <div className="bg-white rounded-lg shadow p-5">
    <div className="flex items-center">
      <div className={`rounded-full p-3 ${color}`}>{icon}</div>
      <div className="ml-4">
        <h3 className="text-gray-500 text-sm font-medium">{title}</h3>
        <p className="text-2xl font-bold">{value}</p>
      </div>
    </div>
  </div>;
};

const UpcomingSchedule: React.FC<{
  doctor: string;
  center: string;
  time: string;
}> = ({
        doctor,
        center,
        time
      }) => {
  return <div className="flex items-center justify-between py-3 border-b last:border-0">
    <div>
      <p className="font-medium">{doctor}</p>
      <p className="text-sm text-gray-500">{center}</p>
    </div>
    <div className="text-right">
      <p className="font-medium">Today</p>
      <p className="text-sm text-gray-500">{time}</p>
    </div>
  </div>;
};

const ActivityLog: React.FC<{
  action: string;
  user: string;
  time: string;
}> = ({
        action,
        user,
        time
      }) => {
  return <div className="flex items-center py-3 border-b last:border-0">
    <div className="h-2 w-2 bg-blue-500 rounded-full mr-3"></div>
    <div className="flex-1">
      <p className="text-sm">
        <span className="font-medium">{user}</span> {action}
      </p>
    </div>
    <div className="text-xs text-gray-500">{time}</div>
  </div>;
};

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState({
    totalDoctors: 0,
    medicalCenters: 0,
    registeredPatients: 0,
    scheduledSessions: 0,
    loading: true,
    error: null
  });

  const [upcomingAppointments, setUpcomingAppointments] = useState<Array<{
    startTime: string;
    endTime: string;
    appointmentTime: string;
    doctorName: string;
    medicalCenterName: string;
  }>>([]);
  const [loadingAppointments, setLoadingAppointments] = useState(true);
  const [appointmentsError, setAppointmentsError] = useState(null);

  const fetchStats = async () => {
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

      const endpoints = [
        { url: 'http://localhost:8080/api/v1/doctor/count', key: 'totalDoctors' },
        { url: 'http://localhost:8080/api/v1/medical/center/count', key: 'medicalCenters' },
        { url: 'http://localhost:8080/api/v1/patient/count', key: 'registeredPatients' },
        { url: 'http://localhost:8080/api/v1/appointment/count', key: 'scheduledSessions' }
      ];

      const responses = await Promise.all(
          endpoints.map(endpoint => axios.get(endpoint.url, config))
      );

      const newStats = responses.reduce((acc, response, index) => {
        return {
          ...acc,
          [endpoints[index].key]: response.data.data
        };
      }, {});

      setStats(prev => ({
        ...prev,
        ...newStats,
        loading: false
      }));
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      if(error == 'Request failed with status code 403') {
        localStorage.removeItem('jwt');
        window.location.href = '/login';
        return;
      }
      setStats(prev => ({
        ...prev,
        error: error.message,
        loading: false
      }));
    }
  };

  const fetchTodayAppointments = async () => {
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

      const response = await axios.get(
          'http://localhost:8080/api/v1/appointment/todayPendingAppointments',
          config
      );

      setUpcomingAppointments(response.data.data);
      setLoadingAppointments(false);
    } catch (error) {
      console.error('Error fetching appointments:', error);
      setAppointmentsError(error.message);
      setLoadingAppointments(false);
    }
  };

  useEffect(() => {
    fetchStats();
    fetchTodayAppointments();
  }, []);

  if (stats.loading) {
    return <div className="flex justify-center items-center h-64">
      <p>Loading dashboard data...</p>
    </div>;
  }

  if (stats.error) {
    if(stats.error === 'Request failed with status code 403') {
      localStorage.removeItem('jwt');
      window.location.href = '/login';
    }
  }

  return <div className="space-y-6">
    <div className="flex justify-between items-center">
      <h1 className="text-2xl font-semibold text-gray-800">Dashboard</h1>
    </div>
    {/* Stats Section */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
          title="Total Doctors"
          value={stats.totalDoctors}
          icon={<UsersIcon className="h-6 w-6 text-white" />}
          color="bg-blue-500 text-white"
      />
      <StatCard
          title="Medical Centers"
          value={stats.medicalCenters}
          icon={<HospitalIcon className="h-6 w-6 text-white" />}
          color="bg-green-500 text-white"
      />
      <StatCard
          title="Registered Patients"
          value={stats.registeredPatients}
          icon={<UserIcon className="h-6 w-6 text-white" />}
          color="bg-purple-500 text-white"
      />
      <StatCard
          title="Scheduled Sessions"
          value={stats.scheduledSessions}
          icon={<CalendarIcon className="h-6 w-6 text-white" />}
          color="bg-yellow-500 text-white"
      />
    </div>
    {/* Two column layout for schedules and activity */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Upcoming Schedules */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium text-gray-800 flex items-center">
            <CalendarIcon className="h-5 w-5 mr-2 text-blue-500" />
            Upcoming Schedules
          </h2>
          <button className="text-sm text-blue-600 hover:text-blue-800">
            View All
          </button>
        </div>
        {loadingAppointments ? (
            <div className="flex justify-center items-center h-24">
              <p>Loading appointments...</p>
            </div>
        ) : appointmentsError ? (
            <div className="flex justify-center items-center h-24 text-red-500">
              <p>Error loading appointments: {appointmentsError}</p>
            </div>
        ) : upcomingAppointments.length > 0 ? (
            <div className="space-y-0">
              {upcomingAppointments.map((appointment, index) => (
                  <UpcomingSchedule
                      key={index}
                      doctor={appointment.doctorName}
                      center={appointment.medicalCenterName}
                      time={`${appointment.startTime} - ${appointment.endTime}`}
                  />
              ))}
            </div>
        ) : (
            <div className="flex justify-center items-center h-24">
              <p>No upcoming appointments today</p>
            </div>
        )}
      </div>
      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium text-gray-800 flex items-center">
            <ActivityIcon className="h-5 w-5 mr-2 text-blue-500" />
            Recent Activity
          </h2>
          <button className="text-sm text-blue-600 hover:text-blue-800">
            View All
          </button>
        </div>
        <div className="space-y-0">
          <ActivityLog action="registered a new patient" user="Admin User" time="5 min ago" />
          <ActivityLog action="updated Dr. Johnson's schedule" user="Admin User" time="20 min ago" />
          <ActivityLog action="added a new medical center" user="System Admin" time="1 hour ago" />
          <ActivityLog action="sent email to all doctors" user="Admin User" time="3 hours ago" />
          <ActivityLog action="registered a new doctor" user="System Admin" time="Yesterday" />
        </div>
      </div>
    </div>
    {/* Quick Actions */}
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-lg font-medium text-gray-800 mb-4 flex items-center">
        <ClipboardListIcon className="h-5 w-5 mr-2 text-blue-500" />
        Quick Actions
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button className="flex items-center justify-center p-4 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100"
        onClick={() => window.location.href = '/doctors/new'}
        >
          <UsersIcon className="h-5 w-5 mr-2" />
          Add New Doctor
        </button>
        <button className="flex items-center justify-center p-4 bg-green-50 text-green-700 rounded-lg hover:bg-green-100"
        onClick={() => window.location.href = '/medical-centers/new'}
        >
          <HospitalIcon className="h-5 w-5 mr-2" />
          Add Medical Center
        </button>
        <button className="flex items-center justify-center p-4 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100"
        onClick={() => window.location.href = '/scheduling'}
        >
          <CalendarIcon className="h-5 w-5 mr-2" />
          Create Schedule
        </button>
      </div>
    </div>
  </div>;
};

export default Dashboard;