import React, { useState } from 'react';
import axios from 'axios'; // Make sure axios is installed
import toast from "react-hot-toast";

export default function CustomerFormModal({ show, onClose, onSave, currentUserId, productId }) {
  const [customerData, setCustomerData] = useState({
    name: '',
    email: '',
    phoneNumber: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCustomerData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const dataToSend = {
      ...customerData,
      soldBy: currentUserId, // Set soldBy to the current user ID
      soldProducts: productId // Set soldProducts to the selected product ID
    };
    
    setLoading(true);
    setError(null);

    try {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_BASE_URL_DEV}/customerInfo/createCustomer`, dataToSend);
      console.log('Customer saved:', response.data);
      onSave('completed', productId);  
      // Clear form fields
      setCustomerData({ name: '', email: '', phoneNumber: '' });
      toast.success("Customer added successfully");

      onClose();
    } catch (error) {
      console.error('Error saving customer:', error);
      setError(error.response?.data?.message || 'Failed to save customer. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-96">
        <h2 className="text-lg font-bold mb-4">Enter Customer Details</h2>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700">Name</label>
            <input
              type="text"
              name="name"
              className="w-full p-2 border border-gray-300 rounded-md"
              value={customerData.name}
              onChange={handleChange}
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">Email</label>
            <input
              type="email"
              name="email"
              className="w-full p-2 border border-gray-300 rounded-md"
              value={customerData.email}
              onChange={handleChange}
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">Phone Number</label>
            <input
              type="text"
              name="phoneNumber"
              className="w-full p-2 border border-gray-300 rounded-md"
              value={customerData.phoneNumber}
              onChange={handleChange}
              required
            />
          </div>
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              className="bg-gray-500 text-white px-4 py-2 rounded-md"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-[#017082] text-white px-4 py-2 rounded-md"
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
