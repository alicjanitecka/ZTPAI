import React, { useState, useEffect } from 'react';
import api from "../api";
import { Link } from 'react-router-dom';
import "../styles/Home.css"

function Home() {
    const [users, setUsers] = useState([]);
    const [newUsername, setNewUsername] = useState('');
    const [newEmail, setNewEmail] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [creating, setCreating] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    const fetchUsers = async () => {

        try {
            const response = await api.get('/api/home/');
            setUsers(response.data);
            setErrorMsg(''); 
        } catch (error) {
            console.error("Error fetching users:", error);
            setErrorMsg('Nie udało się pobrać listy użytkowników.');

        }
    };

    useEffect(() => {
        fetchUsers();
    }, []); 

    const handleCreateUser = async (e) => {
        e.preventDefault();
        setCreating(true);
        setErrorMsg(''); 
        try {
            await api.post('/api/user/register/', { 
                username: newUsername, 
                email: newEmail,
                password: newPassword 
            });
            setNewUsername('');
            setNewEmail('');
            setNewPassword('');
            alert('Użytkownik utworzony pomyślnie!'); 
            await fetchUsers(); 
        } catch (error) {
            console.error("Error creating user:", error.response?.data || error.message);
            if (error.response && error.response.data) {
                if (error.response.data.username) {
                    setErrorMsg(`Błąd: ${error.response.data.username.join(', ')}`);
                } else if (error.response.data.password) {
                     setErrorMsg(`Błąd hasła: ${error.response.data.password.join(', ')}`);
                }
                 else {
                    setErrorMsg('Wystąpił błąd podczas tworzenia użytkownika.');
                }
            } else {
                setErrorMsg('Nie można połączyć się z serwerem.');
            }
        } finally {
            setCreating(false);
        }
    };

    const handleRefresh = async () => {
        setRefreshing(true);
        setErrorMsg(''); 
        await fetchUsers(); 
        setRefreshing(false);
    };

    return (
        <div>
            <h1>Lista użytkowników</h1>

            {errorMsg && <p style={{ color: 'red' }}>{errorMsg}</p>}

            <form onSubmit={handleCreateUser}>
                <input
                    type="text"
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    placeholder="Nowy username"
                    required 
                />
                   <input
                    type="email" 
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="Nowy email"
                    required 
                />
                <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Nowe hasło"
                    required 
                />
                <button type="submit" disabled={creating || refreshing}>
                    {creating ? 'Tworzenie...' : 'Utwórz'}
                </button>
            </form>

            <h2>Istniejący użytkownicy:</h2>
            <button onClick={handleRefresh} disabled={refreshing || creating}>
                {refreshing ? 'Odświeżanie...' : 'Odśwież'}
            </button>
            <ul>
            {users.length > 0 ? (
                    users.map(user => (
                        <li key={user.id}>
                            {/* Make username a link to the detail page */}
                            <Link to={`/users/${user.id}`}>
                                {user.username}
                            </Link>
                        </li>
                    ))
                ) : (
                    <li>Brak użytkowników do wyświetlenia lub błąd ładowania.</li>
                )}
            </ul>
        </div>
    );
}

export default Home;