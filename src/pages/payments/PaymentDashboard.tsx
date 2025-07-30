import React, { useState, useMemo, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Calendar, Filter, Search } from 'lucide-react';
import axios from 'axios';

// Define types for our payment data based on your API response
interface Payment {
  patientId: number;
  medicalCenterId: number;
  paymentId: number;
  patientName: string;
  paymentDate: string;
  paidAmount: number;
  medicalCenterName: string;
}

interface ApiResponse {
  code: number;
  message: string;
  data: Payment[];
}

// Payment Dashboard Component
const PaymentDashboard: React.FC = () => {
  const baseUrl = import.meta.env.VITE_BASE_URL;
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('list');

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const token = localStorage.getItem('jwt'); // Get token from storage
        const response = await axios.get<ApiResponse>(`${baseUrl}payment/payemntSummary`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.data.code === 200) {
          setPayments(response.data.data);
        } else {
          setError(response.data.message || 'Failed to fetch payments');
        }
      } catch (err) {
        setError('Error fetching payment data');
        console.error('Error fetching payments:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPayments();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      </div>
    );
  }

  return (
    <TabsContext.Provider value={{ value: activeTab, onValueChange: setActiveTab }}>
      <div className="space-y-6 p-6 bg-gray-50 min-h-screen">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Payment Management</h1>
          <p className="mt-2 text-gray-600">
            Monitor payments, generate reports, and analyze financial data
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="charts">Payment Charts</TabsTrigger>
            <TabsTrigger value="list">Payment List</TabsTrigger>
          </TabsList>

          <TabsContent value="charts" className="mt-2">
            <PaymentCharts payments={payments} />
          </TabsContent>

          <TabsContent value="list" className="mt-2">
            <PaymentList payments={payments} />
          </TabsContent>
        </Tabs>
      </div>
    </TabsContext.Provider>
  );
};

// Payment Charts Component
const PaymentCharts: React.FC<{ payments: Payment[] }> = ({ payments }) => {
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null);

  const years = useMemo(() => {
    const uniqueYears = new Set<number>();
    payments.forEach(payment => {
      const year = new Date(payment.paymentDate).getFullYear();
      uniqueYears.add(year);
    });
    return Array.from(uniqueYears).sort((a, b) => b - a);
  }, [payments]);

  const medicalCenters = useMemo(() => {
    const centers = new Set<string>();
    payments.forEach(payment => {
      centers.add(payment.medicalCenterName);
    });
    return Array.from(centers);
  }, [payments]);

  const yearData = useMemo(() => {
    return payments.filter(payment => {
      const paymentDate = new Date(payment.paymentDate);
      return paymentDate.getFullYear() === selectedYear;
    });
  }, [payments, selectedYear]);

  const monthlyData = useMemo(() => {
    const data: { [key: string]: { [center: string]: number } } = {};
    
    for (let i = 0; i < 12; i++) {
      const monthName = new Date(selectedYear, i, 1).toLocaleString('default', { month: 'short' });
      data[monthName] = {};
      medicalCenters.forEach(center => {
        data[monthName][center] = 0;
      });
      data[monthName]['total'] = 0;
    }

    yearData.forEach(payment => {
      const paymentDate = new Date(payment.paymentDate);
      const monthName = paymentDate.toLocaleString('default', { month: 'short' });
      data[monthName][payment.medicalCenterName] = (data[monthName][payment.medicalCenterName] || 0) + payment.paidAmount;
      data[monthName]['total'] = (data[monthName]['total'] || 0) + payment.paidAmount;
    });

    return Object.keys(data).map(month => ({
      name: month,
      ...data[month]
    }));
  }, [yearData, medicalCenters, selectedYear]);

  const colors = useMemo(() => {
    return medicalCenters.map(() => `#${Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')}`);
  }, [medicalCenters]);

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <div className="mb-6 flex flex-wrap items-center gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Select Year
            </label>
            <select
              value={selectedYear}
              onChange={(e) => {
                setSelectedYear(Number(e.target.value));
                setSelectedMonth(null);
              }}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border px-3 py-2"
            >
              {years.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
        </div>

        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Monthly Payments for {selectedYear}
        </h3>
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value) => [`${Number(value).toLocaleString()} LKR`, '']} />
              <Legend />
              {medicalCenters.map((center, index) => (
                <Bar 
                  key={center} 
                  dataKey={center} 
                  name={center} 
                  stackId="a" 
                  fill={colors[index % colors.length]} 
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

// Payment List Component
const PaymentList: React.FC<{ payments: Payment[] }> = ({ payments }) => {
  const [patientFilter, setPatientFilter] = useState<string>('');
  const [medicalCenterFilter, setMedicalCenterFilter] = useState<string>('');
  const [yearFilter, setYearFilter] = useState<string>('');

  const uniquePatients = useMemo(() => {
    const patients = new Set<string>();
    payments.forEach(payment => patients.add(payment.patientName));
    return Array.from(patients).sort();
  }, [payments]);

  const uniqueMedicalCenters = useMemo(() => {
    const centers = new Set<string>();
    payments.forEach(payment => centers.add(payment.medicalCenterName));
    return Array.from(centers).sort();
  }, [payments]);

  const uniqueYears = useMemo(() => {
    const years = new Set<string>();
    payments.forEach(payment => {
      const year = payment.paymentDate.split('-')[0];
      years.add(year);
    });
    return Array.from(years).sort((a, b) => b.localeCompare(a));
  }, [payments]);

  const filteredPayments = useMemo(() => {
    return payments.filter(payment => {
      if (patientFilter && payment.patientName !== patientFilter) return false;
      if (medicalCenterFilter && payment.medicalCenterName !== medicalCenterFilter) return false;
      if (yearFilter && !payment.paymentDate.startsWith(yearFilter)) return false;
      return true;
    });
  }, [payments, patientFilter, medicalCenterFilter, yearFilter]);

  const totalAmount = useMemo(() => {
    return filteredPayments.reduce((sum, payment) => sum + payment.paidAmount, 0);
  }, [filteredPayments]);

  const columns = [
    { header: 'Payment ID', accessor: 'paymentId', sortable: true },
    { header: 'Patient', accessor: 'patientName', sortable: true },
    { header: 'Medical Center', accessor: 'medicalCenterName', sortable: true },
    { 
      header: 'Amount', 
      accessor: (payment: Payment) => (
        <span className="font-medium">{payment.paidAmount.toLocaleString()} LKR</span>
      ), 
      sortable: true 
    },
    { 
      header: 'Payment Date', 
      accessor: (payment: Payment) => new Date(payment.paymentDate).toLocaleDateString(), 
      sortable: true 
    }
  ];

  const clearFilters = () => {
    setPatientFilter('');
    setMedicalCenterFilter('');
    setYearFilter('');
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900 flex items-center">
            <Filter className="h-5 w-5 mr-2 text-gray-500" />
            Filter Payments
          </h3>
          {(patientFilter || medicalCenterFilter || yearFilter) && (
            <button 
              onClick={clearFilters}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              Clear All Filters
            </button>
          )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Patient</label>
            <select
              value={patientFilter}
              onChange={(e) => setPatientFilter(e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border px-3 py-2"
            >
              <option value="">All Patients</option>
              {uniquePatients.map(patient => (
                <option key={patient} value={patient}>{patient}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Medical Center</label>
            <select
              value={medicalCenterFilter}
              onChange={(e) => setMedicalCenterFilter(e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border px-3 py-2"
            >
              <option value="">All Medical Centers</option>
              {uniqueMedicalCenters.map(center => (
                <option key={center} value={center}>{center}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
            <select
              value={yearFilter}
              onChange={(e) => setYearFilter(e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border px-3 py-2"
            >
              <option value="">All Years</option>
              {uniqueYears.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Summary Card */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center">
          <div>
            <h3 className="text-lg font-medium text-gray-900">Payment Summary</h3>
            <p className="text-sm text-gray-600 mt-1">
              {filteredPayments.length} payment{filteredPayments.length !== 1 ? 's' : ''} found
            </p>
          </div>
          <div className="mt-3 md:mt-0 bg-white px-4 py-2 rounded-md border border-blue-200 shadow-sm">
            <p className="text-sm text-gray-600">Total Amount</p>
            <p className="text-2xl font-bold text-blue-700">
              {totalAmount.toLocaleString()} LKR
            </p>
          </div>
        </div>
      </div>

      {/* Payment Table */}
      <Table 
        columns={columns} 
        data={filteredPayments} 
        keyField="paymentId" 
        title="Payment Records" 
        searchable 
        emptyMessage="No payments found matching your filters"
        itemsPerPage={15}
      />
    </div>
  );
};

// Tabs Components
const Tabs: React.FC<{ value: string; onValueChange: (value: string) => void; className?: string; children: React.ReactNode }> = ({ 
  value, onValueChange, className, children 
}) => (
  <div className={className}>{children}</div>
);

const TabsList: React.FC<{ className?: string; children: React.ReactNode }> = ({ className, children }) => (
  <div className={`flex space-x-1 rounded-lg bg-gray-100 p-1 ${className || ''}`}>
    {children}
  </div>
);

const TabsTrigger: React.FC<{ value: string; children: React.ReactNode }> = ({ value, children }) => {
  const tabsContext = React.useContext(TabsContext);
  return (
    <button
      onClick={() => tabsContext?.onValueChange(value)}
      className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-all ${
        tabsContext?.value === value 
          ? 'bg-white text-gray-900 shadow-sm' 
          : 'text-gray-600 hover:text-gray-900'
      }`}
    >
      {children}
    </button>
  );
};

const TabsContent: React.FC<{ value: string; className?: string; children: React.ReactNode }> = ({ 
  value, className, children 
}) => {
  const tabsContext = React.useContext(TabsContext);
  if (tabsContext?.value !== value) return null;
  return <div className={className}>{children}</div>;
};

const TabsContext = React.createContext<{ value: string; onValueChange: (value: string) => void } | null>(null);

// Simple Table Component with Pagination
const Table: React.FC<{
  columns: any[];
  data: any[];
  keyField: string;
  title?: string;
  searchable?: boolean;
  emptyMessage?: string;
  itemsPerPage?: number;
}> = ({ columns, data, keyField, title, searchable, emptyMessage, itemsPerPage = 10 }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const filteredData = useMemo(() => {
    if (!searchTerm) return data;
    return data.filter(item =>
      Object.values(item).some(value =>
        String(value).toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [data, searchTerm]);

  const sortedData = useMemo(() => {
    if (!sortConfig) return filteredData;
    
    return [...filteredData].sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];
      
      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredData, sortConfig]);

  // Pagination calculations
  const totalItems = sortedData.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedData = sortedData.slice(startIndex, endIndex);

  // Reset to first page when search term changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const handleSort = (key: string) => {
    setSortConfig(current => ({
      key,
      direction: current?.key === key && current.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      const start = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
      const end = Math.min(totalPages, start + maxVisiblePages - 1);
      
      if (start > 1) {
        pages.push(1);
        if (start > 2) pages.push('...');
      }
      
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      
      if (end < totalPages) {
        if (end < totalPages - 1) pages.push('...');
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  return (
    <div className="bg-white shadow-sm rounded-lg overflow-hidden">
      {(title || searchable) && (
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            {title && <h3 className="text-lg font-medium text-gray-900">{title}</h3>}
            {searchable && (
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            )}
          </div>
        </div>
      )}
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((column, index) => (
                <th
                  key={index}
                  onClick={() => column.sortable && handleSort(column.accessor)}
                  className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${
                    column.sortable ? 'cursor-pointer hover:bg-gray-100' : ''
                  }`}
                >
                  {column.header}
                  {column.sortable && sortConfig?.key === column.accessor && (
                    <span className="ml-1">
                      {sortConfig.direction === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {paginatedData.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-6 py-12 text-center text-gray-500">
                  {emptyMessage || 'No data available'}
                </td>
              </tr>
            ) : (
              paginatedData.map((item) => (
                <tr key={item[keyField]} className="hover:bg-gray-50">
                  {columns.map((column, index) => (
                    <td key={index} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {typeof column.accessor === 'function' 
                        ? column.accessor(item) 
                        : item[column.accessor]
                      }
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      
      {/* Pagination */}
      {totalPages > 1 && (
        <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
          <div className="flex items-center justify-between">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
            
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing <span className="font-medium">{startIndex + 1}</span> to{' '}
                  <span className="font-medium">{Math.min(endIndex, totalItems)}</span> of{' '}
                  <span className="font-medium">{totalItems}</span> results
                </p>
              </div>
              
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                  <button
                    onClick={() => goToPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="sr-only">Previous</span>
                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </button>
                  
                  {getPageNumbers().map((page, index) => (
                    <React.Fragment key={index}>
                      {page === '...' ? (
                        <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                          ...
                        </span>
                      ) : (
                        <button
                          onClick={() => goToPage(page as number)}
                          className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                            currentPage === page
                              ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                              : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                          }`}
                        >
                          {page}
                        </button>
                      )}
                    </React.Fragment>
                  ))}
                  
                  <button
                    onClick={() => goToPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="sr-only">Next</span>
                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                  </button>
                </nav>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentDashboard;