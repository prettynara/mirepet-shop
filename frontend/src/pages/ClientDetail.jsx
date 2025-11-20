import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { assets } from "../assets/assets";

const API_BASE = "http://localhost:4000";

const ClientDetail = () => {
  const { id } = useParams(); // URL에서 클라이언트 ID 가져오기
  const navigate = useNavigate();

  const [clientData, setClientData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchClient = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        const res = await axios.get(`${API_BASE}/api/users/client/${id}`, {
          headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
          withCredentials: true,
        });

        const client = res.data.client || res.data;
        console.log("✅ Client data:", client);
        setClientData(client);
      } catch (err) {
        console.error("❌ Error fetching client:", err);
        alert("Failed to load client profile.");
        navigate("/client-list");
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchClient();
  }, [id, navigate]);

  if (loading) {
    return (
      <p className="text-center mt-20 text-gray-600">Loading client profile...</p>
    );
  }

  if (!clientData) {
    return (
      <div className="text-center mt-20">
        <p className="text-gray-600 mb-4">Client not found.</p>
        <button
          onClick={() => navigate("/client-list")}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Back to Client List
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex justify-center items-start py-16">
      <div className="w-full max-w-3xl bg-white/90 backdrop-blur-sm shadow-lg rounded-2xl p-10 border border-blue-100">
        {/* 뒤로가기 버튼 */}
        <button
          onClick={() => navigate("/client-list")}
          className="mb-6 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
        >
          ← Back to Client List
        </button>

        <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">
          🐶 Client Profile
        </h1>

        {/* 고객 정보 */}
        <div className="space-y-5">
          <div>
            <label className="text-gray-700 font-medium">Full Name</label>
            <input
              type="text"
              value={clientData.name || ""}
              disabled
              className="w-full mt-1 px-4 py-2 rounded-lg border bg-gray-100 border-gray-200 cursor-not-allowed"
            />
          </div>

          <div>
            <label className="text-gray-700 font-medium">Email</label>
            <input
              type="email"
              value={clientData.email || ""}
              disabled
              className="w-full mt-1 px-4 py-2 border rounded-lg bg-gray-100 border-gray-200 cursor-not-allowed"
            />
          </div>

          <div>
            <label className="text-gray-700 font-medium">Phone</label>
            <input
              type="text"
              value={clientData.phone || "N/A"}
              disabled
              className="w-full mt-1 px-4 py-2 rounded-lg border bg-gray-100 border-gray-200 cursor-not-allowed"
            />
          </div>

          <div>
            <label className="text-gray-700 font-medium">Address</label>
            <input
              type="text"
              value={clientData.address || "N/A"}
              disabled
              className="w-full mt-1 px-4 py-2 rounded-lg border bg-gray-100 border-gray-200 cursor-not-allowed"
            />
          </div>
        </div>

        {/* 펫 정보 */}
        {clientData.pets && clientData.pets.length > 0 && (
          <div className="mt-10">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              🐾 Pet Information
            </h2>
            {clientData.pets.map((pet, index) => (
              <div
                key={index}
                className="border border-blue-100 rounded-xl p-4 mb-4 shadow-sm bg-blue-50/30"
              >
                <div className="mb-3">
                  <label className="text-gray-700 font-medium">Name</label>
                  <input
                    type="text"
                    value={pet.name || ""}
                    disabled
                    className="w-full mt-1 px-4 py-2 rounded-lg border bg-gray-100 border-gray-200 cursor-not-allowed"
                  />
                </div>

                <div className="mb-3">
                  <label className="text-gray-700 font-medium">Type</label>
                  <input
                    type="text"
                    value={pet.type || ""}
                    disabled
                    className="w-full mt-1 px-4 py-2 rounded-lg border bg-gray-100 border-gray-200 cursor-not-allowed"
                  />
                </div>

                <div className="mb-3">
                  <label className="text-gray-700 font-medium">Breed</label>
                  <input
                    type="text"
                    value={pet.breed || "N/A"}
                    disabled
                    className="w-full mt-1 px-4 py-2 rounded-lg border bg-gray-100 border-gray-200 cursor-not-allowed"
                  />
                </div>

                <div className="mb-3">
                  <label className="text-gray-700 font-medium">
                    Date of Birth
                  </label>
                  <input
                    type="text"
                    value={
                      pet.dob
                        ? new Date(pet.dob).toISOString().slice(0, 10)
                        : "N/A"
                    }
                    disabled
                    className="w-full mt-1 px-4 py-2 rounded-lg border bg-gray-100 border-gray-200 cursor-not-allowed"
                  />
                </div>

                {pet.photo && (
                  <div className="mb-3">
                    <label className="text-gray-700 font-medium">Photo</label>
                    <img
                      src={pet.photo}
                      alt={pet.name}
                      className="mt-2 w-32 h-32 object-cover rounded-lg border"
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {!clientData.pets || clientData.pets.length === 0 && (
          <p className="text-center text-gray-500 mt-8">No pets registered.</p>
        )}
      </div>
    </div>
  );
};

export default ClientDetail;