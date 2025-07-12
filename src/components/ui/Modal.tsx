import React, { Fragment } from 'react';
import { XIcon } from 'lucide-react';
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  footer?: React.ReactNode;
}
const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  footer
}) => {
  if (!isOpen) return null;
  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl'
  };
  return <Fragment>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex items-center justify-center p-4" onClick={onClose}>
        {/* Modal */}
        <div className={`bg-white rounded-lg shadow-xl overflow-hidden w-full ${sizeClasses[size]} z-50`} onClick={e => e.stopPropagation()}>
          {/* Header */}
          <div className="px-6 py-4 border-b flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">{title}</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-500 focus:outline-none">
              <XIcon className="h-5 w-5" />
            </button>
          </div>
          {/* Content */}
          <div className="px-6 py-4">{children}</div>
          {/* Footer */}
          {footer && <div className="px-6 py-3 bg-gray-50 border-t flex justify-end space-x-3">
              {footer}
            </div>}
        </div>
      </div>
    </Fragment>;
};
export default Modal;