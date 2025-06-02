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
  const [activeTab, setActiveTab] = useState("dane");
  const [loading, setLoading] = useState(true);
  const [isPetsitter, setIsPetsitter] = useState(false);
  const [editingPet, setEditingPet] = useState(null);


  // Zwierzęta
  const [pets, setPets] = useState([]);
  const [petForm, setPetForm] = useState({
    name: "",
    age: "",
    breed: "",
    additional_info: "",
    photo_url: "",
    pet_type: "",
  });

  // Usługi (dla petsittera)
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
        const res = await axios.get("http://localhost:8000/api/profile/", {
          headers: { Authorization: `Bearer ${token}` }
        });
        setForm(res.data);
        if (res.data.photo) setAvatarPreview(res.data.photo);

        // Sprawdź czy user jest petsitterem (np. res.data.is_petsitter)
        setIsPetsitter(res.data.is_petsitter || false);

        // Pobierz zwierzęta
        const petsRes = await axios.get("http://localhost:8000/api/pets/", {
          headers: { Authorization: `Bearer ${token}` }
        });
        setPets(petsRes.data);

        // Jeśli petsitter, pobierz usługi
        if (res.data.is_petsitter) {
          const petsitterRes = await axios.get("http://localhost:8000/api/petsitters/me/", {
            headers: { Authorization: `Bearer ${token}` }
          });
          setServices(petsitterRes.data);
        }
      } catch (err) {
        alert("Błąd podczas pobierania profilu");
      }
      setLoading(false);
    };
    fetchProfile();
  }, []);

  // --- Obsługa zakładek ---
  const tabs = isPetsitter
    ? ["dane", "moje zwierzeta", "uslugi"]
    : ["dane", "moje zwierzeta"];

  // --- Formularz zwierzęcia ---
  const handlePetChange = e => {
    const { name, value } = e.target;
    setPetForm(f => ({ ...f, [name]: value }));
  };

  const handlePetSubmit = async e => {
    e.preventDefault();
    const token = localStorage.getItem(ACCESS_TOKEN);
    try {
      await axios.post("http://localhost:8000/api/pets/", petForm, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // odśwież listę
      const petsRes = await axios.get("http://localhost:8000/api/pets/", {
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

  // --- Formularz usług ---
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
      await axios.patch("http://localhost:8000/api/petsitters/me/", services, {
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
    await axios.patch("http://localhost:8000/api/profile/", form, {
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
  setEditingPet(pet); // Otwiera formularz edycji z danymi tego zwierzaka
};

  const renderTab = () => {
    if (activeTab === "dane") {
      return (
        <form className="account-form" onSubmit={handleUserDataSubmit}>
        <input type="text" name="first_name" placeholder="Imię" value={form.first_name} onChange={handleChange} required />
        <input type="text" name="last_name" placeholder="Nazwisko" value={form.last_name} onChange={handleChange} required />
        <input type="email" name="email" placeholder="Email" value={form.email} onChange={handleChange} required />
        <input type="text" name="phone" placeholder="Telefon" value={form.phone} onChange={handleChange} />
        <input type="text" name="city" placeholder="Miasto" value={form.city} onChange={handleChange} />
        <input type="text" name="street" placeholder="Ulica" value={form.street} onChange={handleChange} />
        <input type="text" name="house_number" placeholder="Nr domu" value={form.house_number} onChange={handleChange} />
        <input type="text" name="apartment_number" placeholder="Nr mieszkania" value={form.apartment_number} onChange={handleChange} />
        <input type="text" name="postal_code" placeholder="Kod pocztowy" value={form.postal_code} onChange={handleChange} />
        <button type="submit" className="account-save-btn">Zapisz zmiany</button>
        </form>
      );
    }
    if (activeTab === "moje zwierzeta") {
      return (
        <div>
        <h3>Dodaj zwierzę</h3>
        <form onSubmit={handlePetSubmit} className="account-form">
        <input type="text" name="name" placeholder="Imię" value={petForm.name} onChange={handlePetChange} required />
        <input type="number" name="age" placeholder="Wiek" value={petForm.age} onChange={handlePetChange} required />
        <input type="text" name="breed" placeholder="Rasa" value={petForm.breed} onChange={handlePetChange} />
        <input type="text" name="pet_type" placeholder="Typ (dog/cat/rodent)" value={petForm.pet_type} onChange={handlePetChange} required />
        <input type="text" name="photo_url" placeholder="URL zdjęcia" value={petForm.photo_url} onChange={handlePetChange} />
        <textarea name="additional_info" placeholder="Dodatkowe informacje" value={petForm.additional_info} onChange={handlePetChange} />
        <button type="submit" className="account-save-btn">Dodaj zwierzę</button>
        </form>

        <h3>Moje zwierzęta</h3>
<ul>
  {pets.map(pet => (
    <li key={pet.id}>
      <b>{pet.name}</b> ({pet.pet_type}, {pet.age} lat) - {pet.breed}
      <button onClick={() => handleEditPet(pet)}>Edytuj</button>
      <button onClick={() => handleDeletePet(pet.id)}>Usuń</button>
    </li>
  ))}
</ul>

{/* Formularz edycji zwierzaka */}
{editingPet && (
  <form
    className="account-form"
    style={{ marginTop: 24, background: "#fff", borderRadius: 12, padding: 16 }}
    onSubmit={async (e) => {
      e.preventDefault();
      const token = localStorage.getItem(ACCESS_TOKEN);
      try {
        await axios.patch(
          `http://localhost:8000/api/pets/${editingPet.id}/`,
          editingPet,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        // odśwież listę zwierząt
        const petsRes = await axios.get("http://localhost:8000/api/pets/", {
          headers: { Authorization: `Bearer ${token}` }
        });
        setPets(petsRes.data);
        setEditingPet(null);
      } catch (err) {
        alert("Błąd przy edycji zwierzęcia");
      }
    }}
  >
    <h4>Edytuj zwierzę: {editingPet.name}</h4>
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
    if (activeTab === "uslugi" && isPetsitter) {
      return (
        <form className="account-form" onSubmit={handleServicesSubmit}>
          <h3>Usługi i dostępność</h3>
          <label>
            <input type="checkbox" name="is_dog_sitter" checked={services.is_dog_sitter} onChange={handleServicesChange} />
            Opieka nad psami
          </label>
          <label>
            <input type="checkbox" name="is_cat_sitter" checked={services.is_cat_sitter} onChange={handleServicesChange} />
            Opieka nad kotami
          </label>
          <label>
            <input type="checkbox" name="is_rodent_sitter" checked={services.is_rodent_sitter} onChange={handleServicesChange} />
            Opieka nad gryzoniami
          </label>
          <input type="number" name="hourly_rate" placeholder="Stawka za godzinę" value={services.hourly_rate || ""} onChange={handleServicesChange} />
          <label>
            <input type="checkbox" name="care_at_owner_home" checked={services.care_at_owner_home} onChange={handleServicesChange} />
            Opieka w domu właściciela
          </label>
          <label>
            <input type="checkbox" name="care_at_petsitter_home" checked={services.care_at_petsitter_home} onChange={handleServicesChange} />
            Opieka u petsittera
          </label>
          <label>
            <input type="checkbox" name="dog_walking" checked={services.dog_walking} onChange={handleServicesChange} />
            Wyprowadzanie psa
          </label>
          <textarea name="availability" placeholder="Dostępność (np. pon-pt 8-16)" value={services.availability || ""} onChange={handleServicesChange} />
          <button type="submit" className="account-save-btn">Zapisz usługi</button>
        </form>
      );
    }
    return null;
  };

  return (
    <div className="account-wrapper">
<nav className="top-nav">

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
          {loading ? <p>Ładowanie...</p> : renderTab()}
        </div>
      </div>
    </div>
  );
}

export default MyAccount;
