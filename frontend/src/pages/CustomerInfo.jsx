import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const CustomerInfo = () => {
  const [pets, setPets] = useState([
    { petName: '', petType: '', customType: '', petAge: '' }
  ]);

  const navigate = useNavigate();

  const handlePetChange = (index, field, value) => {
    const updatedPets = [...pets];
    updatedPets[index][field] = value;
    setPets(updatedPets);
  };

  const addPet = () => {
    setPets([...pets, { petName: '', petType: '', customType: '', petAge: '' }]);
  };

  const removePet = (index) => {
    const updatedPets = pets.filter((_, i) => i !== index);
    setPets(updatedPets);
  };

  const onSubmitHandler = (e) => {
    e.preventDefault();

    // 최종 petType 결정 (Etc 선택 시 customType 값 사용)
    const finalPets = pets.map((pet) => ({
      ...pet,
      petType: pet.petType === 'Etc' ? pet.customType : pet.petType,
    }));

    console.log('고객 추가정보:', finalPets);
    // 👉 백엔드 저장 로직 들어갈 부분

    // 저장 후 메인(Home)으로 이동
    navigate('/');
  };

  return (
    <form
      onSubmit={onSubmitHandler}
      className="flex flex-col items-center w-[90%] sm:max-w-md m-auto mt-20 gap-5 text-gray-800 bg-white p-8 rounded-xl shadow-md"
    >
      <h2 className="text-2xl font-semibold mb-6">Customer Info</h2>

      {pets.map((pet, index) => (
        <div key={index} className="w-full border p-4 rounded-lg mb-4 relative">
          <h3 className="text-lg font-medium mb-2">Pet {index + 1}</h3>

          <input
            type="text"
            placeholder="Pet Name"
            value={pet.petName}
            onChange={(e) => handlePetChange(index, 'petName', e.target.value)}
            className="w-full px-4 py-2 mb-3 border border-gray-300 rounded-lg"
          />

          <select
            value={pet.petType}
            onChange={(e) => handlePetChange(index, 'petType', e.target.value)}
            className="w-full px-4 py-2 mb-3 border border-gray-300 rounded-lg"
          >
            <option value="">Select Pet Type</option>
            <option value="Dog">Dog</option>
            <option value="Cat">Cat</option>
            <option value="Bird">Bird</option>
            <option value="Fish">Fish</option>
            <option value="Etc">Etc</option>
          </select>

          {/* Etс 선택 시 직접 입력 필드 */}
          {pet.petType === 'Etc' && (
            <input
              type="text"
              placeholder="Enter Pet Type"
              value={pet.customType}
              onChange={(e) => handlePetChange(index, 'customType', e.target.value)}
              className="w-full px-4 py-2 mb-3 border border-gray-300 rounded-lg"
            />
          )}

          <input
            type="number"
            placeholder="Pet Age"
            value={pet.petAge}
            onChange={(e) => handlePetChange(index, 'petAge', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
          />

          {pets.length > 1 && (
            <button
              type="button"
              onClick={() => removePet(index)}
              className="absolute top-2 right-2 text-red-500 text-sm"
            >
              Remove
            </button>
          )}
        </div>
      ))}

      <button
        type="button"
        onClick={addPet}
        className="bg-green-500 text-white px-4 py-2 rounded-lg shadow hover:bg-green-600 transition"
      >
        + Add Another Pet
      </button>

      <button
        type="submit"
        className="bg-blue-500 text-white px-6 py-2 rounded-lg mt-4 hover:bg-blue-600 transition"
      >
        Save & Continue
      </button>
    </form>
  );
};

export default CustomerInfo;
