import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import "../styles/Login.css"; 
import logo from "../assets/logo.svg";

function Signup() {
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            alert("Passwords do not match.");
            return;
        }
        try {
            await api.post("api/v1/user/register/", {
                username,
                email,
                password,
            });
            alert("Account created successfully. Please log in.");
            navigate("/login");
        } catch (err) {
            alert("Signup failed. Please try a different username.");
        }
    };

    return (
        <div className="login-wrapper">
            <div className="login-left">
                <h2 className="login-title">CREATE ACCOUNT</h2>
                <form onSubmit={handleSubmit} className="login-form">
                    <input
                        type="text"
                        placeholder="Choose a username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />
                    <input
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                    <input
                        type="password"
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                    <input
                        type="password"
                        placeholder="Confirm your password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                    />
                    <button
                        type="submit"
                        className="login-button"
                        disabled={!email || !username || !password || !confirmPassword}
                    >
                        SIGN UP
                    </button>
                </form>
                <p className="login-footer">
                    Already have an account?
                    <a href="/login"> Log in</a>
                </p>
            </div>
            <div className="login-right">
                <img src={logo} alt="PetZone Logo" className="login-logo" />
            </div>
        </div>
    );
}

export default Signup;
