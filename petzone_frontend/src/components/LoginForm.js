import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const LoginForm = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !password) {
      setError("Proszę podać nazwę użytkownika i hasło");
      return;
    }
  
    try {
      const response = await axios.post(
        'http://localhost:8000/api/login/',
        { username, password },
        { headers: { 'Content-Type': 'application/json' } }
      );
      console.log(response.data);
      if (response.status === 200) {
        localStorage.setItem('access_token', response.data.access);
        localStorage.setItem('refresh_token', response.data.refresh);
        navigate('/dashboard');
      } else if (response.status === 401) {
        setError(response.data.error || 'Nieprawidłowy e-mail lub hasło');
      }
    } catch (error) {
      console.error('Błąd:', error.response?.data);
      setError(error.response?.data?.error || 'Wystąpił błąd');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <label>
        Username:
        <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} />
      </label>
      <br />
      <label>
        Hasło:
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
      </label>
      <br />
      <button type="submit">Zaloguj się</button>
      {error && <div style={{ color: 'red' }}>{error}</div>}
    </form>
  );}
export default LoginForm;
