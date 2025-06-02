import React, { useEffect, useState } from "react";
import axios from "axios";
import logo from "../assets/logo.svg";
import defaultAvatar from "../assets/default-avatar.svg";
import { ACCESS_TOKEN } from "../constants";
import { Link } from "react-router-dom";
import "../styles/MyAccount.css";

function MyAccount() {
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    phone: "",
    email: "",
    city: "",
    street: "",
    house_number: "",
    apartment_number: "",
    postal_code: "",
    photo: null,
  });
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [activeTab, setActiveTab] = useState("personal information");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      const token = localStorage.getItem(ACCESS_TOKEN);
      try {
        const res = await axios.get("http://localhost:8000/api/profile/", {
          headers: { Authorization: `Bearer ${token}` }
        });
        setForm(res.data);
        if (res.data.photo) setAvatarPreview(res.data.photo);
      } catch (err) {
        alert("Błąd podczas pobierania profilu");
      }
      setLoading(false);
    };
    fetchProfile();
  }, []);

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  const handlePhotoChange = e => {
    const file = e.target.files[0];
    setForm(f => ({ ...f, photo: file }));
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    const token = localStorage.getItem(ACCESS_TOKEN);
    const formData = new FormData();
    Object.entries(form).forEach(([key, value]) => {
      if (value !== null && value !== undefined) formData.append(key, value);
    });
    try {
      await axios.patch("http://localhost:8000/api/profile/", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        }
      });
      alert("Profil zaktualizowany!");
    } catch (err) {
      alert("Błąd podczas aktualizacji profilu.");
    }
  };

  const tabs = [
    "personal information",
    "address",
    "settings"
  ];

  return (
    <div className="account-wrapper">
            <nav className="top-nav">
                <a href="/">HOME</a>
                <a href="/visits">MOJE WIZYTY</a>
                <a href="join-petsitter">DOŁĄCZ JAKO PETSITTER</a>
                <a href="/account">MOJE KONTO</a>
                <a href="/logout">WYLOGUJ</a>
            </nav>
      <header className="header">
        <div className="logo-container">
          <img src={logo} alt="PetZone Logo" className="logo" />
        </div>
      </header>
      <div className="account-container">
        {/* Lewy panel z zakładkami */}
        <div className="account-tabs">
          {tabs.map(tab => (
            <div
              key={tab}
              className={`account-tab${activeTab === tab ? " active" : ""}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </div>
          ))}
        </div>
        {/* Prawy panel z formularzem */}
        <form className="account-form" onSubmit={handleSubmit}>
          <h2 style={{
            textAlign: "center",
            fontWeight: 700,
            letterSpacing: 4,
            color: "#5b5856",
            marginBottom: 18
          }}>
            MANAGE YOUR PROFILE
          </h2>
          {loading ? <p>Ładowanie...</p> : (
            <div style={{ display: "flex", gap: 32 }}>
              <div style={{ flex: 1 }}>
                <input
                  type="text"
                  name="first_name"
                  placeholder="First name"
                  value={form.first_name || ""}
                  onChange={handleChange}
                />
                <input
                  type="text"
                  name="last_name"
                  placeholder="Last name"
                  value={form.last_name || ""}
                  onChange={handleChange}
                />
                <input
                  type="text"
                  name="phone"
                  placeholder="Phone"
                  value={form.phone || ""}
                  onChange={handleChange}
                />
                <input
                  type="email"
                  name="email"
                  placeholder="Email"
                  value={form.email || ""}
                  onChange={handleChange}
                />
                <input
                  type="text"
                  name="city"
                  placeholder="City"
                  value={form.city || ""}
                  onChange={handleChange}
                />
                <input
                  type="text"
                  name="street"
                  placeholder="Street"
                  value={form.street || ""}
                  onChange={handleChange}
                />
                <input
                  type="text"
                  name="house_number"
                  placeholder="House number"
                  value={form.house_number || ""}
                  onChange={handleChange}
                />
                <input
                  type="text"
                  name="apartment_number"
                  placeholder="Apartment number"
                  value={form.apartment_number || ""}
                  onChange={handleChange}
                />
                <input
                  type="text"
                  name="postal_code"
                  placeholder="Postal code"
                  value={form.postal_code || ""}
                  onChange={handleChange}
                />
              </div>
              {/* Avatar */}
              <div className="account-avatar-section">
                <div className="account-avatar-box">
                  <img
                    src={avatarPreview || defaultAvatar}
                    alt="avatar"
                  />
                </div>
                <label className="account-avatar-label">
                  add a photo
                  <input
                    type="file"
                    name="photo"
                    accept="image/*"
                    onChange={handlePhotoChange}
                    style={{ display: "none" }}
                  />
                </label>
              </div>
            </div>
          )}
          <button type="submit" className="account-save-btn">
            Save changes
          </button>
        </form>
      </div>
    </div>
  );
}

export default MyAccount;
