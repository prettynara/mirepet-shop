import React, { useEffect, useState } from "react";
import axios from "axios";

const API_BASE = "http://localhost:4000";

const ClientProfile = () => {
  const [clientData, setClientData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
  });

  const [petData, setPetData] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [clientId, setClientId] = useState(null);

  // ✅ 로그인된 사용자 ID 로드
  useEffect(() => {
    try {
      const storedUser = JSON.parse(localStorage.getItem("user"));
      if (storedUser && storedUser._id) {
        setClientId(storedUser._id);
        console.log("✅ Loaded clientId:", storedUser._id);
        return;
      }
    } catch (err) {
      console.warn("❌ Error reading localStorage:", err);
    }
    // fallback: request current user from backend
    const fetchMe = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${API_BASE}/api/users/me`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {})
          },
          credentials: "include",
        });
        if (res.ok) {
          const data = await res.json();
          if (data && data.user && data.user._id) {
            setClientId(data.user._id);
            localStorage.setItem("user", JSON.stringify(data.user));
            console.log("✅ Fetched clientId from /api/me:", data.user._id);
          } else {
            console.warn("❌ No user data in /api/me response");
          }
      } else {
        console.warn("❌ /api/me response not ok:", res.status);
      }
    } catch (err) {
      console.error("❌ Error fetching clientId:", err);
    }
  };
    fetchMe();
}, []);

  // ✅ 클라이언트 정보 불러오기
  useEffect(() => {
    if (!clientId) {
      setLoading(false);
      return; 
    }
    const fetchClient = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token")
        const res = await axios.get(`${API_BASE}/api/users/client/${clientId}`, {
          headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
          withCredentials: true,
        });
        // backend returns { success: true, client}
        const client = res.data.client || res.data;
        setClientData({
          name: client.name,
          email: client.email,
          phone: client.phone || "",
          address: client.address || "",
        });
        setPetData(client.pets || []);
        //normalize pet.dob -> "YYYY-MM-DD" for <input type="date">
        const normalizedPets = (client.pets || []).map(p => ({
          ...p,
          dob: p?.dob ? new Date(p.dob).toISOString().slice(0,10) : ""
        }));
          setPetData(normalizedPets);
      } catch (err) {
        console.error("❌ Error fetching client data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchClient();
  }, [clientId]);

  // ✅ 고객 정보 변경
  const handleClientChange = (e) => {
    const { name, value } = e.target;
    setClientData((prev) => ({ ...prev, [name]: value }));
  };

  // ✅ 펫 정보 변경
  const handlePetChange = (index, field, value) => {
    setPetData((prev) =>
      prev.map((pet, i) => (i === index ? { ...pet, [field]: value } : pet))
    );
  };

  // ✅ 펫 사진 업로드
  const handlePetPhotoUpload = (index, file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => handlePetChange(index, "photo", reader.result);
    reader.readAsDataURL(file);
  };

  // ✅ 펫 추가/삭제
  const handleAddPet = () =>
    setPetData([...petData, { name: "", type: "", breed: "", dob: "", photo: "" }]);

  const handleRemovePet = (index) =>
    setPetData((prev) => prev.filter((_, i) => i !== index));

  // ✅ 저장
  const handleSave = async (e) => {
    e.preventDefault();
    if (!clientId) {
      alert("Client ID not found. Cannot save profile.");
      return;
    } 
    try {
      const token = localStorage.getItem("token");
      const payload = {
        ...clientData,
        pets: petData.map(p => ({...p, dob: p.dob ? new Date(p.dob) : null}))
      }
      const res = await axios.post(`${API_BASE}/api/users/client/${clientId}`,
        payload,
        {
          headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) }, withCredentials: true
        }
      );
      if (res.data && res.data.success) {
        setIsEditing(false);
        alert("✅ Profile saved successfully!");
        if (res.data.client) {
          localStorage.setItem("user", JSON.stringify(res.data.client));
        }
      } else {
        console.error("Save failed:", res.status, res.data);
        throw new Error(res.data?.message || "Save failed");
      }
    } catch (err) {
      console.error("❌ Error saving profile:", err, err?.response?.data);
      alert("Failed to save changes.");
    }
  };

  // ✅ 로딩 상태 표시
  if (loading)
    return <p className="text-center mt-20 text-gray-600">Loading profile...</p>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex justify-center items-start py-16">
      <div className="w-full max-w-3xl bg-white/90 backdrop-blur-sm shadow-lg rounded-2xl p-10 border border-blue-100">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">
          🐶 Client Profile
        </h1>

        <form className="space-y-5" onSubmit={handleSave}>
          {/* 고객 정보 */}
          {["name", "phone", "address"].map((field, i) => (
            <div key={i}>
              <label className="text-gray-700 font-medium">
                {field === "name"
                  ? "Full Name"
                  : field.charAt(0).toUpperCase() + field.slice(1)}
              </label>
              <input
                type="text"
                name={field}
                value={clientData[field]}
                disabled={!isEditing}
                onChange={handleClientChange}
                className={`w-full mt-1 px-4 py-2 rounded-lg border shadow-sm transition-all duration-200 ${
                  isEditing
                    ? "border-blue-400 focus:ring-2 focus:ring-blue-500 bg-white"
                    : "bg-gray-100 border-gray-200 cursor-not-allowed"
                }`}
              />
            </div>
          ))}

          {/* 이메일 (비활성화) */}
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
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              🐾 Pet Information
            </h2>
            {petData.map((pet, index) => (
              <div
                key={index}
                className="border border-blue-100 rounded-xl p-4 mb-4 shadow-sm bg-blue-50/30 relative"
              >
                {/* 이름 */}
                <div className="mb-3">
                  <label className="text-gray-700 font-medium">Name</label>
                  <input
                    type="text"
                    value={pet.name}
                    disabled={!isEditing}
                    onChange={(e) => handlePetChange(index, "name", e.target.value)}
                    className={`w-full mt-1 px-4 py-2 rounded-lg border shadow-sm transition-all duration-200 ${
                      isEditing
                        ? "border-blue-400 focus:ring-2 focus:ring-blue-500 bg-white"
                        : "bg-gray-100 border-gray-200 cursor-not-allowed"
                    }`}
                  />
                </div>

                {/* 타입 */}
                <div className="mb-3">
                  <label className="text-gray-700 font-medium">Type</label>
                  <select
                    value={pet.type}
                    disabled={!isEditing}
                    onChange={(e) => handlePetChange(index, "type", e.target.value)}
                    className={`w-full mt-1 px-4 py-2 rounded-lg border shadow-sm transition-all duration-200 ${
                      isEditing
                        ? "border-blue-400 focus:ring-2 focus:ring-blue-500 bg-white"
                        : "bg-gray-100 border-gray-200 cursor-not-allowed"
                    }`}
                  >
                    <option value="">Select Pet Type</option>
                    <option value="Dog">Dog</option>
                    <option value="Cat">Cat</option>
                    <option value="Bird">Bird</option>
                    <option value="Fish">Fish</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                {/* 품종 */}
                <div className="mb-3">
                  <label className="text-gray-700 font-medium">Breed</label>
                  <input
                    type="text"
                    value={pet.breed}
                    disabled={!isEditing}
                    onChange={(e) => handlePetChange(index, "breed", e.target.value)}
                    className={`w-full mt-1 px-4 py-2 rounded-lg border shadow-sm transition-all duration-200 ${
                      isEditing
                        ? "border-blue-400 focus:ring-2 focus:ring-blue-500 bg-white"
                        : "bg-gray-100 border-gray-200 cursor-not-allowed"
                    }`}
                  />
                </div>

                {/* 생년월일 */}
                <div className="mb-3">
                  <label className="text-gray-700 font-medium">
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    value={pet.dob}
                    disabled={!isEditing}
                    onChange={(e) => handlePetChange(index, "dob", e.target.value)}
                    className={`w-full mt-1 px-4 py-2 rounded-lg border shadow-sm transition-all duration-200 ${
                      isEditing
                        ? "border-blue-400 focus:ring-2 focus:ring-blue-500 bg-white"
                        : "bg-gray-100 border-gray-200 cursor-not-allowed"
                    }`}
                  />
                </div>

                {/* 사진 업로드 */}
                <div className="mb-3">
                  <label className="text-gray-700 font-medium">Photo</label>
                  <input
                    type="file"
                    accept="image/*"
                    disabled={!isEditing}
                    onChange={(e) =>
                      handlePetPhotoUpload(index, e.target.files[0])
                    }
                    className="w-full mt-1"
                  />
                  {pet.photo && (
                    <img
                      src={pet.photo}
                      alt={pet.name}
                      className="mt-2 w-32 h-32 object-cover rounded-lg border"
                    />
                  )}
                </div>

                {isEditing && petData.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemovePet(index)}
                    className="absolute top-2 right-2 text-red-500 font-medium hover:underline"
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}

            {isEditing && (
              <button
                type="button"
                onClick={handleAddPet}
                className="text-blue-600 font-medium mt-2 hover:underline"
              >
                + Add Another Pet
              </button>
            )}
          </div>

          {/* 버튼 */}
          <div className="flex justify-end gap-4 mt-8">
            {isEditing ? (
              <>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-6 py-2 rounded-lg text-gray-600 bg-gray-200 hover:bg-gray-300 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-lg text-white bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 shadow-sm"
                >
                  Save Changes
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="px-6 py-2 rounded-lg text-white bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 shadow-sm"
              >
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
