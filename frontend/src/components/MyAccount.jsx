import React, { useEffect, useState } from "react";
import axios from "axios";
import logo from "../assets/logo.svg";
import defaultAvatar from "../assets/default-avatar.svg";
import { ACCESS_TOKEN } from "../constants";
import { Link } from "react-router-dom";
import "../styles/MyAccount.css";
import api from "../api";


function MyAccount() {
  const [availabilityDate, setAvailabilityDate] = useState("");
const [availabilityList, setAvailabilityList] = useState([]);

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
  const [activeTab, setActiveTab] = useState("dane");
  const [loading, setLoading] = useState(true);
  const [isPetsitter, setIsPetsitter] = useState(false);
  const [editingPet, setEditingPet] = useState(null);


  const [pets, setPets] = useState([]);
  const [petForm, setPetForm] = useState({
    name: "",
    age: "",
    breed: "",
    additional_info: "",
    photo_url: "",
    pet_type: "",
  });


  const [services, setServices] = useState({
    is_dog_sitter: false,
    is_cat_sitter: false,
    is_rodent_sitter: false,
    hourly_rate: "",
    care_at_owner_home: false,
    care_at_petsitter_home: false,
    dog_walking: false,
    availability: "",
  });

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      const token = localStorage.getItem(ACCESS_TOKEN);
      try {
        const res = await axios.get("http://localhost:8000/api/v1/profile/", {
          headers: { Authorization: `Bearer ${token}` }
        });
        setForm(res.data);
        if (res.data.photo) setAvatarPreview(res.data.photo);
        setIsPetsitter(res.data.is_petsitter || false);

        const petsRes = await axios.get("http://localhost:8000/api/v1/pets/", {
          headers: { Authorization: `Bearer ${token}` }
        });
        setPets(petsRes.data);

        if (res.data.is_petsitter) {
        const petsitterRes = await axios.get("http://localhost:8000/api/v1/petsitters/me/", {
          headers: { Authorization: `Bearer ${token}` }
        });
        setServices(petsitterRes.data);

        const availRes = await axios.get("http://localhost:8000/api/v1/petsitter-availability/", {
          headers: { Authorization: `Bearer ${token}` }
        });
        setAvailabilityList(availRes.data);


      }
    } catch (err) {
      alert("Błąd podczas pobierania profilu");
    }
    setLoading(false);
  };
  fetchProfile();
}, []);

  const tabs = isPetsitter
    ? ["personal data", "my pets", "services"]
    : ["personal data", "my pets"];

  const handlePetChange = e => {
    const { name, value } = e.target;
    setPetForm(f => ({ ...f, [name]: value }));
  };

  const handlePetSubmit = async e => {
    e.preventDefault();
    const token = localStorage.getItem(ACCESS_TOKEN);
    try {
      await axios.post("http://localhost:8000/api/v1/pets/", petForm, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const petsRes = await axios.get("http://localhost:8000/api/v1/pets/", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPets(petsRes.data);
      setPetForm({
        name: "",
        age: "",
        breed: "",
        additional_info: "",
        photo_url: "",
        pet_type: "",
      });
    } catch (err) {
      alert("Błąd przy dodawaniu zwierzęcia");
    }
  };
const handleDeleteAvailability = async (id) => {
  const token = localStorage.getItem(ACCESS_TOKEN);
  try {
    await axios.delete(`http://localhost:8000/api/v1/petsitter-availability/${id}/`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    setAvailabilityList(availabilityList.filter(item => item.id !== id));
  } catch (err) {
    alert("Błąd przy usuwaniu dostępności");
  }
};

  const handleServicesChange = e => {
    const { name, type, checked, value } = e.target;
    setServices(s => ({
      ...s,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const handleServicesSubmit = async e => {
    e.preventDefault();
    const token = localStorage.getItem(ACCESS_TOKEN);
    try {
      await axios.patch("http://localhost:8000/api/v1/petsitters/me/", services, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert("Usługi zaktualizowane!");
    } catch (err) {
      alert("Błąd przy aktualizacji usług");
    }
  };
const handleUserDataSubmit = async (e) => {
  e.preventDefault();
  const token = localStorage.getItem(ACCESS_TOKEN);
  try {
    await axios.patch("http://localhost:8000/api/v1/profile/", form, {
      headers: { Authorization: `Bearer ${token}` }
    });
    alert("Dane zapisane!");
  } catch (err) {
    alert("Błąd podczas zapisywania danych.");
  }
};
const handleChange = (e) => {
  const { name, value } = e.target;
  setForm(f => ({
    ...f,
    [name]: value
  }));
};
const handleEditPet = (pet) => {
  setEditingPet(pet); 
};

  const renderTab = () => {
    if (activeTab === "personal data") {
      return (
        <form className="account-form" onSubmit={handleUserDataSubmit}>
        <input type="text" name="first_name" placeholder="First name" value={form.first_name} onChange={handleChange} required />
        <input type="text" name="last_name" placeholder="Last name" value={form.last_name} onChange={handleChange} required />
        <input type="email" name="email" placeholder="Email" value={form.email} onChange={handleChange} required />
        <input type="text" name="phone" placeholder="Phone number" value={form.phone} onChange={handleChange} />
        <input type="text" name="city" placeholder="City" value={form.city} onChange={handleChange} />
        <input type="text" name="street" placeholder="Street" value={form.street} onChange={handleChange} />
        <input type="text" name="house_number" placeholder="House number" value={form.house_number} onChange={handleChange} />
        <input type="text" name="apartment_number" placeholder="Apartment number" value={form.apartment_number} onChange={handleChange} />
        <input type="text" name="postal_code" placeholder="Post code" value={form.postal_code} onChange={handleChange} />
        <button type="submit" className="account-save-btn">Save</button>
        </form>
      );
    }
    if (activeTab === "my pets") {
      return (
        <div>
        <h3>Add pet</h3>
        <form onSubmit={handlePetSubmit} className="account-form">
        <input type="text" name="name" placeholder="Name" value={petForm.name} onChange={handlePetChange} required />
        <input type="number" name="age" placeholder="Age" value={petForm.age} onChange={handlePetChange} required />
        <input type="text" name="breed" placeholder="Breed" value={petForm.breed} onChange={handlePetChange} />
        <input type="text" name="pet_type" placeholder="Pet type" value={petForm.pet_type} onChange={handlePetChange} required />
        <input type="text" name="photo_url" placeholder="Photo" value={petForm.photo_url} onChange={handlePetChange} />
        <textarea name="additional_info" placeholder="Additional information" value={petForm.additional_info} onChange={handlePetChange} />
        <button type="submit" className="account-save-btn">Add pet</button>
        </form>

        <h3>My pets</h3>
<ul>
  {pets.map(pet => (
    <li key={pet.id}>
      <b>{pet.name}</b> ({pet.pet_type}, {pet.age} lat) - {pet.breed}
      <button onClick={() => handleEditPet(pet)}>Edit</button>
      <button onClick={() => handleDeletePet(pet.id)}>Delete</button>
    </li>
  ))}
</ul>

{editingPet && (
  <form
    className="account-form"
    style={{ marginTop: 24, background: "#fff", borderRadius: 12, padding: 16 }}
    onSubmit={async (e) => {
      e.preventDefault();
      const token = localStorage.getItem(ACCESS_TOKEN);
      try {
        await axios.patch(
          `http://localhost:8000/api/v1/pets/${editingPet.id}/`,
          editingPet,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        // odśwież listę zwierząt
        const petsRes = await axios.get("http://localhost:8000/api/v1/pets/", {
          headers: { Authorization: `Bearer ${token}` }
        });
        setPets(petsRes.data);
        setEditingPet(null);
      } catch (err) {
        alert("Błąd przy edycji zwierzęcia");
      }
    }}
  >
    <h4>Edit pet: {editingPet.name}</h4>
    <input
      type="text"
      name="name"
      value={editingPet.name}
      onChange={e => setEditingPet({ ...editingPet, name: e.target.value })}
      required
    />
    <input
      type="number"
      name="age"
      value={editingPet.age}
      onChange={e => setEditingPet({ ...editingPet, age: e.target.value })}
      required
    />
    <input
      type="text"
      name="breed"
      value={editingPet.breed}
      onChange={e => setEditingPet({ ...editingPet, breed: e.target.value })}
    />
    <input
      type="text"
      name="pet_type"
      value={editingPet.pet_type}
      onChange={e => setEditingPet({ ...editingPet, pet_type: e.target.value })}
      required
    />
    <input
      type="text"
      name="photo_url"
      value={editingPet.photo_url}
      onChange={e => setEditingPet({ ...editingPet, photo_url: e.target.value })}
    />
    <textarea
      name="additional_info"
      value={editingPet.additional_info}
      onChange={e => setEditingPet({ ...editingPet, additional_info: e.target.value })}
    />
    <button type="submit" className="account-save-btn">Zapisz zmiany</button>
    <button type="button" onClick={() => setEditingPet(null)} style={{ marginLeft: 12 }}>Anuluj</button>
  </form>
)}
        </div>
      );
    }
    if (activeTab === "services" && isPetsitter) {
      return (
        <form className="account-form" onSubmit={handleServicesSubmit}>
          <h3>Services and availability</h3>
          <label>
            <input type="checkbox" name="is_dog_sitter" checked={services.is_dog_sitter} onChange={handleServicesChange} />
            Dog care
          </label>
          <label>
            <input type="checkbox" name="is_cat_sitter" checked={services.is_cat_sitter} onChange={handleServicesChange} />
            Cat care
          </label>
          <label>
            <input type="checkbox" name="is_rodent_sitter" checked={services.is_rodent_sitter} onChange={handleServicesChange} />
            Rodent care
          </label>
          <input type="number" name="hourly_rate" placeholder="Stawka za godzinę" value={services.hourly_rate || ""} onChange={handleServicesChange} />
          <label>
            <input type="checkbox" name="care_at_owner_home" checked={services.care_at_owner_home} onChange={handleServicesChange} />
            Care at owner home
          </label>
          <label>
            <input type="checkbox" name="care_at_petsitter_home" checked={services.care_at_petsitter_home} onChange={handleServicesChange} />
            Care at petsitter home
          </label>
          <label>
            <input type="checkbox" name="dog_walking" checked={services.dog_walking} onChange={handleServicesChange} />
            Dog walking
          </label>
      <h4>Availability (select available days):</h4>
<div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
  <input
    type="date"
    value={availabilityDate}
    onChange={e => setAvailabilityDate(e.target.value)}
    style={{ padding: 8, borderRadius: 6, border: "1px solid #ccc" }}
  />
  <button
    type="button"
    className="account-save-btn"
    onClick={async () => {
      if (!availabilityDate) {
        alert("Select a date first!");
        return;
      }
      const token = localStorage.getItem(ACCESS_TOKEN);
      try {
        await axios.post("http://localhost:8000/api/v1/petsitter-availability/", {
          date: availabilityDate,
          is_available: true
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });
        alert("Dostępność zapisana!");
        const availRes = await axios.get("http://localhost:8000/api/v1/petsitter-availability/", {
          headers: { Authorization: `Bearer ${token}` }
        });
      } catch (err) {
        alert("Błąd przy zapisie dostępności");
      }
    }}
    style={{ marginLeft: 8 }}
  >
    Add availability
  </button>
</div>

<ul>
  {availabilityList.map(item => (
    <li key={item.id} style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <span>{item.date} – {item.is_available ? "Available" : "Unavailable"}</span>
      <button
        type="button"
        style={{
          background: "#eae5df",
          color: "#5c5c5c",
          border: "none",
          borderRadius: "8px",
          padding: "4px 12px",
          cursor: "pointer"
        }}
        onClick={() => handleDeleteAvailability(item.id)}
      >
        Cancel
      </button>
    </li>
  ))}
</ul>

    </form>
  );
  
}
    return null;
  };

  return (
    <div className="account-wrapper">
<nav className="top-nav">

                <a href="/visits">MY VISITS</a>
                {!isPetsitter && (
                   <Link to="/join-petsitter">JOIN AS PETSITTER</Link>
                )}
                <a href="/account">MY ACCOUNT</a>
                <a href="/logout">LOGOUT</a>
            </nav>
      <header className="header">
        <div className="logo-container">
          <img src={logo} alt="PetZone Logo" className="logo" />
        </div>
      </header>
      <div className="account-container">
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
        <div style={{ flex: 1, padding: "0 12px" }}>
          {loading ? <p>Loading...</p> : renderTab()}
        </div>
      </div>
    </div>
  );
}

export default MyAccount;
