import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const API_BASE = 'http://localhost:4000';

const CustomerInfo = () => {
  const [pets, setPets] = useState([
    { petName: '', petType: '', customType: '', petBirthDate: '' }
  ]);

  const navigate = useNavigate();

  const handlePetChange = (index, field, value) => {
    const updatedPets = [...pets];
    updatedPets[index][field] = value;
    setPets(updatedPets);
  };

  const addPet = () => {
    setPets([...pets, { petName: '', petType: '', customType: '', petBirthDate: '' }]);
  };

  const removePet = (index) => {
    const updatedPets = pets.filter((_, i) => i !== index);
    setPets(updatedPets);
  };

  const onSubmitHandler = async (e) => {
    e.preventDefault();

    // normalize pet shape to backend schema: { name, type, breed, dob, photo }
    const finalPets = pets.map((pet) => ({
      name: pet.petName || '',
      type: pet.petType === 'Etc' ? (pet.customType || '') : (pet.petType || ''),
      breed: '', // no breed field in this form, keep empty
      dob: pet.petBirthDate || null,
      photo: '' // optional: can be filled later in profile
    }));

    console.log('Final pets data:', finalPets);

    try {
      // get client id and token
      let clientId = null;
      try {
        const stored = JSON.parse(localStorage.getItem('user'));
        if (stored && stored._id) clientId = stored._id;
        console.log('clientId from localStorage:', clientId);
      } catch (err) { 
        console.warn('Failed to parse user from localStorage', err);
      }

      // fallback: call /api/me if no user in localStorage
      if (!clientId) {
        const token = localStorage.getItem('token');
        console.log('Token:', token ? 'exists' : 'missing');

        const meRes = await fetch(`${API_BASE}/api/users/me`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {})
          },
          credentials: 'include'
        });
        console.log('/api/users/me response stauts:', meRes.status);

        if (meRes.ok) {
          const meData = await meRes.json();
          console.log('/api/users/me response:', meData);

          if (meData?.user?._id) {
            clientId = meData.user._id;
            localStorage.setItem('user', JSON.stringify(meData.user));
            console.log('clientId from /api/users/me:', clientId);
          }
        } else {
          const errorData = await meRes.json().catch(() => null);
          console.error('/api/users/me failed:', meRes.status, errorData);
        }
      }

      if (!clientId) {
        alert('Unable to determine user. Please login and try again.');
        navigate('/login');
        return;
      }

      const token = localStorage.getItem('token');

      console.log(' Sending pet data to /api/users/client/' + clientId);
      console.log(' Payload:', {pets:finalPets});

      const res = await fetch(`${API_BASE}/api/users/client/${clientId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        credentials: 'include',
        body: JSON.stringify({ pets: finalPets })
      });

      console.log(' Response status:', res.status);
      const data = await res.json().catch(() => null);
      console.log(' Response data:', data);

      if (res.ok && data?.success) {
        // update local user cache if server returned updated client
        if (data.client) {
          localStorage.setItem('user', JSON.stringify(data.client));
          console.log('Updated localStorage with pets:', data.client.pets);
        }
        alert('Pet information saved.');
        navigate('/');
      } else {
        console.error('Save pets failed:', res.status, data);
        alert(data?.message || 'Failed to save pet information.');
      }
    } catch (err) {
      console.error('Error saving pets:', err);
      alert('Network or server error while saving pet info.');
    }
  };

  return (
    <form
      onSubmit={onSubmitHandler}
      className="flex flex-col items-center w-[90%] sm:max-w-2xl m-auto mt-16 gap-8 text-gray-800 bg-gradient-to-br from-blue-50 to-indigo-100 p-10 rounded-3xl shadow-xl"
    >
      <h2 className="text-3xl font-bold text-indigo-700 mb-4">🐾 Customer's Pet Information</h2>
      <p className="text-gray-500 text-center mb-6">
        Please fill out your pet’s details below. You can add more pets if needed.
      </p>

      {pets.map((pet, index) => (
        <div
          key={index}
          className="w-full bg-white border border-gray-200 p-6 rounded-2xl shadow-sm hover:shadow-md transition relative"
        >
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-700">🐶 Pet {index + 1}</h3>
            {pets.length > 1 && (
              <button
                type="button"
                onClick={() => removePet(index)}
                className="text-red-500 text-sm font-medium hover:underline"
              >
                Remove
              </button>
            )}
          </div>

          <div className="flex flex-col gap-4">
            <input
              type="text"
              placeholder="Pet Name"
              value={pet.petName}
              onChange={(e) => handlePetChange(index, 'petName', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 outline-none transition"
            />

            <select
              value={pet.petType}
              onChange={(e) => handlePetChange(index, 'petType', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 outline-none transition"
            >
              <option value="">Select Pet Type</option>
              <option value="Dog">Dog</option>
              <option value="Cat">Cat</option>
              <option value="Bird">Bird</option>
              <option value="Fish">Fish</option>
              <option value="Etc">Other</option>
            </select>

            {pet.petType === 'Etc' && (
              <input
                type="text"
                placeholder="Enter Pet Type"
                value={pet.customType}
                onChange={(e) => handlePetChange(index, 'customType', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 outline-none transition"
              />
            )}

            <label className="text-gray-600 font-medium">
              Birth Date
              <input
                type="date"
                value={pet.petBirthDate}
                onChange={(e) => handlePetChange(index, 'petBirthDate', e.target.value)}
                className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 outline-none transition"
              />
            </label>
          </div>
        </div>
      ))}

      <div className="flex gap-4 mt-4">
        <button
          type="button"
          onClick={addPet}
          className="bg-green-500 text-white px-5 py-2 rounded-xl shadow-md hover:bg-green-600 active:scale-95 transition-transform"
        >
          + Add Another Pet
        </button>

        <button
          type="submit"
          className="bg-indigo-600 text-white px-6 py-2 rounded-xl shadow-md hover:bg-indigo-700 active:scale-95 transition-transform"
        >
          💾 Save & Continue
        </button>
      </div>
    </form>
  );
};

export default CustomerInfo;
