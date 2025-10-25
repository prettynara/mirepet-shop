import React, { useState } from "react";
import { clients, assets } from "../assets/assets";
import { useNavigate } from "react-router-dom";
import ProductsTitle from "../components/ProductsTitle";

const ClientList = ({userRole = "admin"}) => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [sortType, setSortType] = useState("name");
  const [filteredClients, setFilteredClients] = useState(clients);

  // 검색 처리
  const handleSearch = (e) => {
    const value = e.target.value.toLowerCase();
    setSearch(value);
    const filtered = clients.filter(
      (c) =>
        c.name.toLowerCase().includes(value) ||
        c.email.toLowerCase().includes(value)
    );
    setFilteredClients(filtered);
  };

  // 정렬 처리
  const handleSort = (type) => {
    setSortType(type);
    let sorted = [...filteredClients];
    if (type === "name") sorted.sort((a, b) => a.name.localeCompare(b.name));
    if (type === "recent")
      sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    setFilteredClients(sorted);
  };

  // Admin 삭제 기능
  const handleDelete = (e, clientId) => {
    e.stopPropagation();
    if (window.confirm("Are you sure you want to delete this client?")) {
      // backend 연결시 axios.delete(`/api/clients/${clientId}`) 등으로 변경
      alert(`client ${clientId} deleted`);
      setFilteredClients(filteredClients.filter((c) => c._id !== clientId));
    }
  };

  const handleClientClick = (clientId) => {
    navigate(`/client/${clientId}`);
  };

  return (
    <div className="min-h-screen bg-blue-50/30 p-8">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-8">
        <ProductsTitle text1="All" text2="CLIENTS" />
        <div className="flex items-center gap-3 mt-4 sm:mt-0">
          <input
            type="text"
            placeholder="Search clients..."
            value={search}
            onChange={handleSearch}
            className="border border-blue-300 rounded-md px-3 py-2 text-sm shadow-sm focus:ring-2 focus:ring-blue-100 outline-none"
          />
          <select
            value={sortType}
            onChange={(e) => handleSort(e.target.value)}
            className="border border-blue-300 bg-white text-sm px-3 py-2 rounded-md shadow-sm hover:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
          >
            <option value="name">Sort by: Name</option>
            <option value="recent">Sort by: Recent</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredClients.map((client) => (
          <div
            key={client._id}
            onClick={() => handleClientClick(client._id)}
            className="bg-white shadow-md rounded-2xl p-5 flex flex-col transition-transform hover:scale-105 cursor-pointer"
          >
            {/* Admin 삭제 버튼 */}
            {userRole === "admin" && (
              <button
                onClick={(e) => handleDelete(e, client._id)}
                className="absolute top-3 right-3 bg-red-500 hover:bg-red-600 text-white px-2 py-1 text-xs rounded-md shadow"
                >
                Delete
                </button>
            )}

            <div className="mb-4">
              <h2 className="text-xl font-semibold text-gray-800">{client.name}</h2>
              <p className="text-gray-500">Email: {client.email}</p>
              <p className="text-gray-500">Phone: {client.phone}</p>
              <p className="text-gray-500">Address: {client.address}</p>
            </div>

            {client.pets.length > 0 && (
              <div className="mt-4">
                <h3 className="text-lg font-medium text-gray-700 mb-3">Pets</h3>
                <div className="flex flex-wrap gap-4 justify-center">
                  {client.pets.map((pet, index) => (
                    <div key={index} className="flex flex-col items-center">
                      <div className="relative w-24 h-24 bg-blue-50 flex justify-center items-center rounded-full border-4 border-white shadow-md overflow-hidden">
                        <img
                          src={pet.photo ? pet.photo : assets.profile_icon}
                          alt={pet.name}
                          className="w-full h-full object-cover rounded-full"
                        />
                      </div>
                      <p className="text-sm font-medium mt-2">{pet.name}</p>
                      <p className="text-xs text-gray-500">{pet.type}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {filteredClients.length === 0 && (
        <p className="text-center text-gray-500 mt-12">No clients found 🐾</p>
      )}
    </div>
  );
};

export default ClientList;
