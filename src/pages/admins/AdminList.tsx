import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusIcon, EditIcon, TrashIcon, ShieldIcon } from 'lucide-react';
import Table from '../../components/ui/Table';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import { toast } from 'sonner';
interface Admin {
  id: string;
  name: string;
  email: string;
  role: 'Super Admin' | 'Admin' | 'Manager';
  lastLogin: string;
  status: 'Active' | 'Inactive';
}
// Mock data
const mockAdmins: Admin[] = [{
  id: '1',
  name: 'Admin User',
  email: 'admin@example.com',
  role: 'Super Admin',
  lastLogin: '2023-07-10T09:30:00',
  status: 'Active'
}, {
  id: '2',
  name: 'John Manager',
  email: 'john.manager@example.com',
  role: 'Manager',
  lastLogin: '2023-07-09T14:45:00',
  status: 'Active'
}, {
  id: '3',
  name: 'Sarah Admin',
  email: 'sarah.admin@example.com',
  role: 'Admin',
  lastLogin: '2023-07-08T11:20:00',
  status: 'Active'
}, {
  id: '4',
  name: 'Mike Supervisor',
  email: 'mike.supervisor@example.com',
  role: 'Manager',
  lastLogin: '2023-07-05T16:15:00',
  status: 'Inactive'
}];
const AdminList: React.FC = () => {
  const navigate = useNavigate();
  const [admins, setAdmins] = useState<Admin[]>(mockAdmins);
  const [adminToDelete, setAdminToDelete] = useState<Admin | null>(null);
  const columns = [{
    header: 'Name',
    accessor: 'name',
    sortable: true
  }, {
    header: 'Email',
    accessor: 'email'
  }, {
    header: 'Role',
    accessor: (admin: Admin) => <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${admin.role === 'Super Admin' ? 'bg-purple-100 text-purple-800' : admin.role === 'Admin' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>
          {admin.role}
        </span>,
    sortable: true
  }, {
    header: 'Last Login',
    accessor: (admin: Admin) => {
      const date = new Date(admin.lastLogin);
      return date.toLocaleString();
    },
    sortable: true
  }, {
    header: 'Status',
    accessor: (admin: Admin) => <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${admin.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {admin.status}
        </span>,
    sortable: true
  }];
  const handleDelete = (admin: Admin) => {
    setAdminToDelete(admin);
  };
  const confirmDelete = () => {
    if (!adminToDelete) return;
    setAdmins(admins.filter(a => a.id !== adminToDelete.id));
    toast.success(`${adminToDelete.name} has been removed from the system`);
    setAdminToDelete(null);
  };
  const renderActions = (admin: Admin) => <div className="flex justify-end space-x-2">
      <Button variant="outline" size="sm" icon={<EditIcon className="h-4 w-4" />} onClick={() => navigate(`/admins/edit/${admin.id}`)}>
        Edit
      </Button>
      <Button variant="danger" size="sm" icon={<TrashIcon className="h-4 w-4" />} onClick={() => handleDelete(admin)} disabled={admin.role === 'Super Admin'}>
        Delete
      </Button>
    </div>;
  return <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-800">
          Admin Management
        </h1>
        <Button variant="primary" icon={<PlusIcon className="h-5 w-5" />} onClick={() => navigate('/admins/new')}>
          Add Admin
        </Button>
      </div>
      <Table columns={columns} data={admins} keyField="id" title="System Administrators" actions={renderActions} searchable emptyMessage="No administrators found" />
      {/* Delete Confirmation Modal */}
      <Modal isOpen={!!adminToDelete} onClose={() => setAdminToDelete(null)} title="Confirm Deletion" size="sm" footer={<>
            <Button variant="outline" onClick={() => setAdminToDelete(null)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={confirmDelete}>
              Delete
            </Button>
          </>}>
        <p>
          Are you sure you want to delete administrator {adminToDelete?.name}?
          This action cannot be undone.
        </p>
      </Modal>
    </div>;
};
export default AdminList;