import "../styles/Dashboard.css";
import logo from "../assets/logo.svg";
import homeCare from "../assets/home-care.svg"; 
import sitterCare from "../assets/petsitter-care.svg";
import walkDog from "../assets/dog-walking.svg";
import { FaSearch } from "react-icons/fa";

function Dashboard() {
    return (
        <div className="dashboard">
<nav className="top-nav">
                <a href="#">PSY</a>
                <a href="#">KOTY</a>
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
                <div className="filters">
                    <input type="date" />
                    <input type="date" />
                    <input type="text" placeholder="enter the address" />
                    <select>
                        <option>choose your pet</option>
                        <option>Dog</option>
                        <option>Cat</option>
                    </select>
                    <button className="search-button">
                        <FaSearch />
                    </button>
                </div>
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