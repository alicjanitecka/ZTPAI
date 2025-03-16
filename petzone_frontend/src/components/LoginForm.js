import React, { useState } from 'react';
import axios from 'axios';

const LoginForm = () => {
  const [username, setUsername] = useState('');
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        'http://localhost:8000/api/login/',
        { username },
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
      <button type="submit">Zaloguj się</button>
      {error && <div style={{ color: 'red' }}>{error}</div>}
    </form>
  );
};

export default LoginForm;
