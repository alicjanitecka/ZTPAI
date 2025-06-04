import React, { useState, useEffect } from 'react';
import api from "../api";
import { Link } from 'react-router-dom';
import "../styles/AdminPage.css";
import { jwtDecode } from "jwt-decode";
import { ACCESS_TOKEN, REFRESH_TOKEN } from "../constants";
import { useNavigate } from "react-router-dom";




function AdminPage() {

    const [isAdmin, setIsAdmin] = useState(false);
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
    useEffect(() => {
        const token = localStorage.getItem(ACCESS_TOKEN);
        if (token) {
            const decoded = jwtDecode(token);
            setIsAdmin(decoded.role === 'admin'); 
        }
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
    const handleDelete = async (userId) => {
        if (!window.confirm("Na pewno chcesz usunąć użytkownika?")) return;
        try {
            await api.delete(`/api/user/${userId}/delete/`);
            await fetchUsers();
        } catch (error) {
            alert("Błąd podczas usuwania użytkownika.");
        }
    };
    if (!isAdmin) {
        return <div>Brak uprawnień do zarządzania użytkownikami.</div>;
    }
    return (
        <div>
            <div className="admin-page-container">
            <h1 className="admin-title">Dodaj użytkownika</h1>

            {errorMsg && <p style={{ color: 'red' }}>{errorMsg}</p>}
        <div className="admin-form-center">
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

            <h2 className="admin-title">Istniejący użytkownicy:</h2>
            <button onClick={handleRefresh} disabled={refreshing || creating}>
                {refreshing ? 'Odświeżanie...' : 'Odśwież'}
            </button>
</div>


            <div className="table-container">
            <table className="user-table">
                <thead>
                    <tr>
                    <th>Username</th>
                    <th>Role</th>
                    {isAdmin && <th>Action</th>}
                    </tr>
                </thead>
                <tbody>
                    {users.length > 0 ? (
                    users.map(user => (
                        <tr key={user.id}>
                        <td>
                            <Link to={`/users/${user.id}`}>{user.username}</Link>
                        </td>
                        <td>{user.role}</td>
                        {isAdmin && (
                            <td>
                            <button onClick={() => handleDelete(user.id)}>Usuń</button>
                            </td>
                        )}
                        </tr>
                    ))
                    ) : (
                    <tr>
                        <td colSpan={isAdmin ? 3 : 2}>Brak użytkowników do wyświetlenia lub błąd ładowania.</td>
                    </tr>
                    )}
                </tbody>
                </table>
                </div>


            </div>
        </div>
    );
}

export default AdminPage;