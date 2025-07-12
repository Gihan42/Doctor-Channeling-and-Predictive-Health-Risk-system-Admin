import React, { useState } from 'react';
import { PlusIcon, TrashIcon, EyeIcon, UserIcon } from 'lucide-react';
import Table from '../../components/ui/Table';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import { toast } from 'sonner';
interface Patient {
  id: string;
  name: string;
  gender: 'Male' | 'Female' | 'Other';
  age: number;
  contact: string;
  email: string;
  address: string;
  registeredDate: string;
  medicalHistory?: string;
}
// Mock data
const mockPatients: Patient[] = [{
  id: '1',
  name: 'John Smith',
  gender: 'Male',
  age: 45,
  contact: '+1 (555) 123-4567',
  email: 'john.smith@example.com',
  address: '123 Main St, Anytown, USA',
  registeredDate: '2023-01-15',
  medicalHistory: 'Hypertension, Diabetes Type 2'
}, {
  id: '2',
  name: 'Emily Johnson',
  gender: 'Female',
  age: 32,
  contact: '+1 (555) 234-5678',
  email: 'emily.johnson@example.com',
  address: '456 Oak Ave, Somewhere, USA',
  registeredDate: '2023-02-22',
  medicalHistory: 'Asthma'
}, {
  id: '3',
  name: 'Michael Williams',
  gender: 'Male',
  age: 58,
  contact: '+1 (555) 345-6789',
  email: 'michael.williams@example.com',
  address: '789 Pine Rd, Nowhere, USA',
  registeredDate: '2023-03-10',
  medicalHistory: 'Heart Disease, Arthritis'
}, {
  id: '4',
  name: 'Sarah Brown',
  gender: 'Female',
  age: 27,
  contact: '+1 (555) 456-7890',
  email: 'sarah.brown@example.com',
  address: '101 Cedar Ln, Anywhere, USA',
  registeredDate: '2023-04-05',
  medicalHistory: 'Allergies'
}, {
  id: '5',
  name: 'David Miller',
  gender: 'Male',
  age: 41,
  contact: '+1 (555) 567-8901',
  email: 'david.miller@example.com',
  address: '202 Birch Blvd, Everywhere, USA',
  registeredDate: '2023-05-18',
  medicalHistory: 'None'
}];
const PatientList: React.FC = () => {
  const [patients, setPatients] = useState<Patient[]>(mockPatients);
  const [patientToDelete, setPatientToDelete] = useState<Patient | null>(null);
  const [viewPatient, setViewPatient] = useState<Patient | null>(null);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [newPatient, setNewPatient] = useState<Partial<Patient>>({
    name: '',
    gender: 'Male',
    age: 0,
    contact: '',
    email: '',
    address: '',
    medicalHistory: ''
  });
  const [formErrors, setFormErrors] = useState<{
    [key: string]: string;
  }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const columns = [{
    header: 'Name',
    accessor: 'name',
    sortable: true
  }, {
    header: 'Gender',
    accessor: 'gender'
  }, {
    header: 'Age',
    accessor: 'age',
    sortable: true
  }, {
    header: 'Contact',
    accessor: 'contact'
  }, {
    header: 'Email',
    accessor: 'email'
  }, {
    header: 'Registered Date',
    accessor: (patient: Patient) => new Date(patient.registeredDate).toLocaleDateString(),
    sortable: true
  }];
  const handleDelete = (patient: Patient) => {
    setPatientToDelete(patient);
  };
  const confirmDelete = () => {
    if (!patientToDelete) return;
    setPatients(patients.filter(p => p.id !== patientToDelete.id));
    toast.success(`${patientToDelete.name} has been removed from the system`);
    setPatientToDelete(null);
  };
  const handleView = (patient: Patient) => {
    setViewPatient(patient);
  };
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const {
      name,
      value
    } = e.target;
    setNewPatient(prev => ({
      ...prev,
      [name]: name === 'age' ? parseInt(value) || 0 : value
    }));
    // Clear error when field is edited
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };
  const validateForm = () => {
    const errors: {
      [key: string]: string;
    } = {};
    if (!newPatient.name?.trim()) {
      errors.name = 'Name is required';
    }
    if (!newPatient.age || newPatient.age <= 0) {
      errors.age = 'Valid age is required';
    }
    if (!newPatient.contact?.trim()) {
      errors.contact = 'Contact is required';
    } else if (!/^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/.test(newPatient.contact)) {
      errors.contact = 'Please enter a valid phone number';
    }
    if (!newPatient.email?.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newPatient.email)) {
      errors.email = 'Please enter a valid email';
    }
    if (!newPatient.address?.trim()) {
      errors.address = 'Address is required';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }
    setIsSubmitting(true);
    // Simulate API call
    setTimeout(() => {
      const newPatientData: Patient = {
        id: `new_${Date.now()}`,
        name: newPatient.name!,
        gender: newPatient.gender as 'Male' | 'Female' | 'Other',
        age: newPatient.age!,
        contact: newPatient.contact!,
        email: newPatient.email!,
        address: newPatient.address!,
        registeredDate: new Date().toISOString().split('T')[0],
        medicalHistory: newPatient.medicalHistory
      };
      setPatients(prev => [...prev, newPatientData]);
      toast.success(`${newPatientData.name} has been registered successfully`);
      setIsSubmitting(false);
      setIsRegisterModalOpen(false);
      setNewPatient({
        name: '',
        gender: 'Male',
        age: 0,
        contact: '',
        email: '',
        address: '',
        medicalHistory: ''
      });
    }, 1000);
  };
  const renderActions = (patient: Patient) => <div className="flex justify-end space-x-2">
      <Button variant="outline" size="sm" icon={<EyeIcon className="h-4 w-4" />} onClick={() => handleView(patient)}>
        View
      </Button>
      <Button variant="danger" size="sm" icon={<TrashIcon className="h-4 w-4" />} onClick={() => handleDelete(patient)}>
        Delete
      </Button>
    </div>;
  return <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-800">
          Patient Management
        </h1>
        <Button variant="primary" icon={<PlusIcon className="h-5 w-5" />} onClick={() => setIsRegisterModalOpen(true)}>
          Register Patient
        </Button>
      </div>
      <Table columns={columns} data={patients} keyField="id" title="Registered Patients" actions={renderActions} searchable emptyMessage="No patients registered yet" />
      {/* Delete Confirmation Modal */}
      <Modal isOpen={!!patientToDelete} onClose={() => setPatientToDelete(null)} title="Confirm Deletion" size="sm" footer={<>
            <Button variant="outline" onClick={() => setPatientToDelete(null)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={confirmDelete}>
              Delete
            </Button>
          </>}>
        <p>
          Are you sure you want to delete {patientToDelete?.name}'s record? This
          action cannot be undone.
        </p>
      </Modal>
      {/* View Patient Modal */}
      <Modal isOpen={!!viewPatient} onClose={() => setViewPatient(null)} title="Patient Details" size="md">
        {viewPatient && <div className="space-y-4">
            <div className="flex justify-center">
              <div className="h-24 w-24 rounded-full bg-blue-100 flex items-center justify-center">
                <UserIcon className="h-12 w-12 text-blue-600" />
              </div>
            </div>
            <h3 className="text-xl font-medium text-center">
              {viewPatient.name}
            </h3>
            <p className="text-gray-500 text-center">
              Patient ID: {viewPatient.id}
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
                <div className="col-span-2">
                  <dt className="text-sm font-medium text-gray-500">Address</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {viewPatient.address}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">
                    Registered Date
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {new Date(viewPatient.registeredDate).toLocaleDateString()}
                  </dd>
                </div>
              </dl>
            </div>
            {viewPatient.medicalHistory && <div className="border-t pt-4 mt-4">
                <h4 className="text-sm font-medium text-gray-500 mb-2">
                  Medical History
                </h4>
                <p className="text-sm text-gray-900">
                  {viewPatient.medicalHistory}
                </p>
              </div>}
          </div>}
      </Modal>
      {/* Register Patient Modal */}
      <Modal isOpen={isRegisterModalOpen} onClose={() => setIsRegisterModalOpen(false)} title="Register New Patient" size="lg">
        <form onSubmit={handleRegister}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Full Name
              </label>
              <input type="text" id="name" name="name" value={newPatient.name} onChange={handleInputChange} className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm
                  ${formErrors.name ? 'border-red-300 text-red-900 placeholder-red-300 focus:outline-none focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'}
                `} placeholder="John Smith" />
              {formErrors.name && <p className="mt-1 text-sm text-red-600">{formErrors.name}</p>}
            </div>
            {/* Gender */}
            <div>
              <label htmlFor="gender" className="block text-sm font-medium text-gray-700">
                Gender
              </label>
              <select id="gender" name="gender" value={newPatient.gender} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm">
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
            {/* Age */}
            <div>
              <label htmlFor="age" className="block text-sm font-medium text-gray-700">
                Age
              </label>
              <input type="number" id="age" name="age" min="0" value={newPatient.age} onChange={handleInputChange} className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm
                  ${formErrors.age ? 'border-red-300 text-red-900 placeholder-red-300 focus:outline-none focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'}
                `} />
              {formErrors.age && <p className="mt-1 text-sm text-red-600">{formErrors.age}</p>}
            </div>
            {/* Contact */}
            <div>
              <label htmlFor="contact" className="block text-sm font-medium text-gray-700">
                Contact Number
              </label>
              <input type="text" id="contact" name="contact" value={newPatient.contact} onChange={handleInputChange} className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm
                  ${formErrors.contact ? 'border-red-300 text-red-900 placeholder-red-300 focus:outline-none focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'}
                `} placeholder="+1 (555) 123-4567" />
              {formErrors.contact && <p className="mt-1 text-sm text-red-600">
                  {formErrors.contact}
                </p>}
            </div>
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input type="email" id="email" name="email" value={newPatient.email} onChange={handleInputChange} className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm
                  ${formErrors.email ? 'border-red-300 text-red-900 placeholder-red-300 focus:outline-none focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'}
                `} placeholder="john.smith@example.com" />
              {formErrors.email && <p className="mt-1 text-sm text-red-600">{formErrors.email}</p>}
            </div>
            {/* Address */}
            <div className="md:col-span-2">
              <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                Address
              </label>
              <textarea id="address" name="address" rows={2} value={newPatient.address} onChange={handleInputChange} className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm
                  ${formErrors.address ? 'border-red-300 text-red-900 placeholder-red-300 focus:outline-none focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'}
                `} placeholder="123 Main St, Anytown, USA" />
              {formErrors.address && <p className="mt-1 text-sm text-red-600">
                  {formErrors.address}
                </p>}
            </div>
            {/* Medical History */}
            <div className="md:col-span-2">
              <label htmlFor="medicalHistory" className="block text-sm font-medium text-gray-700">
                Medical History (Optional)
              </label>
              <textarea id="medicalHistory" name="medicalHistory" rows={3} value={newPatient.medicalHistory} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm" placeholder="Any pre-existing conditions or relevant medical history..." />
            </div>
          </div>
          <div className="mt-6 flex justify-end space-x-3">
            <Button type="button" variant="outline" onClick={() => setIsRegisterModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={isSubmitting}>
              Register Patient
            </Button>
          </div>
        </form>
      </Modal>
    </div>;
};
export default PatientList;