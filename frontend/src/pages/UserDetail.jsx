import React, { useState, useEffect } from 'react';
import api from "../api";
import { useParams } from "react-router-dom";
import Navbar from "../components/Navbar";

function UserDetail() {
    const { id } = useParams();
    const [user, setUser] = useState({});

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const response = await api.get(`/api/v1/users/${id}/`);
                setUser(response.data);
            } catch (error) {
                console.error(error);
            }
        };
        fetchUser();
    }, [id]);

    return (
        <>
            <Navbar />
            <div style={{ paddingTop: '80px' }}>
                <h1>Szczegóły użytkownika</h1>
                <p>Username: {user.username}</p>
            </div>
        </>
    );
}

export default UserDetail;
