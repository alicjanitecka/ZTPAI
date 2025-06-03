import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import { ACCESS_TOKEN } from "../constants";
import logo from "../assets/logo.svg";
import "../styles/Login.css"; 

function JoinAsPetsitter() {
  const [description, setDescription] = useState("");
  const [isDogSitter, setIsDogSitter] = useState(false);
  const [isCatSitter, setIsCatSitter] = useState(false);
  const [isRodentSitter, setIsRodentSitter] = useState(false);
  const [hourlyRate, setHourlyRate] = useState("");
  const [careAtOwnerHome, setCareAtOwnerHome] = useState(false);
  const [careAtPetsitterHome, setCareAtPetsitterHome] = useState(false);
  const [dogWalking, setDogWalking] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem(ACCESS_TOKEN);
      await api.post(
        "/api/petsitters/",
        {
          description,
          is_dog_sitter: isDogSitter,
          is_cat_sitter: isCatSitter,
          is_rodent_sitter: isRodentSitter,
          hourly_rate: hourlyRate,
          care_at_owner_home: careAtOwnerHome,
          care_at_petsitter_home: careAtPetsitterHome,
          dog_walking: dogWalking,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      alert("Zostałeś petsitterem!");
      navigate("/");
    } catch (err) {
  if (err.response) {
    console.log("Error response data:", err.response.data);
    alert("Błąd podczas rejestracji jako petsitter: " + JSON.stringify(err.response.data));
  } else {
    alert("Błąd podczas rejestracji jako petsitter.");
  }
}
  };

  return (
    <div className="login-wrapper">
      <div className="login-left">
        <h2 className="login-title">JOIN AS PETSITTER</h2>
        <form onSubmit={handleSubmit} className="login-form">
          <textarea
            placeholder="Describe yourself and your experience with pets..."
            value={description}
            onChange={e => setDescription(e.target.value)}
            required
            rows={4}
            style={{ marginBottom: 12, borderRadius: 8, padding: 10, fontFamily: "Jura, sans-serif" }}
          />
          <div style={{ marginBottom: 12 }}>
            <label>
              <input type="checkbox" checked={isDogSitter} onChange={e => setIsDogSitter(e.target.checked)} />
             Dog care
            </label>
            <label style={{ marginLeft: 18 }}>
              <input type="checkbox" checked={isCatSitter} onChange={e => setIsCatSitter(e.target.checked)} />
              Cat care
            </label>
            <label style={{ marginLeft: 18 }}>
              <input type="checkbox" checked={isRodentSitter} onChange={e => setIsRodentSitter(e.target.checked)} />
              Rodent care
            </label>
          </div>
          <input
            type="number"
            min="0"
            step="1"
            placeholder="Rate per hour (in PLN)"
            value={hourlyRate}
            onChange={e => setHourlyRate(e.target.value)}
            required
          />
          <div style={{ marginBottom: 12, marginTop: 8 }}>
            <label>
              <input type="checkbox" checked={careAtOwnerHome} onChange={e => setCareAtOwnerHome(e.target.checked)} />
              Care at owner's home
            </label>
            <label style={{ marginLeft: 18 }}>
              <input type="checkbox" checked={careAtPetsitterHome} onChange={e => setCareAtPetsitterHome(e.target.checked)} />
              Care at petsitter's home
            </label>
            <label style={{ marginLeft: 18 }}>
              <input type="checkbox" checked={dogWalking} onChange={e => setDogWalking(e.target.checked)} />
              Dog walking
            </label>
          </div>
          <button
            type="submit"
            className="login-button"
            disabled={
              !description ||
              (!isDogSitter && !isCatSitter && !isRodentSitter) ||
              !hourlyRate
            }
          >
            DOŁĄCZ
          </button>
        </form>
        <p className="login-footer">
          <a href="/">Return to home page</a>
        </p>
      </div>
      <div className="login-right">
        <img src={logo} alt="PetZone Logo" className="login-logo" />
      </div>
    </div>
  );
}

export default JoinAsPetsitter;
