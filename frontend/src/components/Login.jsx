import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import { ACCESS_TOKEN, REFRESH_TOKEN } from "../constants";
import "../styles/Login.css";
import logo from "../assets/logo.svg";

function Login() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await api.post("/api/token/", {
                username,
                password,
            });
            localStorage.setItem(ACCESS_TOKEN, res.data.access);
            localStorage.setItem(REFRESH_TOKEN, res.data.refresh);
            navigate("/");
        } catch (err) {
            alert("Login failed. Please check your credentials.");
        }
    };

const [showExpired, setShowExpired] = useState(false);
useEffect(() => {
    const url = new URL(window.location);
    const expired = url.searchParams.get("expired") === "1";

    if (expired) {
        setShowExpired(true);
        setUsername("");
        setPassword("");
        url.searchParams.delete("expired");
        window.history.replaceState({}, "", url);
    }
}, []);

    return (
        <div>
      {showExpired && (
        <div style={{ color: "red", marginBottom: "1rem" }}>
          Your session has expired. Please log in again.
        <button
                        onClick={() => setShowExpired(false)}
                        style={{
                            position: "absolute",
                            right: 10,
                            top: 0,
                            background: "transparent",
                            border: "none",
                            fontSize: "1.2rem",
                            color: "#5c5c5c",
                            cursor: "pointer"
                        }}
                        aria-label="Close"
                    >
                        ×
                    </button>
                </div>
            )}
        <div className="login-wrapper">
            <div className="login-left">
                <h2 className="login-title">WELCOME BACK!</h2>
                <form onSubmit={handleSubmit} className="login-form">
                    <input
                        type="text"
                        placeholder="Enter your username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />
                    <input
                        type="password"
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                    <div className="login-options">
                        <label className="remember-label">
                            <input type="checkbox" />
                            Remember me
                        </label>
                        <a href="/forgot-password" className="forgot-link">
                            Forgot password?
                        </a>
                    </div>
                    <button type="submit" className="login-button" disabled={!username || !password}>
                        LOG IN
                    </button>
                </form>
                <p className="login-footer">
                    Don’t have an account yet?
                    <a href="/register"> Sign up</a>
                </p>
            </div>
            <div className="login-right">
                <img src={logo} alt="PetZone Logo" className="login-logo" />
            </div>
        </div>
        </div>
    );
}

export default Login;
