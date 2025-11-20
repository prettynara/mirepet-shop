import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRole } from '../context/RoleContext';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000';

const Login = () => {
  const [currentState, setCurrentState] = useState('Login');
  const { setRole } = useRole();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRoleLocal] = useState('client');
  const [pets, setPets] = useState([]);

  const addPetField = () => 
    setPets(prev => [...prev, {name: '', type: '', dob: ''}]);
  const removePetField = (i) => 
    setPets(prev => prev.filter((_, index) => index !== i));
  const updatePetField = (i, key, value) =>
    setPets(prev => prev.map((p, idx) => (idx === i ? {...p, [key]: value} : p)));

  const [forgotMode, setForgotMode] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotMessage, setForgotMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmitHandler = async (event) => {
    event.preventDefault();

    // Sign Up
    if (currentState === 'Sign Up') {
      try {
        const payload = { name, email, password, role, pets };
        const res = await fetch(`${API_BASE}/api/users/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
          credentials: 'include'
        });

        const data = await res.json();

        if (!data.success) {
          alert(data.message || 'Registration failed');
          return;
        }

        const userRole = data.role || role;
        const userId = data.id || data._id || data.user?._id || null;

        localStorage.setItem('token', data.token);
        localStorage.setItem('role', userRole);
        localStorage.setItem('user', JSON.stringify({
          id: userId,
          name: data.name || name,
          email: data.email || email,
          role: userRole
        }));
        if (userId) localStorage.setItem('userId', userId);

        axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
        setRole(userRole);

        if (userRole === 'client') navigate('/customer-info', { replace: true });
        else if (userRole === 'seller') navigate('/seller-info', { replace: true });
        else navigate('/', { replace: true });
      } catch (err) {
        console.error('Registration error', err);
        alert('Registration failed');
      }
      return;
    }

    // Login
    try {
      const res = await fetch(`${API_BASE}/api/users/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
        credentials: 'include'
      });

      const data = await res.json();
      console.log("✅ Login response:", data);

      if (!data.success) {
        alert(data.message || 'Login failed');
        return;
      }

      const userId = data.id || data._id || data.user?._id || null;
      const userRole = data.role || 'client';

      // clear old data
      localStorage.removeItem('deliveryInfo');

      // save new user
      localStorage.setItem('token', data.token);
      localStorage.setItem('role', userRole);
      localStorage.setItem('userId', userId);
      localStorage.setItem('user', JSON.stringify({
        _id: userId,
        id: userId,
        name: data.name,
        email: data.email || email,
        role: userRole
      }));
      if (userId) localStorage.setItem('userId', userId);

      axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
      setRole(userRole);

      // navigate
      console.log('navigating, userRole:', userRole);
      if (userRole === 'seller') {
        navigate('/seller/dashboard', { replace: true });
      } else if (userRole === 'admin') {
        navigate('/admin/dashboard', { replace: true });
      } else {
        navigate('/', { replace: true });
      }
    } catch (err) {
      console.error('Login error', err);
      alert('Login failed');
    }
  };

  const onForgotSubmit = async (e) => {
    e.preventDefault();
    if (!forgotEmail) {
      setForgotMessage('Please enter your email address.');
      return;
    }
    setLoading(true);
    setForgotMessage('');
    try {
      const res = await fetch(`${API_BASE}/api/users/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail }),
        credentials: 'include'
      });
      
      const data = await res.json();

      if (res.ok && data?.success) {
        setForgotMessage(data.message || 'Reset link sent to your email.');
      } else {
        setForgotMessage(data?.message || 'Failed to send reset link.');
      }
    } catch (err) {
      console.error(err);
      setForgotMessage('Network error.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full flex justify-center">
      <form
        onSubmit={forgotMode ? onForgotSubmit : onSubmitHandler}
        className="flex flex-col items-center w-[90%] sm:max-w-md m-auto mt-16 gap-6 text-gray-800 bg-gradient-to-br from-blue-50 to-indigo-100 p-10 rounded-3xl shadow-xl"
      >
        <div className="flex items-center gap-4 mb-6 justify-center">
          <p className="text-3xl font-bold text-indigo-700">{forgotMode ? 'Forgot Password' : currentState}</p>
          <hr className="h-[2px] w-10 bg-gray-800 border-none rounded" />
        </div>

        {forgotMode ? (
          <>
            <input
              type="email"
              placeholder="Enter your email"
              value={forgotEmail}
              onChange={(e) => setForgotEmail(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
              required
            />
            {forgotMessage && <p className="text-sm text-center text-gray-700">{forgotMessage}</p>}
            <div className="w-full flex gap-3">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white font-medium px-4 py-3 rounded-xl shadow-md hover:from-indigo-600 hover:to-indigo-700 transition disabled:opacity-50"
              >
                {loading ? 'Sending...' : 'Send reset link'}
              </button>
              <button
                type="button"
                onClick={() => { setForgotMode(false); setForgotMessage(''); setForgotEmail(''); }}
                className="flex-1 border border-gray-300 px-4 py-3 rounded-xl bg-white hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </>
        ) : (
          <>
            {currentState === 'Sign Up' && (
              <>
                <input
                  type="text"
                  placeholder="Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  required
                />
                <div className="w-full flex justify-between mt-2 text-gray-700">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" value="client" checked={role === 'client'} onChange={() => setRoleLocal('client')} />
                    Customer
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" value="seller" checked={role === 'seller'} onChange={() => setRoleLocal('seller')} />
                    Petshop Seller
                  </label>
                </div>
                {role === 'client' && pets.length > 0 && (
                  <div className="w-full space-y-2">
                    {pets.map((pet, i) => (
                      <div key={i} className="flex gap-2">
                        <input
                          type="text"
                          placeholder="Pet name"
                          value={pet.name}
                          onChange={(e) => updatePetField(i, 'name', e.target.value)}
                          className="flex-1 px-3 py-2 border rounded"
                        />
                        <input
                          type="text"
                          placeholder="Type"
                          value={pet.type}
                          onChange={(e) => updatePetField(i, 'type', e.target.value)}
                          className="flex-1 px-3 py-2 border rounded"
                        />
                        <input
                          type="date"
                          value={pet.dob}
                          onChange={(e) => updatePetField(i, 'dob', e.target.value)}
                          className="px-3 py-2 border rounded"
                        />
                        <button type="button" onClick={() => removePetField(i)} className="px-3 text-red-500">✕</button>
                      </div>
                    ))}
                  </div>
                )}
                
              </>
            )}

            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
              required
            />

            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
              required
            />

            <div className="w-full flex justify-between text-sm text-gray-600 mt-2">
              <p onClick={() => { setForgotMode(true); setForgotMessage(''); }} className="cursor-pointer hover:text-blue-600">
                Forgot your password?
              </p>

              {currentState === 'Login' ? (
                <p onClick={() => setCurrentState('Sign Up')} className="cursor-pointer hover:text-blue-600">Create account</p>
              ) : (
                <p onClick={() => setCurrentState('Login')} className="cursor-pointer text-blue-600">Login Here</p>
              )}
            </div>

            <button type="submit" className="w-full bg-gradient-to-r from-indigo-500 to-indigo-600 text-white font-semibold px-8 py-3 mt-4 rounded-xl shadow-md hover:from-indigo-600 hover:to-indigo-700 transition">
              {currentState === 'Login' ? 'Sign In' : 'Sign Up'}
            </button>
          </>
        )}
      </form>
    </div>
  );
};

export default Login;