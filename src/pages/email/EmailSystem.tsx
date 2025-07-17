import React, { useState, useEffect } from 'react';
import { SendIcon, TrashIcon, SaveIcon, PlusIcon, UserIcon } from 'lucide-react';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import { toast } from 'sonner';
import emailjs from '@emailjs/browser';

interface Doctor {
  id: number;
  fullName: string;
  email: string;
  specialization: string;
  uniqId: string;
}

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
}

interface SendOption {
  id: string;
  label: string;
  description: string;
}

const mockTemplates: EmailTemplate[] = [{
  id: '1',
  name: 'Schedule Update',
  subject: 'Important: Schedule Update',
  body: 'Dear [Doctor Name],\n\nThis is to inform you that your schedule has been updated for the upcoming week. Please log in to your account to view the changes.\n\nBest regards,\nAdmin Team'
}, {
  id: '2',
  name: 'Meeting Invitation',
  subject: 'Invitation: Monthly Staff Meeting',
  body: 'Dear [Doctor Name],\n\nYou are invited to attend our monthly staff meeting on [Date] at [Time] in [Location].\n\nAgenda items:\n- Updates from management\n- Discussion of new policies\n- Q&A session\n\nYour attendance is appreciated.\n\nBest regards,\nAdmin Team'
}, {
  id: '3',
  name: 'Holiday Notice',
  subject: 'Holiday Schedule Notice',
  body: 'Dear [Doctor Name],\n\nThis is a reminder that our facility will be closed on [Date] for the upcoming holiday. Please ensure your patients are informed of this closure.\n\nRegular hours will resume on [Next Working Date].\n\nBest regards,\nAdmin Team'
}];

const serviceId = 'service_2se5ola';
const templateId = 'template_lvvnmbk';
const publicKey = 'yANI-VFKL_zC4IL0f';

const EmailSystem: React.FC = () => {
  const [selectedDoctors, setSelectedDoctors] = useState<string[]>([]);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [showDoctorSelector, setShowDoctorSelector] = useState(false);
  const [showTemplateSelector, setShowTemplateSelector] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [isLoadingDoctors, setIsLoadingDoctors] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [emailjsInitialized, setEmailjsInitialized] = useState(false);
  const [sendOption, setSendOption] = useState<string>('selected');

  useEffect(() => {
    try {
      emailjs.init(publicKey);
      setEmailjsInitialized(true);
      console.log('EmailJS initialized successfully');
    } catch (error) {
      console.error('Failed to initialize EmailJS:', error);
      toast.error('Failed to initialize email service');
    }
  }, []);

  useEffect(() => {
    const fetchDoctors = async () => {
      setIsLoadingDoctors(true);
      setError(null);
      try {
        const token = localStorage.getItem('jwt');
        if (!token) {
          throw new Error('No authentication token found');
        }

        const response = await fetch('http://localhost:8080/api/v1/doctor/getDoctors', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          if (response.status === 401) {
            throw new Error('Unauthorized - Please login again');
          }
          throw new Error('Failed to fetch doctors');
        }

        const data = await response.json();
        if (data.code === 200 && data.data) {
          setDoctors(data.data);
        } else {
          throw new Error(data.message || 'Failed to fetch doctors');
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
        setError(errorMessage);
        toast.error(`Failed to load doctors: ${errorMessage}`);
      } finally {
        setIsLoadingDoctors(false);
      }
    };

    fetchDoctors();
  }, []);

  useEffect(() => {
    console.log('Selected doctors updated:', selectedDoctors);
  }, [selectedDoctors]);

  const handleSelectDoctor = (doctorId: string) => {
    setSelectedDoctors(prev => {
      if (prev.includes(doctorId)) {
        return prev.filter(id => id !== doctorId);
      } else {
        return [...prev, doctorId];
      }
    });
  };

  const handleSelectAllDoctors = () => {
    setSelectedDoctors(prev => {
      if (prev.length === doctors.length) {
        return [];
      } else {
        return doctors.map(doctor => doctor.uniqId);
      }
    });
  };

  const handleApplyTemplate = (template: EmailTemplate) => {
    setSubject(template.subject);
    setMessage(template.body);
    setShowTemplateSelector(false);
  };

  const sendEmailToDoctor = async (doctor: Doctor) => {
    try {
      if (!emailjsInitialized) {
        throw new Error('EmailJS not initialized');
      }

      const personalizedMessage = message.replace(/\[Doctor Name\]/g, doctor.fullName);

      const templateParams = {
        name: doctor.fullName,
        message: personalizedMessage,
        time: new Date().toLocaleString(),
        to_email: doctor.email,
        title: subject,
      };

      console.log('Sending email to:', doctor.fullName, 'at', doctor.email);
      const result = await emailjs.send(serviceId, templateId, templateParams, publicKey);
      console.log(result)
      console.log('Email sent successfully to', doctor.email);
      return true;
    } catch (error) {
      console.error('Failed to send email to', doctor.email, error);
      return false;
    }
  };

  const handleSendEmail = async () => {
    console.log('Sending email with options:', {
      sendOption,
      selectedDoctors,
      subject,
      message
    });

    if (!emailjsInitialized) {
      toast.error('Email service not initialized. Please refresh the page.');
      return;
    }

    if (sendOption === 'selected' && selectedDoctors.length === 0) {
      toast.error('Please select at least one recipient');
      return;
    }
    if (!subject.trim()) {
      toast.error('Please enter a subject');
      return;
    }
    if (!message.trim()) {
      toast.error('Please enter a message');
      return;
    }

    setIsSending(true);
    let successCount = 0;
    let failedCount = 0;

    const doctorsToEmail = sendOption === 'all'
        ? doctors
        : doctors.filter(doctor => selectedDoctors.includes(doctor.uniqId));

    console.log('Doctors to email:', doctorsToEmail.map(d => d.fullName));

    for (const doctor of doctorsToEmail) {
      const result = await sendEmailToDoctor(doctor);
      if (result) {
        successCount++;
      } else {
        failedCount++;
      }

      if (doctorsToEmail.length > 1) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    setIsSending(false);

    if (failedCount === 0) {
      toast.success(`Successfully sent ${successCount} email${successCount > 1 ? 's' : ''}`);
    } else if (successCount === 0) {
      toast.error(`Failed to send all ${failedCount} emails`);
    } else {
      toast.warning(`Sent ${successCount} email${successCount > 1 ? 's' : ''}, failed to send ${failedCount}`);
    }

    if (failedCount === 0) {
      if (sendOption === 'selected') {
        setSelectedDoctors([]);
      }
      setSubject('');
      setMessage('');
    }
  };

  const filteredDoctors = searchTerm
      ? doctors.filter(doctor =>
          doctor.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          doctor.specialization.toLowerCase().includes(searchTerm.toLowerCase()))
      : doctors;

  const getSelectedDoctorsText = () => {
    if (sendOption === 'all') return 'All doctors will receive this email';
    if (selectedDoctors.length === 0) return 'No recipients selected';
    if (selectedDoctors.length === doctors.length) return 'All doctors selected';
    return `${selectedDoctors.length} recipient${selectedDoctors.length > 1 ? 's' : ''} selected`;
  };

  const applyDoctorNames = () => {
    if (selectedDoctors.length === 1) {
      const doctor = doctors.find(d => d.uniqId === selectedDoctors[0]);
      if (doctor) {
        return message.replace(/\[Doctor Name\]/g, doctor.fullName);
      }
    }
    return message;
  };

  const sendOptions: SendOption[] = [
    {
      id: 'selected',
      label: 'Send to selected doctors only',
      description: 'Only doctors you have selected will receive this email'
    },
    {
      id: 'all',
      label: 'Send to all doctors',
      description: 'Every doctor in the system will receive this email'
    }
  ];

  return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-semibold text-gray-800">Email System</h1>
          <div className="flex items-center space-x-2">
            <div className={`h-2 w-2 rounded-full ${emailjsInitialized ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span className="text-sm text-gray-600">
            {emailjsInitialized ? 'Email service ready' : 'Email service not ready'}
          </span>
          </div>
        </div>
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b">
            <h2 className="text-lg font-medium text-gray-900">Compose Email</h2>
          </div>
          <div className="p-6 space-y-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Send Option:
              </label>
              <div className="space-y-2">
                {sendOptions.map((option) => (
                    <div key={option.id} className="flex items-start">
                      <div className="flex items-center h-5">
                        <input
                            id={`option-${option.id}`}
                            name="send-option"
                            type="radio"
                            className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300"
                            checked={sendOption === option.id}
                            onChange={() => setSendOption(option.id)}
                        />
                      </div>
                      <div className="ml-3 text-sm">
                        <label htmlFor={`option-${option.id}`} className="font-medium text-gray-700">
                          {option.label}
                        </label>
                        <p className="text-gray-500">{option.description}</p>
                      </div>
                    </div>
                ))}
              </div>
            </div>

            {sendOption === 'selected' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    To:
                  </label>
                  <div className="flex items-center">
                    <div className="flex-1 min-h-[38px] p-2 border border-gray-300 rounded-md bg-gray-50 cursor-pointer"
                         onClick={() => setShowDoctorSelector(true)}>
                      {selectedDoctors.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {selectedDoctors.map(doctorId => {
                              const doctor = doctors.find(d => d.uniqId === doctorId);
                              return doctor ? (
                                  <span key={doctor.uniqId} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {doctor.fullName}
                          </span>
                              ) : null;
                            })}
                          </div>
                      ) : (
                          <span className="text-gray-500">
                      Click to select recipients
                    </span>
                      )}
                    </div>
                    <Button variant="outline" className="ml-2" onClick={() => setShowDoctorSelector(true)}>
                      <PlusIcon className="h-5 w-5" />
                    </Button>
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    {getSelectedDoctorsText()}
                  </p>
                </div>
            )}

            <div>
              <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
                Subject:
              </label>
              <div className="flex">
                <input
                    type="text"
                    id="subject"
                    value={subject}
                    onChange={e => setSubject(e.target.value)}
                    className="flex-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    placeholder="Enter email subject"
                />
                <Button variant="outline" className="ml-2" onClick={() => setShowTemplateSelector(true)}>
                  <SaveIcon className="h-5 w-5" />
                </Button>
              </div>
            </div>

            <div>
              <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                Message:
              </label>
              <textarea
                  id="message"
                  rows={10}
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  placeholder="Enter your message here..."
              />
              <p className="mt-1 text-xs text-gray-500">
                Use [Doctor Name] to automatically insert the doctor's name
              </p>
            </div>

            {(sendOption === 'selected' && selectedDoctors.length === 1 && message.includes('[Doctor Name]')) && (
                <div className="border rounded-md p-4 bg-gray-50">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">
                    Preview:
                  </h3>
                  <div className="text-sm whitespace-pre-wrap">
                    {applyDoctorNames()}
                  </div>
                </div>
            )}

            <div className="flex justify-end space-x-3 pt-4 border-t">
              <Button
                  variant="outline"
                  icon={<TrashIcon className="h-5 w-5" />}
                  onClick={() => {
                    setSelectedDoctors([]);
                    setSubject('');
                    setMessage('');
                  }}
              >
                Clear
              </Button>
              <Button
                  variant="primary"
                  icon={<SendIcon className="h-5 w-5" />}
                  onClick={handleSendEmail}
                  isLoading={isSending}
                  disabled={
                      (sendOption === 'selected' && selectedDoctors.length === 0) ||
                      !subject.trim() ||
                      !message.trim() ||
                      !emailjsInitialized
                  }
              >
                Send Email
              </Button>
            </div>
          </div>
        </div>

        <Modal isOpen={showDoctorSelector} onClose={() => setShowDoctorSelector(false)} title="Select Recipients" size="lg">
          <div className="space-y-4">
            <div>
              <input
                  type="text"
                  placeholder="Search by name or specialization..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              />
            </div>
            <div className="flex items-center">
              <input
                  id="select-all"
                  type="checkbox"
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  checked={selectedDoctors.length === doctors.length && doctors.length > 0}
                  onChange={handleSelectAllDoctors}
                  disabled={doctors.length === 0}
              />
              <label htmlFor="select-all" className="ml-2 text-sm text-gray-700">
                Select All
              </label>
            </div>
            <div className="max-h-96 overflow-y-auto border rounded-md">
              {isLoadingDoctors ? (
                  <div className="p-4 text-center text-gray-500">Loading doctors...</div>
              ) : error ? (
                  <div className="p-4 text-center text-red-500">{error}</div>
              ) : filteredDoctors.length > 0 ? (
                  <ul className="divide-y divide-gray-200">
                    {filteredDoctors.map(doctor => (
                        <li key={doctor.uniqId} className="p-4 hover:bg-gray-50">
                          <div className="flex items-center">
                            <input
                                type="checkbox"
                                id={`doctor-${doctor.uniqId}`}
                                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                checked={selectedDoctors.includes(doctor.uniqId)}
                                onChange={() => handleSelectDoctor(doctor.uniqId)}
                            />
                            <label htmlFor={`doctor-${doctor.uniqId}`} className="ml-3 flex-1 cursor-pointer">
                              <div className="flex items-center">
                                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                                  <UserIcon className="h-6 w-6 text-blue-600" />
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-gray-900">
                                    {doctor.fullName}
                                  </p>
                                  <p className="text-sm text-gray-500">
                                    {doctor.specialization}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    {doctor.email}
                                  </p>
                                </div>
                              </div>
                            </label>
                          </div>
                        </li>
                    ))}
                  </ul>
              ) : (
                  <div className="p-4 text-center text-gray-500">
                    {doctors.length === 0 ? 'No doctors available' : 'No doctors found matching your search'}
                  </div>
              )}
            </div>
            <div className="flex justify-between items-center pt-4 border-t">
            <span className="text-sm text-gray-500">
              {selectedDoctors.length} recipient
              {selectedDoctors.length !== 1 ? 's' : ''} selected
            </span>
              <Button variant="primary" onClick={() => setShowDoctorSelector(false)}>
                Confirm Selection
              </Button>
            </div>
          </div>
        </Modal>

        <Modal isOpen={showTemplateSelector} onClose={() => setShowTemplateSelector(false)} title="Email Templates" size="md">
          <div className="space-y-4">
            <p className="text-sm text-gray-500">
              Select a template to use as a starting point for your email.
            </p>
            <div className="max-h-96 overflow-y-auto">
              {mockTemplates.map(template => (
                  <div
                      key={template.id}
                      className="mb-4 border rounded-md p-4 hover:bg-gray-50 cursor-pointer"
                      onClick={() => handleApplyTemplate(template)}
                  >
                    <h3 className="font-medium">{template.name}</h3>
                    <p className="text-sm text-gray-700 mt-1">{template.subject}</p>
                    <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                      {template.body}
                    </p>
                  </div>
              ))}
            </div>
            <div className="flex justify-end pt-4 border-t">
              <Button variant="outline" onClick={() => setShowTemplateSelector(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </Modal>
      </div>
  );
};

export default EmailSystem;