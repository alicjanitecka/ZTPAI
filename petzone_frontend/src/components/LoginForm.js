import React, { useState } from 'react';
import axios from 'axios';

const LoginForm = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);

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
      alert(response.data.message); // Wyświetl komunikat
    } catch (error) {
      console.error('Błąd:', error.response?.data);
      setError(error.response?.data?.error || 'Wystąpił błąd');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <label>
        Nazwa użytkownika:
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
