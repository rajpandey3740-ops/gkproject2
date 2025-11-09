import React, { useState, useEffect } from 'react';
import { Address } from '../types';

interface AddressModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddressSelect: (address: Address) => void;
  selectedAddress: Address | null;
}

const AddressModal: React.FC<AddressModalProps> = ({
  isOpen,
  onClose,
  onAddressSelect,
  selectedAddress
}) => {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  
  // Form state
  const [addressType, setAddressType] = useState('home');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [pin, setPin] = useState('');
  const [state, setState] = useState('');
  const [isDefault, setIsDefault] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const savedAddresses = localStorage.getItem('addresses');
      if (savedAddresses) {
        setAddresses(JSON.parse(savedAddresses));
      }
    }
  }, [isOpen]);

  useEffect(() => {
    if (editingAddress) {
      setAddressType(editingAddress.type);
      setName(editingAddress.name);
      setPhone(editingAddress.phone);
      setStreet(editingAddress.street);
      setCity(editingAddress.city);
      setPin(editingAddress.pin);
      setState(editingAddress.state);
      setIsDefault(editingAddress.isDefault);
      setShowForm(true);
    } else if (showForm) {
      // Reset form when creating new address
      setAddressType('home');
      setName('');
      setPhone('');
      setStreet('');
      setCity('');
      setPin('');
      setState('');
      setIsDefault(false);
    }
  }, [editingAddress, showForm]);

  if (!isOpen) return null;

  const handleSaveAddress = () => {
    if (!name || !phone || !street || !city || !pin || !state) {
      alert('Please fill in all required fields');
      return;
    }

    const newAddress: Address = {
      type: addressType,
      name,
      phone,
      street,
      city,
      pin,
      state,
      isDefault
    };

    let updatedAddresses: Address[];
    
    if (editingAddress) {
      // Update existing address
      updatedAddresses = addresses.map(addr => 
        addr === editingAddress ? newAddress : addr
      );
    } else {
      // Add new address
      updatedAddresses = [...addresses, newAddress];
    }

    // If this is set as default, unset others
    if (isDefault) {
      updatedAddresses = updatedAddresses.map(addr => ({
        ...addr,
        isDefault: addr === newAddress
      }));
    }

    setAddresses(updatedAddresses);
    localStorage.setItem('addresses', JSON.stringify(updatedAddresses));
    
    // Reset form and close
    resetForm();
    setShowForm(false);
    setEditingAddress(null);
  };

  const handleDeleteAddress = (addressToDelete: Address) => {
    if (window.confirm('Are you sure you want to delete this address?')) {
      const updatedAddresses = addresses.filter(addr => addr !== addressToDelete);
      setAddresses(updatedAddresses);
      localStorage.setItem('addresses', JSON.stringify(updatedAddresses));
      
      // If we deleted the selected address, clear selection
      if (selectedAddress === addressToDelete) {
        onAddressSelect(null as any);
      }
    }
  };

  const resetForm = () => {
    setAddressType('home');
    setName('');
    setPhone('');
    setStreet('');
    setCity('');
    setPin('');
    setState('');
    setIsDefault(false);
  };

  const handleAddNew = () => {
    setEditingAddress(null);
    setShowForm(true);
  };

  const handleEditAddress = (address: Address) => {
    setEditingAddress(address);
  };

  const handleSelectAddress = (address: Address) => {
    onAddressSelect(address);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 overflow-y-auto">
      <div className="min-h-screen px-4 flex items-center justify-center">
        <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
          <div className="p-6 border-b flex justify-between items-center bg-gradient-to-r from-purple-600 to-pink-600 text-white">
            <h2 className="text-2xl font-bold">
              {showForm ? (editingAddress ? 'Edit Address' : 'Add New Address') : 'Select Delivery Address'}
            </h2>
            <button onClick={onClose} className="text-white hover:text-gray-200">
              <i className="fas fa-times text-2xl"></i>
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-6">
            {showForm ? (
              // Address Form
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-gray-700 font-semibold mb-2">Address Type</label>
                    <select
                      value={addressType}
                      onChange={(e) => setAddressType(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      <option value="home">Home</option>
                      <option value="work">Work</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-gray-700 font-semibold mb-2">Full Name *</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Enter full name"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-gray-700 font-semibold mb-2">Phone Number *</label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Enter phone number"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-gray-700 font-semibold mb-2">Street Address *</label>
                    <input
                      type="text"
                      value={street}
                      onChange={(e) => setStreet(e.target.value)}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Enter street address"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-gray-700 font-semibold mb-2">City *</label>
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Enter city"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-gray-700 font-semibold mb-2">PIN Code *</label>
                    <input
                      type="text"
                      value={pin}
                      onChange={(e) => setPin(e.target.value)}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Enter PIN code"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-gray-700 font-semibold mb-2">State *</label>
                    <input
                      type="text"
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Enter state"
                    />
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="address-default"
                      checked={isDefault}
                      onChange={(e) => setIsDefault(e.target.checked)}
                      className="w-5 h-5 text-purple-600 rounded"
                    />
                    <label htmlFor="address-default" className="ml-2 text-gray-700 font-semibold">
                      Set as default address
                    </label>
                  </div>
                </div>
                
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => {
                      setShowForm(false);
                      setEditingAddress(null);
                    }}
                    className="flex-1 bg-gray-200 text-gray-800 py-3 rounded-xl font-semibold hover:bg-gray-300 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveAddress}
                    className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-xl font-semibold hover:opacity-90 transition-all"
                  >
                    Save Address
                  </button>
                </div>
              </div>
            ) : (
              // Address List
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-bold text-gray-800">Your Addresses</h3>
                  <button
                    onClick={handleAddNew}
                    className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 rounded-xl font-semibold hover:opacity-90 transition-all flex items-center gap-2"
                  >
                    <i className="fas fa-plus"></i>
                    Add New
                  </button>
                </div>
                
                {addresses.length === 0 ? (
                  <div className="text-center py-10">
                    <i className="fas fa-map-marker-alt text-gray-300 text-4xl mb-4"></i>
                    <p className="text-gray-500 mb-4">You haven't added any addresses yet</p>
                    <button
                      onClick={handleAddNew}
                      className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-xl font-semibold hover:opacity-90 transition-all"
                    >
                      Add Your First Address
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {addresses.map((address, index) => (
                      <div
                        key={index}
                        className={`border-2 rounded-2xl p-4 cursor-pointer transition-all ${
                          selectedAddress === address
                            ? 'border-purple-500 bg-purple-50'
                            : 'border-gray-200 hover:border-purple-300'
                        }`}
                        onClick={() => handleSelectAddress(address)}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs font-semibold">
                                {address.type}
                              </span>
                              {address.isDefault && (
                                <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-semibold">
                                  Default
                                </span>
                              )}
                            </div>
                            <p className="font-bold text-gray-800">{address.name}</p>
                            <p className="text-sm text-gray-600">{address.phone}</p>
                            <p className="text-sm text-gray-700 mt-1">
                              {address.street}, {address.city}, {address.state} - {address.pin}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditAddress(address);
                              }}
                              className="text-gray-500 hover:text-purple-600"
                            >
                              <i className="fas fa-edit"></i>
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteAddress(address);
                              }}
                              className="text-gray-500 hover:text-red-600"
                            >
                              <i className="fas fa-trash"></i>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddressModal;