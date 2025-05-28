import React, {useState} from "react";
import axios from "axios";
import "../styles/Dashboard.css";
import logo from "../assets/logo.svg";
import homeCare from "../assets/home-care.svg"; 
import sitterCare from "../assets/petsitter-care.svg";
import walkDog from "../assets/dog-walking.svg";
import { FaSearch } from "react-icons/fa";

function Dashboard() {
    const [searched, setSearched] = useState(false);

    const [city, setCity] = useState("");
    const [petType, setPetType] = useState("");
    const [careType, setCareType] = useState("");
    const [date, setDate] = useState("");
    const [results, setResults] = useState([]);

    const handleSearch = async (e) => {
        e.preventDefault();
        setSearched(true);
        try {
            const params = {};
            if (city) params.city = city;
            if (petType) params.pet_type = petType;
            if (careType) params.care_type = careType;
            if (date) params.date = date;
            const res = await axios.get("http://localhost:8000/api/petsitters/search/", { params });
            console.log("API response:", res.data);
            setResults(Array.isArray(res.data) ? res.data : []);
        } catch (err) {
            alert("Błąd podczas wyszukiwania petsitterów");
            setResults([])
        }
    };

    return (
        <div className="dashboard">
<nav className="top-nav">

                <a href="#">MOJE WIZYTY</a>
                <a href="#">DOŁĄCZ JAKO PETSITTER</a>
                <a href="#">MOJE KONTO</a>
                <a href="#">WYLOGUJ</a>
            </nav>

            <header className="header">
                <div className="logo-container">
                    <img src={logo} alt="PetZone Logo" className="logo" />
                </div>
            </header>

            <div className="filters-background">
                <form className="filters" onSubmit={handleSearch}>
                    <input type="date" value={date} onChange={e => setDate(e.target.value)} />
                    {/* Możesz dodać drugi date picker jeśli chcesz zakres */}
                    <input
                        type="text"
                        placeholder="enter the city"
                        value={city}
                        onChange={e => setCity(e.target.value)}
                    />
                    <select value={petType} onChange={e => setPetType(e.target.value)}>
                        <option value="">choose your pet</option>
                        <option value="dog">Dog</option>
                        <option value="cat">Cat</option>
                        <option value="rodent">Rodent</option>
                    </select>
                    <select value={careType} onChange={e => setCareType(e.target.value)}>
                        <option value="">choose care type</option>
                        <option value="dog_walking">Dog walking</option>
                        <option value="care_at_owner_home">Care at owner's home</option>
                        <option value="care_at_petsitter_home">Care at petsitter's home</option>
                    </select>
                    <button className="search-button" type="submit">
                        <FaSearch />
                    </button>
                </form>
            </div>
            {/* Wyniki wyszukiwania */}
            <div className="search-results">
                {searched && results.length === 0 && <p>No petsitters found.</p>}
                {results.map(p => (
                    <div key={p.id} className="petsitter-card">
                        <h4>{p.username} ({p.city})</h4>
                        <p>{p.description}</p>
                        <p>
                            <strong>Dog sitter:</strong> {p.is_dog_sitter ? "Yes" : "No"}<br />
                            <strong>Cat sitter:</strong> {p.is_cat_sitter ? "Yes" : "No"}<br />
                            <strong>Rodent sitter:</strong> {p.is_rodent_sitter ? "Yes" : "No"}
                        </p>
                        <p>
                            <strong>Care at owner's home:</strong> {p.care_at_owner_home ? "Yes" : "No"}<br />
                            <strong>Care at petsitter's home:</strong> {p.care_at_petsitter_home ? "Yes" : "No"}<br />
                            <strong>Dog walking:</strong> {p.dog_walking ? "Yes" : "No"}
                        </p>
                        <p><strong>Hourly rate:</strong> {p.hourly_rate ? `${p.hourly_rate} zł` : "Not set"}</p>
                    </div>
                ))}
            </div>
            <div className="services">
                <div className="card">
                    <h3>Care at your home</h3>
                    <img src={homeCare} alt="Care at home" className="card-icon" />
                    <a href="#">Find out more...</a>
                </div>
                <div className="card">
                    <h3>Care at the petsitter’s home</h3>
                    <img src={sitterCare} alt="Petsitter care" className="card-icon" />
                    <a href="#">Find out more...</a>
                </div>
                <div className="card">
                    <h3>Walking the dog</h3>
                    <img src={walkDog} alt="Dog walking" className="card-icon" />
                    <a href="#">Find out more...</a>
                </div>
            </div>
        </div>
    );
}

export default Dashboard;