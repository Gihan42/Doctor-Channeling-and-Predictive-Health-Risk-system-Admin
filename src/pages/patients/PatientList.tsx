import React, { useState, useEffect } from 'react';
import { TrashIcon, EyeIcon, UserIcon } from 'lucide-react';
import Table from '../../components/ui/Table';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import { toast } from 'sonner';
import axios from 'axios';

interface Patient {
  id: number;
  uniqId: string;
  fullName: string;
  email: string;
  gender: string;
  dateOfBirthDay: string | null;
  age: number;
  contact: string;
  address: string;
  city: string;
  status: string;
  roleId: number;
}

const PatientList: React.FC = () => {
  const baseUrl = import.meta.env.VITE_BASE_URL;
  const [patients, setPatients] = useState<Patient[]>([]);
  const [patientToDelete, setPatientToDelete] = useState<Patient | null>(null);
  const [viewPatient, setViewPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const token = localStorage.getItem('jwt');
        if (!token) {
          throw new Error('No authentication token found');
        }

        const response = await axios.get(
            `${baseUrl}patient/getAllActivePatients`,
            {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            }
        );

        if (response.data.code === 200) {
          setPatients(response.data.data);
        } else {
          throw new Error(response.data.message || 'Failed to fetch patients');
        }
      } catch (err) {
        console.error('Error fetching patients:', err);
        setError(err.message || 'Failed to fetch patients');
        toast.error('Failed to load patient data');
      } finally {
        setLoading(false);
      }
    };

    fetchPatients();
  }, []);

  const columns = [
    {
      header: 'Patient ID',
      accessor: 'uniqId'
    },
    {
      header: 'Name',
      accessor: 'fullName',
      sortable: true
    },
    {
      header: 'Gender',
      accessor: 'gender'
    },
    {
      header: 'Age',
      accessor: 'age',
      sortable: true
    },
    {
      header: 'Contact',
      accessor: 'contact'
    },
    {
      header: 'Email',
      accessor: 'email'
    },
    {
      header: 'City',
      accessor: 'city'
    }
  ];

  const handleDelete = (patient: Patient) => {
    setPatientToDelete(patient);
  };

  const confirmDelete = async () => {
    if (!patientToDelete) return;

    try {
      const token = localStorage.getItem('jwt');
      if (!token) {
        throw new Error('No authentication token found');
      }

      // Call your delete API endpoint here
      await axios.delete(`${baseUrl}patient?id=${patientToDelete.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      // For now, we'll just update the local state
      setPatients(patients.filter(p => p.id !== patientToDelete.id));
      toast.success(`${patientToDelete.fullName} has been removed from the system`);
    } catch (err) {
      console.error('Error deleting patient:', err);
      toast.error('Failed to delete patient');
    } finally {
      setPatientToDelete(null);
    }
  };

  const handleView = (patient: Patient) => {
    setViewPatient(patient);
  };

  const renderActions = (patient: Patient) => (
      <div className="flex justify-end space-x-2">
        <Button
            variant="outline"
            size="sm"
            icon={<EyeIcon className="h-4 w-4" />}
            onClick={() => handleView(patient)}
        >
          View
        </Button>
        <Button
            variant="danger"
            size="sm"
            icon={<TrashIcon className="h-4 w-4" />}
            onClick={() => handleDelete(patient)}
        >
          Delete
        </Button>
      </div>
  );

  if (loading) {
    return (
        <div className="flex justify-center items-center h-64">
          <p>Loading patient data...</p>
        </div>
    );
  }

  if (error) {
    return (
        <div className="flex justify-center items-center h-64 text-red-500">
          <p>Error: {error}</p>
        </div>
    );
  }

  return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-semibold text-gray-800">
            Patient Management
          </h1>
        </div>

        <div className="overflow-hidden rounded-lg shadow">
          <div className="overflow-y-auto" style={{ maxHeight: 'calc(100vh - 200px)' }}>
            <Table
                columns={columns}
                data={patients}
                keyField="id"
                title="Registered Patients"
                actions={renderActions}
                searchable
                emptyMessage="No patients found"
            />
          </div>
        </div>

        {/* Delete Confirmation Modal */}
        <Modal
            isOpen={!!patientToDelete}
            onClose={() => setPatientToDelete(null)}
            title="Confirm Deletion"
            size="sm"
            footer={
              <>
                <Button variant="outline" onClick={() => setPatientToDelete(null)}>
                  Cancel
                </Button>
                <Button variant="danger" onClick={confirmDelete}>
                  Delete
                </Button>
              </>
            }
        >
          <p>
            Are you sure you want to delete {patientToDelete?.fullName}'s record? This
            action cannot be undone.
          </p>
        </Modal>

        {/* View Patient Modal */}
        <Modal
            isOpen={!!viewPatient}
            onClose={() => setViewPatient(null)}
            title="Patient Details"
            size="md"
        >
          {viewPatient && (
              <div className="space-y-4">
                <div className="flex justify-center">
                  <div className="h-24 w-24 rounded-full bg-blue-100 flex items-center justify-center">
                    <UserIcon className="h-12 w-12 text-blue-600" />
                  </div>
                </div>
                <h3 className="text-xl font-medium text-center">
                  {viewPatient.fullName}
                </h3>
                <p className="text-gray-500 text-center">
                  Patient ID: {viewPatient.uniqId}
                </p>
                <div className="border-t pt-4 mt-4">
                  <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Gender</dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        {viewPatient.gender}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Age</dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        {viewPatient.age}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Contact</dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        {viewPatient.contact}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Email</dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        {viewPatient.email}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Date of Birth</dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        {viewPatient.dateOfBirthDay || 'Not specified'}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">City</dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        {viewPatient.city}
                      </dd>
                    </div>
                    <div className="col-span-2">
                      <dt className="text-sm font-medium text-gray-500">Address</dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        {viewPatient.address}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Status</dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        {viewPatient.status}
                      </dd>
                    </div>
                  </dl>
                </div>
              </div>
          )}
        </Modal>
      </div>
  );
};

export default PatientList;