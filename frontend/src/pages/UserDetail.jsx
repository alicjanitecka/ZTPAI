import React, { useState, useEffect } from 'react';
import api from "../api";
import { useParams } from "react-router-dom";

function UserDetail() {
    const { id } = useParams();
    const [user, setUser] = useState({});

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const response = await api.get(`/api/users/${id}/`);
                setUser(response.data);
            } catch (error) {
                console.error(error);
            }
        };
        fetchUser();
    }, [id]);

    return (
        <div>
            <h1>Szczegóły użytkownika</h1>
            <p>Username: {user.username}</p>
        </div>
    );
}

export default UserDetail;
