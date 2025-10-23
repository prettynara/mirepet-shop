import React, { useEffect, useState } from "react";
import axios from "axios";

const ClientProfile = ({ clientId }) => {
  const [clientData, setClientData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
  });

  const [petData, setPetData] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);

  // 🚀 서버에서 데이터 불러오기
  useEffect(() => {
    const fetchClient = async () => {
      try {
        const res = await axios.get(`/api/client/${clientId}`);
        setClientData({
          name: res.data.name,
          email: res.data.email,
          phone: res.data.phone,
          address: res.data.address,
        });
        setPetData(res.data.pets || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchClient();
  }, [clientId]);

  // 고객 정보 변경
  const handleClientChange = (e) => {
    const { name, value } = e.target;
    setClientData({ ...clientData, [name]: value });
  };

  // 펫 정보 변경
  const handlePetChange = (index, field, value) => {
    const updatedPets = [...petData];
    updatedPets[index][field] = value;
    setPetData(updatedPets);
  };

  // 펫 사진 업로드
  const handlePetPhotoUpload = (index, file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      handlePetChange(index, "photo", reader.result);
    };
    reader.readAsDataURL(file);
  };

  // 펫 추가/삭제
  const handleAddPet = () => setPetData([...petData, { name: "", type: "", breed: "", dob: "", photo: "" }]);
  const handleRemovePet = (index) => setPetData(petData.filter((_, i) => i !== index));

  // 저장
  const handleSave = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`/api/client/${clientId}`, { ...clientData, pets: petData });
      setIsEditing(false);
      alert("Saved successfully!");
    } catch (err) {
      console.error(err);
      alert("Failed to save.");
    }
  };

  if (loading) return <p className="text-center mt-20 text-gray-600">Loading profile...</p>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex justify-center items-start py-16">
      <div className="w-full max-w-3xl bg-white/90 backdrop-blur-sm shadow-lg rounded-2xl p-10 border border-blue-100">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">🐶 Client Profile</h1>

        <form className="space-y-5" onSubmit={handleSave}>
          {/* 고객 정보 */}
          {["name", "phone", "address"].map((field, i) => (
            <div key={i}>
              <label className="text-gray-700 font-medium">{field === "name" ? "Full Name" : field.charAt(0).toUpperCase() + field.slice(1)}</label>
              <input
                type="text"
                name={field}
                value={clientData[field]}
                disabled={!isEditing}
                onChange={handleClientChange}
                className={`w-full mt-1 px-4 py-2 rounded-lg border shadow-sm transition-all duration-200 ${isEditing ? "border-blue-400 focus:ring-2 focus:ring-blue-500 bg-white" : "bg-gray-100 border-gray-200 cursor-not-allowed"}`}
              />
            </div>
          ))}

          <div>
            <label className="text-gray-700 font-medium">Email</label>
            <input
              type="email"
              value={clientData.email}
              disabled
              className="w-full mt-1 px-4 py-2 border rounded-lg bg-gray-100 border-gray-200 cursor-not-allowed"
            />
          </div>

          {/* 펫 정보 */}
          <div className="mt-10">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">🐾 Pet Information</h2>
            {petData.map((pet, index) => (
              <div key={index} className="border border-blue-100 rounded-xl p-4 mb-4 shadow-sm bg-blue-50/30 relative">
                <div className="mb-3">
                  <label className="text-gray-700 font-medium">Name</label>
                  <input type="text" value={pet.name} disabled={!isEditing} onChange={(e) => handlePetChange(index, "name", e.target.value)}
                    className={`w-full mt-1 px-4 py-2 rounded-lg border shadow-sm transition-all duration-200 ${isEditing ? "border-blue-400 focus:ring-2 focus:ring-blue-500 bg-white" : "bg-gray-100 border-gray-200 cursor-not-allowed"}`} />
                </div>

                <div className="mb-3">
                  <label className="text-gray-700 font-medium">Type</label>
                  <select value={pet.type} disabled={!isEditing} onChange={(e) => handlePetChange(index, "type", e.target.value)}
                    className={`w-full mt-1 px-4 py-2 rounded-lg border shadow-sm transition-all duration-200 ${isEditing ? "border-blue-400 focus:ring-2 focus:ring-blue-500 bg-white" : "bg-gray-100 border-gray-200 cursor-not-allowed"}`}>
                    <option value="">Select Pet Type</option>
                    <option value="Dog">Dog</option>
                    <option value="Cat">Cat</option>
                    <option value="Bird">Bird</option>
                    <option value="Fish">Fish</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="mb-3">
                  <label className="text-gray-700 font-medium">Breed</label>
                  <input type="text" value={pet.breed} disabled={!isEditing} onChange={(e) => handlePetChange(index, "breed", e.target.value)}
                    className={`w-full mt-1 px-4 py-2 rounded-lg border shadow-sm transition-all duration-200 ${isEditing ? "border-blue-400 focus:ring-2 focus:ring-blue-500 bg-white" : "bg-gray-100 border-gray-200 cursor-not-allowed"}`} />
                </div>

                <div className="mb-3">
                  <label className="text-gray-700 font-medium">Date of Birth</label>
                  <input type="date" value={pet.dob} disabled={!isEditing} onChange={(e) => handlePetChange(index, "dob", e.target.value)}
                    className={`w-full mt-1 px-4 py-2 rounded-lg border shadow-sm transition-all duration-200 ${isEditing ? "border-blue-400 focus:ring-2 focus:ring-blue-500 bg-white" : "bg-gray-100 border-gray-200 cursor-not-allowed"}`} />
                </div>

                {/* 사진 업로드 */}
                <div className="mb-3">
                  <label className="text-gray-700 font-medium">Photo</label>
                  <input type="file" accept="image/*" disabled={!isEditing} onChange={(e) => handlePetPhotoUpload(index, e.target.files[0])} className="w-full mt-1" />
                  {pet.photo && <img src={pet.photo} alt={pet.name} className="mt-2 w-32 h-32 object-cover rounded-lg border" />}
                </div>

                {isEditing && petData.length > 1 && (
                  <button type="button" onClick={() => handleRemovePet(index)} className="absolute top-2 right-2 text-red-500 font-medium hover:underline">
                    Remove
                  </button>
                )}
              </div>
            ))}

            {isEditing && (
              <button type="button" onClick={handleAddPet} className="text-blue-600 font-medium mt-2 hover:underline">
                + Add Another Pet
              </button>
            )}
          </div>

          {/* 버튼 */}
          <div className="flex justify-end gap-4 mt-8">
            {isEditing ? (
              <>
                <button type="button" onClick={() => setIsEditing(false)} className="px-6 py-2 rounded-lg text-gray-600 bg-gray-200 hover:bg-gray-300 transition">
                  Cancel
                </button>
                <button type="submit" className="px-6 py-2 rounded-lg text-white bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 shadow-sm">
                  Save Changes
                </button>
              </>
            ) : (
              <button type="button" onClick={() => setIsEditing(true)} className="px-6 py-2 rounded-lg text-white bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 shadow-sm">
                Edit Profile
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default ClientProfile;
