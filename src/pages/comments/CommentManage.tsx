import React, { useState, useEffect } from 'react';
import { TrashIcon, EyeIcon, CheckIcon, XIcon, MessageSquareIcon } from 'lucide-react';
import Table from '../../components/ui/Table';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import { toast } from 'sonner';
import axios from 'axios';
import Select from '../../components/ui/Select';
import DatePicker from '../../components/ui/DatePicker';
import Pagination from '../../components/ui/Pagination';

interface Comment {
  patientReviewId: number;
  patientName: string;
  comment: string;
  status: 'Active' | 'Inactive';
  date: string;
  viewed: boolean;
}

const CommentManage: React.FC = () => {
  const baseUrl = import.meta.env.VITE_BASE_URL;
  const [comments, setComments] = useState<Comment[]>([]);
  const [filteredComments, setFilteredComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [commentToDelete, setCommentToDelete] = useState<Comment | null>(null);
  const [selectedComment, setSelectedComment] = useState<Comment | null>(null);
  const [viewComment, setViewComment] = useState<Comment | null>(null);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(4); // Changed to 4 rows per page
  
  // Filter state
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string | null>(null);
  const [patientNameFilter, setPatientNameFilter] = useState<string>('');

  useEffect(() => {
    const fetchComments = async () => {
      try {
        const token = localStorage.getItem('jwt');
        if (!token) {
          throw new Error('No authentication token found');
        }

        const response = await axios.get(`${baseUrl}comments/getAllReviews`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.data.code === 200) {
          setComments(response.data.data);
          setFilteredComments(response.data.data);
        } else {
          throw new Error(response.data.message || 'Failed to fetch comments');
        }
      } catch (err) {
        console.error('Error fetching comments:', err);
        setError(err.message || 'Failed to fetch comments');
        toast.error('Failed to load comment data');
      } finally {
        setLoading(false);
      }
    };

    fetchComments();
  }, [baseUrl]);

  // Apply filters whenever filter states change
  useEffect(() => {
    let filtered = [...comments];

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(comment => 
        comment.status.toLowerCase() === statusFilter.toLowerCase()
      );
    }

    // Date filter - fixed to compare date strings properly
    if (dateFilter) {
      filtered = filtered.filter(comment => {
        const commentDate = new Date(comment.date).toISOString().split('T')[0];
        return commentDate === dateFilter;
      });
    }

    // Patient name filter
    if (patientNameFilter) {
      filtered = filtered.filter(comment =>
        comment.patientName.toLowerCase().includes(patientNameFilter.toLowerCase())
      );
    }

    setFilteredComments(filtered);
    setCurrentPage(1); // Reset to first page when filters change
  }, [comments, statusFilter, dateFilter, patientNameFilter]);

  const columns = [
    {
      header: 'Date',
      accessor: 'date',
      cell: (row: Comment) => (
        <div className="min-w-[100px]">
          {new Date(row.date).toLocaleDateString()}
        </div>
      ),
      sortable: true,
      width: '12%'
    },
    {
      header: 'Patient',
      accessor: 'patientName',
      cell: (row: Comment) => (
        <div className="min-w-[120px] max-w-[150px]">
          <span className="font-medium text-gray-900 truncate block" title={row.patientName}>
            {row.patientName}
          </span>
        </div>
      ),
      sortable: true,
      width: '15%'
    },
    {
      header: 'Comment',
      accessor: 'comment',
      cell: (row: Comment) => (
        <div className="max-w-[250px] min-w-[200px]">
          <p className="text-sm text-gray-900 line-clamp-2 break-words leading-tight" title={row.comment}>
            {row.comment.length > 80 ? `${row.comment.substring(0, 80)}...` : row.comment}
          </p>
          {row.comment.length > 80 && (
            <button
              onClick={() => handleView(row)}
              className="text-xs text-blue-600 hover:text-blue-800 mt-1"
            >
              Read more
            </button>
          )}
        </div>
      ),
      width: '35%'
    },
    {
      header: 'Status',
      accessor: 'status',
      cell: (row: Comment) => (
        <div className="min-w-[80px]">
          <span className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
            row.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            {row.status}
          </span>
        </div>
      ),
      width: '10%'
    },
    {
      header: 'Viewed',
      accessor: 'viewed',
      cell: (row: Comment) => (
        <div className="min-w-[70px]">
          <span className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
            row.viewed ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
          }`}>
            {row.viewed ? 'Yes' : 'No'}
          </span>
        </div>
      ),
      width: '8%'
    },
    {
      header: 'Actions',
      accessor: 'actions',
      cell: (row: Comment) => renderActions(row),
      width: '20%'
    }
  ];

  const handleDelete = (comment: Comment) => {
    setCommentToDelete(comment);
  };

  const confirmDelete = async () => {
    if (!commentToDelete) return;

    try {
      const token = localStorage.getItem('jwt');
      if (!token) {
        throw new Error('No authentication token found');
      }

      await axios.delete(`${baseUrl}comments?patientReviewId=${commentToDelete.patientReviewId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      setComments(comments.filter(c => c.patientReviewId !== commentToDelete.patientReviewId));
      toast.success('Comment has been deleted successfully');
    } catch (err) {
      console.error('Error deleting comment:', err);
      toast.error('Failed to delete comment');
    } finally {
      setCommentToDelete(null);
    }
  };

  const handleView = (comment: Comment) => {
    setViewComment(comment);
    // Mark as viewed if not already
    if (!comment.viewed) {
      markAsViewed(comment.patientReviewId);
    }
  };

  const markAsViewed = async (patientReviewId: number) => {
    try {
      const token = localStorage.getItem('jwt');
      if (!token) {
        throw new Error('No authentication token found');
      }

      // Update local state immediately for better UX
      setComments(comments.map(c => 
        c.patientReviewId === patientReviewId ? { ...c, viewed: true } : c
      ));

      // You may need to implement this endpoint on your backend
      // await axios.patch(`${baseUrl}comments/markViewed?patientReviewId=${patientReviewId}`, {}, {
      //   headers: {
      //     'Authorization': `Bearer ${token}`
      //   }
      // });
    } catch (err) {
      console.error('Error marking comment as viewed:', err);
    }
  };

  const updateStatus = async (status: 'Active' | 'Inactive') => {
    if (!selectedComment) return;

    try {
      const token = localStorage.getItem('jwt');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const endpoint = status === 'Active' 
        ? `${baseUrl}comments?patientReviewId=${selectedComment.patientReviewId}`
        : `${baseUrl}comments?reviewId=${selectedComment.patientReviewId}`;

      await axios.put(endpoint, {}, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      setComments(comments.map(c => 
        c.patientReviewId === selectedComment.patientReviewId ? { ...c, status } : c
      ));
      setSelectedComment(null);
      toast.success(`Comment status updated to ${status}`);
    } catch (err) {
      console.error('Error updating comment status:', err);
      toast.error('Failed to update comment status');
    }
  };

  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value);
  };

  const handleDateFilterChange = (date: Date | null) => {
    setDateFilter(date ? date.toISOString().split('T')[0] : null);
  };

  const handlePatientNameFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPatientNameFilter(e.target.value);
  };

  const clearFilters = () => {
    setStatusFilter('all');
    setDateFilter(null);
    setPatientNameFilter('');
  };

  const renderActions = (comment: Comment) => (
    <div className="flex justify-end space-x-1 min-w-[180px]">
      <Button
        variant="outline"
        size="sm"
        icon={<EyeIcon className="h-3 w-3" />}
        onClick={() => handleView(comment)}
        className="px-2 py-1 text-xs"
        title="View Comment"
      />
      <Button
        variant="success"
        size="sm"
        icon={<CheckIcon className="h-3 w-3" />}
        onClick={() => {
          setSelectedComment(comment);
          updateStatus('Active');
        }}
        className="px-2 py-1 text-xs"
        title="Mark Active"
      />
      <Button
        variant="danger"
        size="sm"
        icon={<XIcon className="h-3 w-3" />}
        onClick={() => {
          setSelectedComment(comment);
          updateStatus('Inactive');
        }}
        className="px-2 py-1 text-xs"
        title="Mark Inactive"
      />
      <Button
        variant="danger"
        size="sm"
        icon={<TrashIcon className="h-3 w-3" />}
        onClick={() => handleDelete(comment)}
        className="px-2 py-1 text-xs"
        title="Delete Comment"
      />
    </div>
  );

  // Pagination logic
  const totalItems = filteredComments.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedComments = filteredComments.slice(startIndex, endIndex);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p className="ml-3">Loading comment data...</p>
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
    <div className="space-y-6 max-w-full">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-800">
          Patient Comments Management
        </h1>
        <div className="text-sm text-gray-600">
          Total: {totalItems} comments
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <Select
              value={statusFilter}
              onChange={(e) => handleStatusFilterChange(e.target.value)}
              options={[
                { value: 'all', label: 'All Statuses' },
                { value: 'active', label: 'Active' },
                { value: 'inactive', label: 'Inactive' }
              ]}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
            <DatePicker
              selected={dateFilter ? new Date(dateFilter) : null}
              onChange={handleDateFilterChange}
              placeholderText="Filter by date"
              isClearable
              dateFormat="yyyy-MM-dd"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Patient Name</label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Filter by patient name"
              value={patientNameFilter}
              onChange={handlePatientNameFilterChange}
            />
          </div>
          <div className="flex items-end">
            <Button
              variant="outline"
              onClick={clearFilters}
              className="w-full"
            >
              Clear Filters
            </Button>
          </div>
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            Patient Comments
            {filteredComments.length !== comments.length && (
              <span className="text-sm font-normal text-gray-500 ml-2">
                ({filteredComments.length} filtered)
              </span>
            )}
          </h3>
        </div>
        
        {paginatedComments.length === 0 ? (
          <div className="text-center py-12">
            <MessageSquareIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No comments found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {filteredComments.length === 0 && comments.length > 0 
                ? "No comments match your current filters."
                : "No comments have been submitted yet."
              }
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {columns.map((column, index) => (
                    <th
                      key={index}
                      className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      style={{ width: column.width }}
                    >
                      {column.header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedComments.map((comment, index) => (
                  <tr key={comment.patientReviewId} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    {columns.map((column, colIndex) => (
                      <td key={colIndex} className="px-4 py-4 whitespace-nowrap text-sm">
                        {column.cell ? column.cell(comment) : comment[column.accessor as keyof Comment]}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-700">
            Showing {startIndex + 1} to {Math.min(endIndex, totalItems)} of {totalItems} results
          </div>
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!commentToDelete}
        onClose={() => setCommentToDelete(null)}
        title="Confirm Deletion"
        size="sm"
        footer={
          <>
            <Button variant="outline" onClick={() => setCommentToDelete(null)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={confirmDelete}>
              Delete
            </Button>
          </>
        }
      >
        <p>
          Are you sure you want to delete this comment from <strong>{commentToDelete?.patientName}</strong>? 
          This action cannot be undone.
        </p>
      </Modal>

      {/* View Comment Modal */}
      <Modal
        isOpen={!!viewComment}
        onClose={() => setViewComment(null)}
        title="Comment Details"
        size="lg"
      >
        {viewComment && (
          <div className="space-y-4">
            <div className="flex items-start">
              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center mr-3 flex-shrink-0">
                <MessageSquareIcon className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-medium">{viewComment.patientName}</h3>
                <p className="text-sm text-gray-500">
                  {new Date(viewComment.date).toLocaleDateString()}
                </p>
              </div>
            </div>
            <div className="border-t pt-4 mt-2">
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-500 mb-2">Comment</h4>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-gray-900 whitespace-pre-line leading-relaxed">
                    {viewComment.comment}
                  </p>
                </div>
              </div>
              <dl className="grid grid-cols-3 gap-4">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Status</dt>
                  <dd className="mt-1 text-sm">
                    <span className={`px-2 py-1 rounded-full ${
                      viewComment.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {viewComment.status}
                    </span>
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Viewed</dt>
                  <dd className="mt-1 text-sm">
                    <span className={`px-2 py-1 rounded-full ${
                      viewComment.viewed ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {viewComment.viewed ? 'Yes' : 'No'}
                    </span>
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Review ID</dt>
                  <dd className="mt-1 text-sm text-gray-900">{viewComment.patientReviewId}</dd>
                </div>
              </dl>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default CommentManage;