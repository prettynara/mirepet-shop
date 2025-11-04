import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRole } from '../context/RoleContext';

const Login = () => {
  const [currentState, setCurrentState] = useState('Login');
  const { role, setRole } = useRole(); // RoleContext에서 role 가져오기
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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

    const formData = { name, email, password, role };

    if (currentState === 'Sign Up') {
    try {
      const payload = { name, email, password, role, pets };
      const res = await fetch('http://localhost:4000/api/register', {
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

      // 저장 성공 시 role과 token 저장
      localStorage.setItem('role', userRole);
      localStorage.setItem('token', data.token);
      if (data.user) localStorage.setItem('user', JSON.stringify(data.user));
      setRole(userRole);

      // 회원가입 성공 후 페이지 이동
      if (userRole === 'client') navigate('/customer-info');
      else if (userRole === 'seller') navigate('/seller-info');
      else navigate('/');
    } catch (err) {
      console.error(err);
      alert('Registration failed');
    }
    return;
  }

    // Login
    try {
      const res = await fetch('http://localhost:4000/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
        credentials: 'include'
      });

      const data = await res.json();
      if (!data.success) {
        alert(data.message);
        return;
      }

      // ✅ 백엔드에서 받은 유저 정보 확인
      console.log("✅ Login response:", data);

      if (data.token) {
        localStorage.setItem('token', data.token);
      }

      //try to use returned user; if not present, call /api/me
      let currentUser = data.user || null;
      if (!currentUser) {
        try {
          const meRes = await fetch('http://localhost:4000/api/me', {
            method: 'GET',
            headers: { 'Content-Type': 'application/json',
              ...(data.token ? {Authorization: `Bearer ${data.token}`} : {})
            },
            credentials: 'include'
          });
          if (meRes.ok) {
            const meData = await meRes.json();
            currentUser = meData.user || null;
          }
        } catch (e) {
          console.warn('no /api/me after login:', e);         
        }
      }

      if (currentUser) {
        localStorage.setItem('user', JSON.stringify(currentUser));
      } else {
        // ensure previous stale user is removed
        localStorage.removeItem('user');
      } 

      //API에서 받은 role 사용
      const userRole = data.role  || (currentUser && currentUser.role)|| 'guest';
      setRole(userRole);
      localStorage.setItem('role', userRole); //새로고침 후에도 유지
      // JWT 저장(선택, 새로고침 후 로그인 유지 가능)

      // role별 화면 이동
      console.log('navigating, userRole:', userRole);
      if (userRole === 'client') navigate('/', {replace: true});
      else if (userRole === 'seller') navigate('/seller/dashboard', {replace: true});
      else if (userRole === 'admin') navigate('/admin/dashboard', {replace: true});
      else navigate('/', {replace: true});
    } catch (navErr) {
      console.error('navigate failed, falling back to full redirect:', navErr);
      // 강제 새로고침 리다이렉트(임시 안전망)
      window.location.href = '/';
    }
  };

  const onForgotSubmit = async (e) => {
    e.preventDefault();
    if (!forgotEmail) {
      setForgotMessage('Please enteryour email address.');
      return;
    }
    setLoading(true);
    setForgotMessage('');
    try {
      const res = await fetch('http://localhost:4000/api/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail }),
        credentials: 'include'
      });
      
      let data = null;
      try { data = await res.json(); } catch { /* non-json response */ }

      if (res.ok && data?.success) {
        setForgotMessage(data.message || 'Reset link sent to your email.');
      } else if (data && !data.success) {
        setForgotMessage(data.message || 'Failed the the request.');
      } else {
        setForgotMessage('No response from server.');
      }
    } catch (err) {
      console.error(err);
      setForgotMessage('Network error.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full flex justify-center">
      <form
        onSubmit={forgotMode ? onForgotSubmit : onSubmitHandler}
        className="flex flex-col items-center w-[90%] sm:max-w-md m-auto mt-16 gap-6 text-gray-800 bg-gradient-to-br from-blue-50 to-indigo-100 p-10 rounded-3xl shadow-xl"
      >
        {/* Title */}
        <div className="flex items-center gap-4 mb-6 justify-center">
          <p className="text-3xl font-bold text-indigo-700">{forgotMode ? 'Forgot Password' : currentState}</p>
          <hr className="h-[2px] w-10 bg-gray-800 border-none rounded" />
        </div>

        {/* If forgot mode -> show forgot form */}
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
                className="flex-1 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white font-medium px-4 py-3 rounded-xl shadow-md hover:from-indigo-600 hover:to-indigo-700 transition"
              >
                {loading ? 'Sending...' : 'Send reset link'}
              </button>
              <button
                type="button"
                onClick={() => { setForgotMode(false); setForgotMessage(''); }}
                className="flex-1 border border-gray-300 px-4 py-3 rounded-xl bg-white hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </>
        ) : (
          <>
            {/* Input Fields */}
            {currentState === 'Sign Up' && (
              <input
                type="text"
                placeholder="Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                required
              />
            )}

            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg"
              required
            />

            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg"
              required
            />
            

            {currentState === 'Sign Up' && (
              <div className="w-full flex justify-between mt-2 text-gray-700">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" value="client" checked={role === 'client'} onChange={() => setRole('client')} />
                  Customer
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" value="seller" checked={role === 'seller'} onChange={() => setRole('seller')} />
                  Petshop Seller
                </label>
              </div>
            )}

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

            <button type="submit" className="bg-indigo-600 text-white px-8 py-3 mt-4 rounded-xl">
              {currentState === 'Login' ? 'Sign In' : 'Sign Up'}
            </button>
          </>
        )}
      </form>
    </div>
  );
};

export default Login;