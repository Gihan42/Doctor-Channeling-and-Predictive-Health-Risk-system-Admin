import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusIcon, EditIcon, TrashIcon } from 'lucide-react';
import Table from '../../components/ui/Table';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import { toast } from 'sonner';
import axios from 'axios';

interface Admin {
  id: string;
  uniqId: string;
  name: string;
  email: string;
  role: 'Super Admin' | 'Admin' | 'Manager';
  lastLogin?: string;
  status: 'Active' | 'Inactive';
}

const AdminList: React.FC = () => {
  const navigate = useNavigate();
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [adminToDelete, setAdminToDelete] = useState<Admin | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUserEmail, setCurrentUserEmail] = useState<string>('');

  useEffect(() => {

    const email = localStorage.getItem('email');
    console.log('Current User Email:', email); // Debug line
    if (email) {
      setCurrentUserEmail(email.trim()); // use trim() for safety
    }
    const fetchAdmins = async () => {
      try {
        const token = localStorage.getItem('jwt');
        if (!token) throw new Error('No authentication token found');

        const config = {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        };

        const response = await axios.get('http://localhost:8080/api/v1/admin/getAll', config);

        if (response.data.code === 200) {
          const mappedAdmins = response.data.data.map((admin: any) => ({
            id: admin.id.toString(),
            uniqId: admin.uniqId,
            name: admin.fullName,
            email: admin.email,
            role: mapRole(admin.roleId),
            status: admin.status,
          }));
          setAdmins(mappedAdmins);
        } else {
          setError('Failed to load admin data');
        }
      } catch (err) {
        setError('Error fetching admin data');
        console.error('Error fetching admins:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAdmins();
  }, []);

  const mapRole = (roleId: number): 'Super Admin' | 'Admin' | 'Manager' => {
    switch (roleId) {
      case 1: return 'Super Admin';
      case 2: return 'Admin';
      case 3: return 'Manager';
      default: return 'Manager';
    }
  };

  const columns = [
    {
      header: 'Name',
      accessor: 'name',
      sortable: true
    },
    {
      header: 'Email',
      accessor: 'email'
    },
    {
      header: 'Role',
      accessor: (admin: Admin) => (
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              admin.role === 'Super Admin' ? 'bg-purple-100 text-purple-800' :
                  admin.role === 'Admin' ? 'bg-blue-100 text-blue-800' :
                      'bg-green-100 text-green-800'
          }`}>
          {admin.role}
        </span>
      ),
      sortable: true
    },
    {
      header: 'Status',
      accessor: (admin: Admin) => (
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              admin.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
          {admin.status}
        </span>
      ),
      sortable: true
    }
  ];

  const handleDelete = (admin: Admin) => {
    setAdminToDelete(admin);
  };

  const confirmDelete = async () => {
    if (!adminToDelete) return;

    try {
      const token = localStorage.getItem('jwt');
      if (!token) throw new Error('No authentication token found');

      const config = {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      };

      const response = await axios.delete(
          `http://localhost:8080/api/v1/admin?id=${adminToDelete.id}`,
          config
      );

      if (response.data.code === 200) {
        setAdmins(prev => prev.filter(a => a.id !== adminToDelete.id));
        toast.success(`${adminToDelete.name} has been removed from the system`);
      } else {
        toast.error(response.data.message || 'Failed to delete admin');
      }
    } catch (err: any) {
      console.error('Error deleting admin:', err);
      toast.error(err?.response?.data?.message || 'Failed to delete admin');
    } finally {
      setAdminToDelete(null);
    }
  };

  const canDelete = (admin: Admin) => {
    return currentUserEmail === 'admin@gmail.com'
    && admin.role !== 'Admin'};

  const renderActions = (admin: Admin) => (
      <div className="flex justify-end space-x-2">
        <Button
            variant="outline"
            size="sm"
            icon={<EditIcon className="h-4 w-4" />}
            onClick={() => navigate(`/admins/edit/${admin.id}`)}
        >
          Edit
        </Button>
        <Button
            variant="danger"
            size="sm"
            icon={<TrashIcon className="h-4 w-4" />}
            onClick={() => handleDelete(admin)}
            disabled={!canDelete(admin)}
        >
          Delete
        </Button>
      </div>
  );

  return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-semibold text-gray-800">Admin Management</h1>
          {currentUserEmail === 'admin@gmail.com' && (
              <Button
                  variant="primary"
                  icon={<PlusIcon className="h-5 w-5" />}
                  onClick={() => navigate('/admins/new')}
              >
                Add Admin
              </Button>
          )}
        </div>

        {loading ? (
            <div className="flex justify-center items-center h-64">
              <p>Loading admins...</p>
            </div>
        ) : error ? (
            <div className="flex justify-center items-center h-64">
              <p className="text-red-500">{error}</p>
            </div>
        ) : (
            <div className="overflow-hidden border border-gray-200 rounded-lg">
              <Table
                  columns={columns}
                  data={admins}
                  keyField="id"
                  title="System Administrators"
                  actions={renderActions}
                  searchable
                  emptyMessage="No administrators found"
                  scrollable
                  scrollHeight="calc(100vh - 300px)"
              />
            </div>
        )}

        <Modal
            isOpen={!!adminToDelete}
            onClose={() => setAdminToDelete(null)}
            title="Confirm Deletion"
            size="sm"
            footer={
              <>
                <Button variant="outline" onClick={() => setAdminToDelete(null)}>Cancel</Button>
                <Button variant="danger" onClick={confirmDelete}>Delete</Button>
              </>
            }
        >
          <p>
            Are you sure you want to delete administrator <strong>{adminToDelete?.name}</strong>?<br />
            This action cannot be undone.
          </p>
        </Modal>
      </div>
  );
};

export default AdminList;
