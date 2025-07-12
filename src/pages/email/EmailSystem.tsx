import React, { useState } from 'react';
import { SendIcon, TrashIcon, SaveIcon, PlusIcon, UserIcon } from 'lucide-react';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import { toast } from 'sonner';
interface Doctor {
  id: string;
  name: string;
  email: string;
  specialization: string;
}
interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
}
// Mock data for doctors
const mockDoctors: Doctor[] = [{
  id: '1',
  name: 'Dr. Sarah Johnson',
  email: 'sarah.johnson@example.com',
  specialization: 'Cardiology'
}, {
  id: '2',
  name: 'Dr. Michael Chen',
  email: 'michael.chen@example.com',
  specialization: 'Neurology'
}, {
  id: '3',
  name: 'Dr. Emily Rodriguez',
  email: 'emily.rodriguez@example.com',
  specialization: 'Pediatrics'
}, {
  id: '4',
  name: 'Dr. James Wilson',
  email: 'james.wilson@example.com',
  specialization: 'Orthopedics'
}, {
  id: '5',
  name: 'Dr. Lisa Patel',
  email: 'lisa.patel@example.com',
  specialization: 'Dermatology'
}];
// Mock data for email templates
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
const EmailSystem: React.FC = () => {
  const [selectedDoctors, setSelectedDoctors] = useState<string[]>([]);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [showDoctorSelector, setShowDoctorSelector] = useState(false);
  const [showTemplateSelector, setShowTemplateSelector] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const handleSelectDoctor = (doctorId: string) => {
    if (selectedDoctors.includes(doctorId)) {
      setSelectedDoctors(selectedDoctors.filter(id => id !== doctorId));
    } else {
      setSelectedDoctors([...selectedDoctors, doctorId]);
    }
  };
  const handleSelectAllDoctors = () => {
    if (selectedDoctors.length === mockDoctors.length) {
      setSelectedDoctors([]);
    } else {
      setSelectedDoctors(mockDoctors.map(doctor => doctor.id));
    }
  };
  const handleApplyTemplate = (template: EmailTemplate) => {
    setSubject(template.subject);
    setMessage(template.body);
    setShowTemplateSelector(false);
  };
  const handleSendEmail = () => {
    if (selectedDoctors.length === 0) {
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
    // Simulate sending email
    setTimeout(() => {
      setIsSending(false);
      toast.success(`Email sent to ${selectedDoctors.length} recipient${selectedDoctors.length > 1 ? 's' : ''}`);
      // Reset form
      setSelectedDoctors([]);
      setSubject('');
      setMessage('');
    }, 2000);
  };
  const filteredDoctors = searchTerm ? mockDoctors.filter(doctor => doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) || doctor.specialization.toLowerCase().includes(searchTerm.toLowerCase())) : mockDoctors;
  const getSelectedDoctorsText = () => {
    if (selectedDoctors.length === 0) {
      return 'No recipients selected';
    } else if (selectedDoctors.length === mockDoctors.length) {
      return 'All doctors selected';
    } else {
      return `${selectedDoctors.length} recipient${selectedDoctors.length > 1 ? 's' : ''} selected`;
    }
  };
  const applyDoctorNames = () => {
    if (selectedDoctors.length === 1) {
      const doctor = mockDoctors.find(d => d.id === selectedDoctors[0]);
      if (doctor) {
        return message.replace(/\[Doctor Name\]/g, doctor.name.split(' ')[1]);
      }
    }
    return message;
  };
  return <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-800">Email System</h1>
      </div>
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b">
          <h2 className="text-lg font-medium text-gray-900">Compose Email</h2>
        </div>
        <div className="p-6 space-y-6">
          {/* Recipients */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              To:
            </label>
            <div className="flex items-center">
              <div className="flex-1 min-h-[38px] p-2 border border-gray-300 rounded-md bg-gray-50 cursor-pointer" onClick={() => setShowDoctorSelector(true)}>
                {selectedDoctors.length > 0 ? <div className="flex flex-wrap gap-1">
                    {selectedDoctors.map(doctorId => {
                  const doctor = mockDoctors.find(d => d.id === doctorId);
                  return doctor ? <span key={doctor.id} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {doctor.name}
                        </span> : null;
                })}
                  </div> : <span className="text-gray-500">
                    Click to select recipients
                  </span>}
              </div>
              <Button variant="outline" className="ml-2" onClick={() => setShowDoctorSelector(true)}>
                <PlusIcon className="h-5 w-5" />
              </Button>
            </div>
            <p className="mt-1 text-xs text-gray-500">
              {getSelectedDoctorsText()}
            </p>
          </div>
          {/* Subject */}
          <div>
            <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
              Subject:
            </label>
            <div className="flex">
              <input type="text" id="subject" value={subject} onChange={e => setSubject(e.target.value)} className="flex-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm" placeholder="Enter email subject" />
              <Button variant="outline" className="ml-2" onClick={() => setShowTemplateSelector(true)}>
                <SaveIcon className="h-5 w-5" />
              </Button>
            </div>
          </div>
          {/* Message */}
          <div>
            <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
              Message:
            </label>
            <textarea id="message" rows={10} value={message} onChange={e => setMessage(e.target.value)} className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm" placeholder="Enter your message here..." />
            <p className="mt-1 text-xs text-gray-500">
              Use [Doctor Name] to automatically insert the doctor's name
            </p>
          </div>
          {/* Preview */}
          {selectedDoctors.length === 1 && message.includes('[Doctor Name]') && <div className="border rounded-md p-4 bg-gray-50">
                <h3 className="text-sm font-medium text-gray-700 mb-2">
                  Preview:
                </h3>
                <div className="text-sm whitespace-pre-wrap">
                  {applyDoctorNames()}
                </div>
              </div>}
          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button variant="outline" icon={<TrashIcon className="h-5 w-5" />} onClick={() => {
            setSelectedDoctors([]);
            setSubject('');
            setMessage('');
          }}>
              Clear
            </Button>
            <Button variant="primary" icon={<SendIcon className="h-5 w-5" />} onClick={handleSendEmail} isLoading={isSending} disabled={selectedDoctors.length === 0 || !subject.trim() || !message.trim()}>
              Send Email
            </Button>
          </div>
        </div>
      </div>
      {/* Doctor Selection Modal */}
      <Modal isOpen={showDoctorSelector} onClose={() => setShowDoctorSelector(false)} title="Select Recipients" size="lg">
        <div className="space-y-4">
          {/* Search */}
          <div>
            <input type="text" placeholder="Search by name or specialization..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm" />
          </div>
          {/* Select All */}
          <div className="flex items-center">
            <input id="select-all" type="checkbox" className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" checked={selectedDoctors.length === mockDoctors.length} onChange={handleSelectAllDoctors} />
            <label htmlFor="select-all" className="ml-2 text-sm text-gray-700">
              Select All
            </label>
          </div>
          {/* Doctor List */}
          <div className="max-h-96 overflow-y-auto border rounded-md">
            {filteredDoctors.length > 0 ? <ul className="divide-y divide-gray-200">
                {filteredDoctors.map(doctor => <li key={doctor.id} className="p-4 hover:bg-gray-50">
                    <div className="flex items-center">
                      <input type="checkbox" id={`doctor-${doctor.id}`} className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" checked={selectedDoctors.includes(doctor.id)} onChange={() => handleSelectDoctor(doctor.id)} />
                      <label htmlFor={`doctor-${doctor.id}`} className="ml-3 flex-1 cursor-pointer">
                        <div className="flex items-center">
                          <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                            <UserIcon className="h-6 w-6 text-blue-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {doctor.name}
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
                  </li>)}
              </ul> : <div className="p-4 text-center text-gray-500">
                No doctors found matching your search
              </div>}
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
      {/* Template Selection Modal */}
      <Modal isOpen={showTemplateSelector} onClose={() => setShowTemplateSelector(false)} title="Email Templates" size="md">
        <div className="space-y-4">
          <p className="text-sm text-gray-500">
            Select a template to use as a starting point for your email.
          </p>
          <div className="max-h-96 overflow-y-auto">
            {mockTemplates.map(template => <div key={template.id} className="mb-4 border rounded-md p-4 hover:bg-gray-50 cursor-pointer" onClick={() => handleApplyTemplate(template)}>
                <h3 className="font-medium">{template.name}</h3>
                <p className="text-sm text-gray-700 mt-1">{template.subject}</p>
                <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                  {template.body}
                </p>
              </div>)}
          </div>
          <div className="flex justify-end pt-4 border-t">
            <Button variant="outline" onClick={() => setShowTemplateSelector(false)}>
              Cancel
            </Button>
          </div>
        </div>
      </Modal>
    </div>;
};
export default EmailSystem;