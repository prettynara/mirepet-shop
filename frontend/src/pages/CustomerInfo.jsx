import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

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

  const onSubmitHandler = (e) => {
    e.preventDefault();

    const finalPets = pets.map((pet) => ({
      ...pet,
      petType: pet.petType === 'Etc' ? pet.customType : pet.petType,
    }));

    console.log('고객 추가정보:', finalPets);
    navigate('/');
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
