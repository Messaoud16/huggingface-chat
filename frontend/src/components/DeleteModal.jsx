import { FaTrash } from "react-icons/fa";

export const DeleteModal = ({
  showDeleteModal,
  deleteAction,
  onConfirm,
  onCancel
}) => {
  if (!showDeleteModal) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4 shadow-xl">
        <div className="flex items-center mb-4">
          <div className="bg-red-100 p-2 rounded-full mr-3">
            <FaTrash className="text-red-600" size={20} />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">
            {deleteAction === 'all' ? 'Clear All Chats' : 'Delete Chat'}
          </h3>
        </div>
        <p className="text-gray-600 mb-6">
          {deleteAction === 'all'
            ? 'Are you sure you want to delete all chat history? This action cannot be undone.'
            : 'Are you sure you want to delete this chat? This action cannot be undone.'
          }
        </p>
        <div className="flex space-x-3">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-2 text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};
