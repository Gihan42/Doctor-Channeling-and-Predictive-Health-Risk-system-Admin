import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusIcon, EditIcon, TrashIcon, EyeIcon } from 'lucide-react';
import Table from '../../components/ui/Table';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
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
// Mock data
const mockDoctors: Doctor[] = [{
  id: '1',
  name: 'Dr. Sarah Johnson',
  specialization: 'Cardiology',
  qualification: 'MBBS, MD',
  contact: '+1 (555) 123-4567',
  medicalCenter: 'Central Hospital',
  registrationNumber: 'REG12345'
}, {
  id: '2',
  name: 'Dr. Michael Chen',
  specialization: 'Neurology',
  qualification: 'MBBS, MD',
  contact: '+1 (555) 234-5678',
  medicalCenter: 'Westside Medical Center',
  registrationNumber: 'REG23456'
}, {
  id: '3',
  name: 'Dr. Emily Rodriguez',
  specialization: 'Pediatrics',
  qualification: 'MBBS',
  contact: '+1 (555) 345-6789',
  medicalCenter: 'Central Hospital',
  registrationNumber: 'REG34567'
}, {
  id: '4',
  name: 'Dr. James Wilson',
  specialization: 'Orthopedics',
  qualification: 'MBBS, MS',
  contact: '+1 (555) 456-7890',
  medicalCenter: 'Eastside Clinic',
  registrationNumber: 'REG45678'
}, {
  id: '5',
  name: 'Dr. Lisa Patel',
  specialization: 'Dermatology',
  qualification: 'MBBS, MD',
  contact: '+1 (555) 567-8901',
  medicalCenter: 'Westside Medical Center',
  registrationNumber: 'REG56789'
}];
const DoctorList: React.FC = () => {
  const navigate = useNavigate();
  const [doctors, setDoctors] = useState<Doctor[]>(mockDoctors);
  const [doctorToDelete, setDoctorToDelete] = useState<Doctor | null>(null);
  const [viewDoctor, setViewDoctor] = useState<Doctor | null>(null);
  const columns = [{
    header: 'Name',
    accessor: 'name',
    sortable: true
  }, {
    header: 'Specialization',
    accessor: 'specialization',
    sortable: true
  }, {
    header: 'Qualification',
    accessor: 'qualification'
  }, {
    header: 'Contact',
    accessor: 'contact'
  }, {
    header: 'Medical Center',
    accessor: 'medicalCenter',
    sortable: true
  }];
  const handleDelete = (doctor: Doctor) => {
    setDoctorToDelete(doctor);
  };
  const confirmDelete = () => {
    if (!doctorToDelete) return;
    setDoctors(doctors.filter(d => d.id !== doctorToDelete.id));
    toast.success(`Dr. ${doctorToDelete.name.split(' ')[1]} has been removed`);
    setDoctorToDelete(null);
  };
  const handleView = (doctor: Doctor) => {
    setViewDoctor(doctor);
  };
  const renderActions = (doctor: Doctor) => <div className="flex justify-end space-x-2">
      <Button variant="outline" size="sm" icon={<EyeIcon className="h-4 w-4" />} onClick={() => handleView(doctor)}>
        View
      </Button>
      <Button variant="outline" size="sm" icon={<EditIcon className="h-4 w-4" />} onClick={() => navigate(`/doctors/edit/${doctor.id}`)}>
        Edit
      </Button>
      <Button variant="danger" size="sm" icon={<TrashIcon className="h-4 w-4" />} onClick={() => handleDelete(doctor)}>
        Delete
      </Button>
    </div>;
  return <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-800">
          Doctor Management
        </h1>
        <Button variant="primary" icon={<PlusIcon className="h-5 w-5" />} onClick={() => navigate('/doctors/new')}>
          Add Doctor
        </Button>
      </div>
      <Table columns={columns} data={doctors} keyField="id" title="Registered Doctors" actions={renderActions} searchable emptyMessage="No doctors registered yet" />
      {/* Delete Confirmation Modal */}
      <Modal isOpen={!!doctorToDelete} onClose={() => setDoctorToDelete(null)} title="Confirm Deletion" size="sm" footer={<>
            <Button variant="outline" onClick={() => setDoctorToDelete(null)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={confirmDelete}>
              Delete
            </Button>
          </>}>
        <p>
          Are you sure you want to delete Dr.{' '}
          {doctorToDelete?.name.split(' ')[1]}? This action cannot be undone.
        </p>
      </Modal>
      {/* View Doctor Modal */}
      <Modal isOpen={!!viewDoctor} onClose={() => setViewDoctor(null)} title="Doctor Details" size="md">
        {viewDoctor && <div className="space-y-4">
            <div className="flex justify-center">
              <div className="h-24 w-24 rounded-full bg-blue-100 flex items-center justify-center">
                <span className="text-2xl font-bold text-blue-600">
                  {viewDoctor.name.split(' ')[1][0]}
                </span>
              </div>
            </div>
            <h3 className="text-xl font-medium text-center">
              {viewDoctor.name}
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
                    {viewDoctor.qualification}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">
                    Registration Number
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {viewDoctor.registrationNumber}
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
                    Medical Center
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {viewDoctor.medicalCenter}
                  </dd>
                </div>
              </dl>
            </div>
          </div>}
      </Modal>
    </div>;
};
export default DoctorList;