import React from 'react';

const CommentManage: React.FC = () => {
    return (
        <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-semibold text-gray-800">
            Patient Management
          </h1>
        </div>


        <p className="text-gray-600">
          Manage patient comments and feedback here. This section allows you to view, edit, and delete patient comments.
          </p>
        </div>
    );
};

export default CommentManage;