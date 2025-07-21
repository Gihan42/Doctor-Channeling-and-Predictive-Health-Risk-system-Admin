import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusIcon, EditIcon, TrashIcon, EyeIcon } from 'lucide-react';
import Table from '../../components/ui/Table';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import { toast } from 'sonner';
import axios from 'axios';

interface Doctor {
  id: number;
  uniqId: string;
  fullName: string;
  specialization: string;
  qualificationName: string;
  contact: string;
  hospitalAffiliation: string;
  medicalRegistrationNo: string;
  gender: string;
  nic: string;
  address1: string;
  address2: string;
  yearsOfExperience: number;
  status: string;
  roleId: number;
  email: string;
  doctorFee: number;
  patientCount?: number;
}

const DoctorList: React.FC = () => {
  const baseUrl = import.meta.env.VITE_BASE_URL;
  const navigate = useNavigate();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [doctorToDelete, setDoctorToDelete] = useState<Doctor | null>(null);
  const [viewDoctor, setViewDoctor] = useState<Doctor | null>(null);
  const [editDoctor, setEditDoctor] = useState<Doctor | null>(null);
  const [editLoading, setEditLoading] = useState<boolean>(false);

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const token = localStorage.getItem('jwt');
        const response = await axios.get(`${baseUrl}doctor/getDoctors`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          }
        });

        if (response.data.code === 200) {
          const doctorsWithPatientCounts = await Promise.all(
              response.data.data.map(async (doctor: Doctor) => {
                try {
                  const patientCountResponse = await axios.get(
                      `${baseUrl}doctor/getPatientCount?doctorId=${doctor.id}`,
                      {
                        headers: {
                          'Authorization': `Bearer ${token}`,
                        }
                      }
                  );
                  return {
                    ...doctor,
                    patientCount: patientCountResponse.data.data || 0
                  };
                } catch (err) {
                  console.error(`Error fetching patient count for doctor ${doctor.id}:`, err);
                  return {
                    ...doctor,
                    patientCount: 0
                  };
                }
              })
          );
          setDoctors(doctorsWithPatientCounts);
        } else {
          setError('Failed to fetch doctors');
        }
      } catch (err) {
        setError('Error fetching doctors data');
        console.error('Error fetching doctors:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDoctors();
  }, []);

  const columns = [
    {
      header: 'Name',
      accessor: 'fullName',
      sortable: true
    },
    {
      header: 'Specialization',
      accessor: 'specialization',
      sortable: true
    },
    {
      header: 'Qualification',
      accessor: 'qualificationName'
    },
    {
      header: 'Contact',
      accessor: 'contact'
    },
    {
      header: 'Hospital',
      accessor: 'hospitalAffiliation',
      sortable: true
    },
  ];

  const handleDelete = (doctor: Doctor) => {
    setDoctorToDelete(doctor);
  };

  const confirmDelete = async () => {
    if (!doctorToDelete) return;

    try {
      const token = localStorage.getItem('jwt');
      await axios.delete(`${baseUrl}doctor/delete?id=${doctorToDelete.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });
      setDoctors(doctors.filter(d => d.id !== doctorToDelete.id));
      toast.success(`Dr. ${doctorToDelete.fullName.split(' ')[1]} has been removed`);
    } catch (err) {
      toast.error('Failed to delete doctor');
      console.error('Error deleting doctor:', err);
    } finally {
      setDoctorToDelete(null);
    }
  };

  const handleView = (doctor: Doctor) => {
    setViewDoctor(doctor);
  };

  const handleEdit = (doctor: Doctor) => {
    setEditDoctor({...doctor});
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editDoctor) return;

    setEditLoading(true);
    try {
      const token = localStorage.getItem('jwt');

      const updateData = {
        id: editDoctor.id,
        uniqId: editDoctor.uniqId,
        fullName: editDoctor.fullName,
        gender: editDoctor.gender,
        contact: editDoctor.contact,
        address1: editDoctor.address1,
        address2: editDoctor.address2,
        nic: editDoctor.nic,
        email: editDoctor.email,
        password: "test1234",
        medicalRegistrationNo: editDoctor.medicalRegistrationNo,
        yearsOfExperience: editDoctor.yearsOfExperience,
        hospitalAffiliation: editDoctor.hospitalAffiliation,
        qualificationName: editDoctor.qualificationName,
        specialization: editDoctor.specialization,
        status: editDoctor.status,
        doctorFee: editDoctor.doctorFee,
        roleId: editDoctor.roleId,
        patientCount: editDoctor.patientCount || 0
      };

      const response = await axios.put(`${baseUrl}doctor/update`, updateData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.data.code === 200) {
        // Refresh the doctors list to get updated patient counts
        const updatedDoctors = await Promise.all(
            doctors.map(async d => {
              if (d.id === editDoctor.id) {
                try {
                  const patientCountResponse = await axios.get(
                      `${baseUrl}doctor/getPatientCount?doctorId=${editDoctor.id}`,
                      {
                        headers: {
                          'Authorization': `Bearer ${token}`,
                        }
                      }
                  );
                  return {
                    ...editDoctor,
                    patientCount: patientCountResponse.data.data || 0
                  };
                } catch (err) {
                  console.error(`Error fetching patient count for doctor ${editDoctor.id}:`, err);
                  return {
                    ...editDoctor,
                    patientCount: d.patientCount || 0
                  };
                }
              }
              return d;
            })
        );
        setDoctors(updatedDoctors);
        toast.success('Doctor updated successfully');
        setEditDoctor(null);
      } else {
        toast.error('Failed to update doctor');
      }
    } catch (err) {
      toast.error('Error updating doctor');
      console.error('Error updating doctor:', err);
    } finally {
      setEditLoading(false);
    }
  };

  const handleEditChange = (field: keyof Doctor, value: any) => {
    if (editDoctor) {
      setEditDoctor({
        ...editDoctor,
        [field]: value
      });
    }
  };

  const renderActions = (doctor: Doctor) => (
      <div className="flex justify-end space-x-2">
        <Button variant="outline" size="sm" icon={<EyeIcon className="h-4 w-4" />} onClick={() => handleView(doctor)}>
          View
        </Button>
        <Button variant="outline" size="sm" icon={<EditIcon className="h-4 w-4" />} onClick={() => handleEdit(doctor)}>
          Edit
        </Button>
        <Button variant="danger" size="sm" icon={<TrashIcon className="h-4 w-4" />} onClick={() => handleDelete(doctor)}>
          Delete
        </Button>
      </div>
  );

  if (loading) {
    return <div className="flex justify-center items-center h-64">
      <p>Loading doctors...</p>
    </div>;
  }

  if (error) {
    return <div className="flex justify-center items-center h-64">
      <p className="text-red-500">{error}</p>
    </div>;
  }

  return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-semibold text-gray-800">
            Doctor Management
          </h1>
          <Button variant="primary" icon={<PlusIcon className="h-5 w-5" />} onClick={() => navigate('/doctors/new')}>
            Add Doctor
          </Button>
        </div>
        <div className="h-[70vh] overflow-y-auto">
          <Table
              columns={columns}
              data={doctors}
              keyField="id"
              title="Registered Doctors"
              actions={renderActions}
              searchable
              emptyMessage="No doctors registered yet"
          />
        </div>

        {/* Delete Confirmation Modal */}
        <Modal isOpen={!!doctorToDelete} onClose={() => setDoctorToDelete(null)} title="Confirm Deletion" size="sm" footer={
          <>
            <Button variant="outline" onClick={() => setDoctorToDelete(null)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={confirmDelete}>
              Delete
            </Button>
          </>
        }>
          <p>
            Are you sure you want to delete Dr.{' '}
            {doctorToDelete?.fullName.split(' ')[1]}? This action cannot be undone.
          </p>
          {doctorToDelete?.patientCount && doctorToDelete.patientCount > 0 && (
              <p className="mt-2 text-red-500">
                Warning: This doctor has {doctorToDelete.patientCount} associated patients.
              </p>
          )}
        </Modal>

        {/* View Doctor Modal */}
        <Modal isOpen={!!viewDoctor} onClose={() => setViewDoctor(null)} title="Doctor Details" size="md">
          {viewDoctor && (
              <div className="space-y-4">
                <div className="flex justify-center">
                  <div className="h-24 w-24 rounded-full bg-blue-100 flex items-center justify-center">
                <span className="text-2xl font-bold text-blue-600">
                  {viewDoctor.fullName.split(' ')[1][0]}
                </span>
                  </div>
                </div>
                <h3 className="text-xl font-medium text-center">
                  {viewDoctor.fullName}
                </h3>
                <p className="text-gray-500 text-center">
                  {viewDoctor.specialization}
                </p>
                <div className="border-t pt-4 mt-4">
                  <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                    <div>
                      <dt className="text-sm font-medium text-gray-500">
                        Qualification
                      </dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        {viewDoctor.qualificationName}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">
                        Registration Number
                      </dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        {viewDoctor.medicalRegistrationNo}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Contact</dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        {viewDoctor.contact}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">
                        Hospital Affiliation
                      </dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        {viewDoctor.hospitalAffiliation}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">
                        Email
                      </dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        {viewDoctor.email}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">
                        Years of Experience
                      </dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        {viewDoctor.yearsOfExperience}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">
                        Doctor Fee
                      </dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        {viewDoctor.doctorFee.toLocaleString('en-US', { style: 'currency', currency: 'LKR' })}
                      </dd>
                    </div>
                  </dl>
                </div>
              </div>
          )}
        </Modal>

        {/* Edit Doctor Modal */}
        <Modal
            isOpen={!!editDoctor}
            onClose={() => setEditDoctor(null)}
            title="Edit Doctor"
            size="lg"
            footer={
              <>
                <Button variant="outline" onClick={() => setEditDoctor(null)}>
                  Cancel
                </Button>
                <Button
                    variant="primary"
                    onClick={handleEditSubmit}
                    disabled={editLoading}
                >
                  {editLoading ? 'Updating...' : 'Update Doctor'}
                </Button>
              </>
            }
        >
          {editDoctor && (
              <div className="h-96 overflow-y-auto">
                <form onSubmit={handleEditSubmit} className="space-y-4 p-1">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Full Name
                      </label>
                      <input
                          type="text"
                          value={editDoctor.fullName}
                          onChange={(e) => handleEditChange('fullName', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Unique ID
                      </label>
                      <input
                          type="text"
                          value={editDoctor.uniqId}
                          onChange={(e) => handleEditChange('uniqId', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Gender
                      </label>
                      <select
                          value={editDoctor.gender}
                          onChange={(e) => handleEditChange('gender', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          required
                      >
                        <option value="">Select Gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Contact
                      </label>
                      <input
                          type="text"
                          value={editDoctor.contact}
                          onChange={(e) => handleEditChange('contact', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Address 1
                      </label>
                      <input
                          type="text"
                          value={editDoctor.address1}
                          onChange={(e) => handleEditChange('address1', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Address 2
                      </label>
                      <input
                          type="text"
                          value={editDoctor.address2}
                          onChange={(e) => handleEditChange('address2', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        NIC
                      </label>
                      <input
                          type="text"
                          value={editDoctor.nic}
                          onChange={(e) => handleEditChange('nic', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email
                      </label>
                      <input
                          type="email"
                          value={editDoctor.email}
                          onChange={(e) => handleEditChange('email', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Medical Registration No
                      </label>
                      <input
                          type="text"
                          value={editDoctor.medicalRegistrationNo}
                          onChange={(e) => handleEditChange('medicalRegistrationNo', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Years of Experience
                      </label>
                      <input
                          type="number"
                          value={editDoctor.yearsOfExperience}
                          onChange={(e) => handleEditChange('yearsOfExperience', parseInt(e.target.value))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Hospital Affiliation
                      </label>
                      <input
                          type="text"
                          value={editDoctor.hospitalAffiliation}
                          onChange={(e) => handleEditChange('hospitalAffiliation', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Qualification
                      </label>
                      <input
                          type="text"
                          value={editDoctor.qualificationName}
                          onChange={(e) => handleEditChange('qualificationName', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Specialization
                      </label>
                      <input
                          type="text"
                          value={editDoctor.specialization}
                          onChange={(e) => handleEditChange('specialization', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Status
                      </label>
                      <select
                          value={editDoctor.status}
                          onChange={(e) => handleEditChange('status', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          required
                      >
                        <option value="ACTIVE">Active</option>
                        <option value="INACTIVE">Inactive</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Doctor Fee
                      </label>
                      <input
                          type="number"
                          step="0.01"
                          value={editDoctor.doctorFee}
                          onChange={(e) => handleEditChange('doctorFee', parseFloat(e.target.value))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Patients
                      </label>
                      <input
                          type="number"
                          min="0"
                          value={editDoctor.patientCount || 0}
                          onChange={(e) => handleEditChange('patientCount', parseInt(e.target.value) || 0)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </form>
              </div>
          )}
        </Modal>
      </div>
  );
};

export default DoctorList;