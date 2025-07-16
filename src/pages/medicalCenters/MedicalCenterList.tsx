import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusIcon, EditIcon, TrashIcon, EyeIcon, MapPinIcon, PhoneIcon, MailIcon } from 'lucide-react';
import Table from '../../components/ui/Table';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import { toast } from 'sonner';
import axios from 'axios';

interface MedicalCenter {
    id: number;
    centerName: string;
    address: string;
    contact1: string;
    contact2?: string;
    email: string;
    status: string;
    channelingFee: number;
    registrationNumber: string;
    distric: string;
    centerType: string;
    centerTypeId: number;
}

const MedicalCenterList: React.FC = () => {
    const navigate = useNavigate();
    const [centers, setCenters] = useState<MedicalCenter[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [centerToDelete, setCenterToDelete] = useState<MedicalCenter | null>(null);
    const [viewCenter, setViewCenter] = useState<MedicalCenter | null>(null);

    useEffect(() => {
        const fetchMedicalCenters = async () => {
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
                const response = await axios.get('http://localhost:8080/api/v1/medical/center/getAll', config);
                if (response.data.code === 200) {
                    setCenters(response.data.data);
                } else {
                    setError(response.data.message || 'Failed to fetch medical centers');
                }
            } catch (err) {
                setError('Failed to connect to the server');
                console.error('Error fetching medical centers:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchMedicalCenters();
    }, []);

    const columns = [
        {
            header: 'Name',
            accessor: 'centerName',
            sortable: true
        },
        {
            header: 'Address',
            accessor: (center: MedicalCenter) => (
                <div className="flex items-center">
                    <MapPinIcon className="h-4 w-4 text-gray-500 mr-1" />
                    <span>{center.address}</span>
                </div>
            )
        },
        {
            header: 'Contact',
            accessor: (center: MedicalCenter) => (
                <div className="flex items-center">
                    <PhoneIcon className="h-4 w-4 text-gray-500 mr-1" />
                    <span>{center.contact1}</span>
                </div>
            )
        },
        {
            header: 'Email',
            accessor: (center: MedicalCenter) => (
                <div className="flex items-center">
                    <MailIcon className="h-4 w-4 text-gray-500 mr-1" />
                    <span>{center.email}</span>
                </div>
            )
        },
        {
            header: 'Type',
            accessor: 'centerType',
            sortable: true
        },
        {
            header: 'Status',
            accessor: (center: MedicalCenter) => (
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
          ${center.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {center.status}
        </span>
            ),
            sortable: true
        }
    ];

    const handleDelete = (center: MedicalCenter) => {
        setCenterToDelete(center);
    };

    const confirmDelete = async () => {
        if (!centerToDelete) return;

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
            await axios.delete(`http://localhost:8080/api/v1/medical/center?id=${centerToDelete.id}`,config);
            setCenters(centers.filter(c => c.id !== centerToDelete.id));
            toast.success(`${centerToDelete.centerName} has been removed`);
        } catch (err) {
            toast.error('Failed to delete medical center');
            console.error('Error deleting medical center:', err);
        } finally {
            setCenterToDelete(null);
        }
    };

    const handleView = (center: MedicalCenter) => {
        setViewCenter(center);
    };

    const renderActions = (center: MedicalCenter) => (
        <div className="flex justify-end space-x-2">
            <Button
                variant="outline"
                size="sm"
                icon={<EyeIcon className="h-4 w-4" />}
                onClick={() => handleView(center)}
            >
                View
            </Button>
            <Button
                variant="outline"
                size="sm"
                icon={<EditIcon className="h-4 w-4" />}
                onClick={() => navigate(`/medical-centers/edit/${center.id}`)}
            >
                Edit
            </Button>
            <Button
                variant="danger"
                size="sm"
                icon={<TrashIcon className="h-4 w-4" />}
                onClick={() => handleDelete(center)}
            >
                Delete
            </Button>
        </div>
    );

    if (loading) {
        return <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>;
    }

    if (error) {
        return <div className="p-4 bg-red-50 text-red-600 rounded-md">
            {error}
        </div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-semibold text-gray-800">
                    Medical Centers
                </h1>
                <Button
                    variant="primary"
                    icon={<PlusIcon className="h-5 w-5" />}
                    onClick={() => navigate('/medical-centers/new')}
                >
                    Add Medical Center
                </Button>
            </div>

            <div className="overflow-hidden border border-gray-200 rounded-lg">
                <div className="overflow-y-auto max-h-[calc(100vh-200px)]">
                    <Table
                        columns={columns}
                        data={centers}
                        keyField="id"
                        title="Registered Medical Centers"
                        actions={renderActions}
                        searchable
                        emptyMessage="No medical centers registered yet"
                    />
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            <Modal
                isOpen={!!centerToDelete}
                onClose={() => setCenterToDelete(null)}
                title="Confirm Deletion"
                size="sm"
                footer={
                    <>
                        <Button variant="outline" onClick={() => setCenterToDelete(null)}>
                            Cancel
                        </Button>
                        <Button variant="danger" onClick={confirmDelete}>
                            Delete
                        </Button>
                    </>
                }
            >
                <p>
                    Are you sure you want to delete {centerToDelete?.centerName}? This action
                    cannot be undone and may affect doctor schedules.
                </p>
            </Modal>

            {/* View Medical Center Modal */}
            <Modal
                isOpen={!!viewCenter}
                onClose={() => setViewCenter(null)}
                title="Medical Center Details"
                size="md"
            >
                {viewCenter && (
                    <div className="space-y-4">
                        <div className="flex justify-center">
                            <div className="h-24 w-24 rounded-full bg-green-100 flex items-center justify-center">
                <span className="text-2xl font-bold text-green-600">
                  {viewCenter.centerName[0]}
                </span>
                            </div>
                        </div>
                        <h3 className="text-xl font-medium text-center">
                            {viewCenter.centerName}
                        </h3>
                        <div className="border-t pt-4 mt-4">
                            <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                                <div className="col-span-2">
                                    <dt className="text-sm font-medium text-gray-500">
                                        Address
                                    </dt>
                                    <dd className="mt-1 text-sm text-gray-900 flex items-start">
                                        <MapPinIcon className="h-5 w-5 text-gray-400 mr-1 flex-shrink-0 mt-0.5" />
                                        <span>{viewCenter.address}</span>
                                    </dd>
                                </div>
                                <div>
                                    <dt className="text-sm font-medium text-gray-500">Primary Contact</dt>
                                    <dd className="mt-1 text-sm text-gray-900 flex items-center">
                                        <PhoneIcon className="h-4 w-4 text-gray-400 mr-1" />
                                        {viewCenter.contact1}
                                    </dd>
                                </div>
                                <div>
                                    <dt className="text-sm font-medium text-gray-500">Secondary Contact</dt>
                                    <dd className="mt-1 text-sm text-gray-900 flex items-center">
                                        <PhoneIcon className="h-4 w-4 text-gray-400 mr-1" />
                                        {viewCenter.contact2 || 'N/A'}
                                    </dd>
                                </div>
                                <div>
                                    <dt className="text-sm font-medium text-gray-500">Email</dt>
                                    <dd className="mt-1 text-sm text-gray-900 flex items-center">
                                        <MailIcon className="h-4 w-4 text-gray-400 mr-1" />
                                        {viewCenter.email}
                                    </dd>
                                </div>
                                <div>
                                    <dt className="text-sm font-medium text-gray-500">District</dt>
                                    <dd className="mt-1 text-sm text-gray-900">
                                        {viewCenter.distric}
                                    </dd>
                                </div>
                                <div>
                                    <dt className="text-sm font-medium text-gray-500">Registration Number</dt>
                                    <dd className="mt-1 text-sm text-gray-900">
                                        {viewCenter.registrationNumber}
                                    </dd>
                                </div>
                                <div>
                                    <dt className="text-sm font-medium text-gray-500">Channeling Fee</dt>
                                    <dd className="mt-1 text-sm text-gray-900">
                                        LKR {viewCenter.channelingFee.toFixed(2)}
                                    </dd>
                                </div>
                                <div>
                                    <dt className="text-sm font-medium text-gray-500">Status</dt>
                                    <dd className="mt-1 text-sm text-gray-900">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                      ${viewCenter.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {viewCenter.status}
                    </span>
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

export default MedicalCenterList;