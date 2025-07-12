import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusIcon, EditIcon, TrashIcon, EyeIcon, MapPinIcon, PhoneIcon } from 'lucide-react';
import Table from '../../components/ui/Table';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import { toast } from 'sonner';
interface MedicalCenter {
  id: string;
  name: string;
  location: string;
  contact: string;
  roomCount: number;
  establishedDate: string;
}
// Mock data
const mockMedicalCenters: MedicalCenter[] = [{
  id: '1',
  name: 'Central Hospital',
  location: '123 Main Street, Downtown',
  contact: '+1 (555) 123-4567',
  roomCount: 25,
  establishedDate: '2005-06-15'
}, {
  id: '2',
  name: 'Westside Medical Center',
  location: '456 West Avenue, Westside',
  contact: '+1 (555) 234-5678',
  roomCount: 18,
  establishedDate: '2010-03-22'
}, {
  id: '3',
  name: 'Eastside Clinic',
  location: '789 East Boulevard, Eastside',
  contact: '+1 (555) 345-6789',
  roomCount: 12,
  establishedDate: '2015-11-10'
}, {
  id: '4',
  name: 'North Community Health',
  location: '321 North Road, Northside',
  contact: '+1 (555) 456-7890',
  roomCount: 8,
  establishedDate: '2018-07-05'
}];
const MedicalCenterList: React.FC = () => {
  const navigate = useNavigate();
  const [centers, setCenters] = useState<MedicalCenter[]>(mockMedicalCenters);
  const [centerToDelete, setCenterToDelete] = useState<MedicalCenter | null>(null);
  const [viewCenter, setViewCenter] = useState<MedicalCenter | null>(null);
  const columns = [{
    header: 'Name',
    accessor: 'name',
    sortable: true
  }, {
    header: 'Location',
    accessor: (center: MedicalCenter) => <div className="flex items-center">
          <MapPinIcon className="h-4 w-4 text-gray-500 mr-1" />
          <span>{center.location}</span>
        </div>
  }, {
    header: 'Contact',
    accessor: (center: MedicalCenter) => <div className="flex items-center">
          <PhoneIcon className="h-4 w-4 text-gray-500 mr-1" />
          <span>{center.contact}</span>
        </div>
  }, {
    header: 'Rooms',
    accessor: 'roomCount',
    sortable: true
  }, {
    header: 'Established',
    accessor: (center: MedicalCenter) => {
      const date = new Date(center.establishedDate);
      return date.toLocaleDateString();
    },
    sortable: true
  }];
  const handleDelete = (center: MedicalCenter) => {
    setCenterToDelete(center);
  };
  const confirmDelete = () => {
    if (!centerToDelete) return;
    setCenters(centers.filter(c => c.id !== centerToDelete.id));
    toast.success(`${centerToDelete.name} has been removed`);
    setCenterToDelete(null);
  };
  const handleView = (center: MedicalCenter) => {
    setViewCenter(center);
  };
  const renderActions = (center: MedicalCenter) => <div className="flex justify-end space-x-2">
      <Button variant="outline" size="sm" icon={<EyeIcon className="h-4 w-4" />} onClick={() => handleView(center)}>
        View
      </Button>
      <Button variant="outline" size="sm" icon={<EditIcon className="h-4 w-4" />} onClick={() => navigate(`/medical-centers/edit/${center.id}`)}>
        Edit
      </Button>
      <Button variant="danger" size="sm" icon={<TrashIcon className="h-4 w-4" />} onClick={() => handleDelete(center)}>
        Delete
      </Button>
    </div>;
  return <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-800">
          Medical Centers
        </h1>
        <Button variant="primary" icon={<PlusIcon className="h-5 w-5" />} onClick={() => navigate('/medical-centers/new')}>
          Add Medical Center
        </Button>
      </div>
      <Table columns={columns} data={centers} keyField="id" title="Registered Medical Centers" actions={renderActions} searchable emptyMessage="No medical centers registered yet" />
      {/* Delete Confirmation Modal */}
      <Modal isOpen={!!centerToDelete} onClose={() => setCenterToDelete(null)} title="Confirm Deletion" size="sm" footer={<>
            <Button variant="outline" onClick={() => setCenterToDelete(null)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={confirmDelete}>
              Delete
            </Button>
          </>}>
        <p>
          Are you sure you want to delete {centerToDelete?.name}? This action
          cannot be undone and may affect doctor schedules.
        </p>
      </Modal>
      {/* View Medical Center Modal */}
      <Modal isOpen={!!viewCenter} onClose={() => setViewCenter(null)} title="Medical Center Details" size="md">
        {viewCenter && <div className="space-y-4">
            <div className="flex justify-center">
              <div className="h-24 w-24 rounded-full bg-green-100 flex items-center justify-center">
                <span className="text-2xl font-bold text-green-600">
                  {viewCenter.name[0]}
                </span>
              </div>
            </div>
            <h3 className="text-xl font-medium text-center">
              {viewCenter.name}
            </h3>
            <div className="border-t pt-4 mt-4">
              <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                <div className="col-span-2">
                  <dt className="text-sm font-medium text-gray-500">
                    Location
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900 flex items-start">
                    <MapPinIcon className="h-5 w-5 text-gray-400 mr-1 flex-shrink-0 mt-0.5" />
                    <span>{viewCenter.location}</span>
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Contact</dt>
                  <dd className="mt-1 text-sm text-gray-900 flex items-center">
                    <PhoneIcon className="h-4 w-4 text-gray-400 mr-1" />
                    {viewCenter.contact}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">
                    Established
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {new Date(viewCenter.establishedDate).toLocaleDateString()}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">
                    Total Rooms
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {viewCenter.roomCount}
                  </dd>
                </div>
              </dl>
            </div>
            <div className="border-t pt-4 mt-4">
              <h4 className="text-sm font-medium text-gray-500 mb-2">
                Available Facilities
              </h4>
              <div className="flex flex-wrap gap-2">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  X-Ray
                </span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  Laboratory
                </span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  Pharmacy
                </span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  Emergency Care
                </span>
              </div>
            </div>
          </div>}
      </Modal>
    </div>;
};
export default MedicalCenterList;