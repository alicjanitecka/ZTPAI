import React, { useEffect, useState } from "react";
import axios from "axios";
import logo from "../assets/logo.svg";
import defaultAvatar from "../assets/default-avatar.svg";
import { ACCESS_TOKEN } from "../constants";
import { Link } from "react-router-dom";
import "../styles/MyAccount.css";
import api from "../api";
import AvailabilityCalendar from "./AvailabilityCalendar";
import ImageCropper from "./ImageCropper";


function MyAccount() {
  const [availabilityDate, setAvailabilityDate] = useState("");
const [availabilityList, setAvailabilityList] = useState([]);
const [pendingAvailability, setPendingAvailability] = useState([]);

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
  const [activeTab, setActiveTab] = useState("personal data");
  const [loading, setLoading] = useState(true);
  const [isPetsitter, setIsPetsitter] = useState(false);
  const [editingPet, setEditingPet] = useState(null);


  const [pets, setPets] = useState([]);
  const [petForm, setPetForm] = useState({
    name: "",
    age: "",
    breed: "",
    additional_info: "",
    photo: null,
    pet_type: "",
  });
  const [petPhotoPreview, setPetPhotoPreview] = useState(null);
  const [editPetPhotoPreview, setEditPetPhotoPreview] = useState(null);

  const [showCropper, setShowCropper] = useState(false);
  const [imageToCrop, setImageToCrop] = useState(null);
  const [cropperType, setCropperType] = useState(null); // 'profile', 'pet', 'editPet'

  const getMediaUrl = (path) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    return `http://localhost:8000${path}`;
  };

  const breedOptions = {
    dog: [
      "Labrador Retriever",
      "German Shepherd",
      "Golden Retriever",
      "Bulldog",
      "Poodle",
      "Beagle",
      "Rottweiler",
      "Yorkshire Terrier",
      "Boxer",
      "Dachshund",
      "Husky",
      "Kundelek (Mixed Breed)"
    ],
    cat: [
      "Persian",
      "Siamese",
      "Maine Coon",
      "British Shorthair",
      "Sphynx",
      "Bengal",
      "Ragdoll",
      "Scottish Fold",
      "Abyssinian",
      "Russian Blue",
      "Dachowiec (Mixed Breed)"
    ],
    rodent: [
      "Hamster",
      "Guinea Pig",
      "Rabbit",
      "Chinchilla",
      "Rat",
      "Mouse",
      "Gerbil",
      "Ferret"
    ]
  };


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
        if (res.data.photo) setAvatarPreview(getMediaUrl(res.data.photo));
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

useEffect(() => {
  setPendingAvailability(availabilityList.map(a => a.date));
}, [availabilityList]);

  const tabs = isPetsitter
    ? ["personal data", "my pets", "services"]
    : ["personal data", "my pets"];

  const handlePetChange = e => {
    const { name, value, type, files } = e.target;
    if (type === "file" && name === "photo") {
      if (files[0]) {
        setImageToCrop(URL.createObjectURL(files[0]));
        setCropperType('pet');
        setShowCropper(true);
      }
    } else {
      setPetForm(f => ({ ...f, [name]: value }));
    }
  };

  const handlePetSubmit = async e => {
    e.preventDefault();
    const token = localStorage.getItem(ACCESS_TOKEN);
    try {
      const formData = new FormData();
      formData.append("name", petForm.name);
      formData.append("age", petForm.age);
      formData.append("breed", petForm.breed);
      formData.append("pet_type", petForm.pet_type);
      if (petForm.additional_info) formData.append("additional_info", petForm.additional_info);
      if (petForm.photo) formData.append("photo", petForm.photo);

      await axios.post("http://localhost:8000/api/v1/pets/", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data"
        }
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
        photo: null,
        pet_type: "",
      });
      setPetPhotoPreview(null);
    } catch (err) {
      alert("Błąd przy dodawaniu zwierzęcia");
    }
  };
const fetchAvailabilityList = async () => {
  const token = localStorage.getItem(ACCESS_TOKEN);
  try {
    const availRes = await axios.get("http://localhost:8000/api/v1/petsitter-availability/", {
      headers: { Authorization: `Bearer ${token}` }
    });
    setAvailabilityList(availRes.data);
  } catch (err) {
    console.error("Error fetching availability list");
  }
};

const handleToggleAvailability = (dateString) => {
  setPendingAvailability(prev => {
    if (prev.includes(dateString)) {
      return prev.filter(d => d !== dateString);
    } else {
      return [...prev, dateString];
    }
  });
};

const handleSaveAvailability = async () => {
  const token = localStorage.getItem(ACCESS_TOKEN);

  const toAdd = pendingAvailability.filter(
    date => !availabilityList.some(a => a.date === date)
  );
  const toRemove = availabilityList.filter(
    a => !pendingAvailability.includes(a.date)
  );

  try {
    for (const date of toAdd) {
      await axios.post("http://localhost:8000/api/v1/petsitter-availability/", {
        date: date,
        is_available: true
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
    }

    for (const a of toRemove) {
      await axios.delete(`http://localhost:8000/api/v1/petsitter-availability/${a.id}/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
    }

    await fetchAvailabilityList();
    alert("Availability saved!");
  } catch (err) {
    alert("Error saving availability");
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
    let payload;
    let headers = { Authorization: `Bearer ${token}` };

    if (form.photo instanceof File) {
      const formData = new FormData();
      Object.keys(form).forEach(key => {
        if (form[key] !== null && form[key] !== undefined && form[key] !== "") {
          formData.append(key, form[key]);
        }
      });
      payload = formData;
      headers["Content-Type"] = "multipart/form-data";
    } else {
      payload = form;
    }

    const res = await axios.patch("http://localhost:8000/api/v1/profile/", payload, { headers });
    setForm(res.data);
    if (res.data.photo) setAvatarPreview(getMediaUrl(res.data.photo));
    alert("Dane zapisane!");
  } catch (err) {
    alert("Błąd podczas zapisywania danych.");
  }
};
const handleChange = (e) => {
  const { name, value, type, files } = e.target;
  if (type === "file" && name === "photo") {
    if (files[0]) {
      setImageToCrop(URL.createObjectURL(files[0]));
      setCropperType('profile');
      setShowCropper(true);
    }
  } else if (type === "file") {
    setForm(f => ({ ...f, [name]: files[0] }));
  } else {
    setForm(f => ({ ...f, [name]: value }));
  }
};

const handleCropComplete = (croppedBlob) => {
  if (cropperType === 'profile') {
    const file = new File([croppedBlob], "profile.jpg", { type: "image/jpeg" });
    setForm(f => ({ ...f, photo: file }));
    setAvatarPreview(URL.createObjectURL(croppedBlob));
  } else if (cropperType === 'pet') {
    const file = new File([croppedBlob], "pet.jpg", { type: "image/jpeg" });
    setPetForm(f => ({ ...f, photo: file }));
    setPetPhotoPreview(URL.createObjectURL(croppedBlob));
  } else if (cropperType === 'editPet') {
    const file = new File([croppedBlob], "pet.jpg", { type: "image/jpeg" });
    setEditingPet({ ...editingPet, photo: file });
    setEditPetPhotoPreview(URL.createObjectURL(croppedBlob));
  }
  setShowCropper(false);
  setImageToCrop(null);
  setCropperType(null);
};

const handleCropCancel = () => {
  setShowCropper(false);
  setImageToCrop(null);
  setCropperType(null);
};
const handleEditPet = (pet) => {
  setEditingPet({
    ...pet,
    photo: null,
    additional_info: pet.additional_info || ""
  });
  setEditPetPhotoPreview(pet.photo ? getMediaUrl(pet.photo) : null);
};

const handleDeletePet = async (id) => {
  const token = localStorage.getItem(ACCESS_TOKEN);
  try {
    await axios.delete(`http://localhost:8000/api/v1/pets/${id}/`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    setPets(pets.filter(pet => pet.id !== id));
  } catch (err) {
    alert("Błąd przy usuwaniu zwierzęcia");
  }
};

  const renderTab = () => {
    if (activeTab === "personal data") {
      const profileImageSrc = form.photo instanceof File
        ? URL.createObjectURL(form.photo)
        : (avatarPreview || defaultAvatar);

      return (
        <form className="account-form" onSubmit={handleUserDataSubmit}>
        <div style={{ display: "flex", flexDirection: "column", gap: "12px", alignItems: "center", marginBottom: "20px" }}>
          <div style={{ position: "relative", width: "120px", height: "120px", borderRadius: "50%", overflow: "hidden", border: "3px solid #e0e0e0" }}>
            <img
              src={profileImageSrc}
              alt="Profile"
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          </div>
          <label className="profile-photo-upload">
            Upload Profile Photo
            <input
              type="file"
              name="photo"
              accept="image/*"
              onChange={handleChange}
              style={{ display: "none" }}
            />
          </label>
        </div>
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
        <select name="pet_type" value={petForm.pet_type} onChange={handlePetChange} required>
          <option value="">Select pet type</option>
          <option value="dog">Dog</option>
          <option value="cat">Cat</option>
          <option value="rodent">Rodent</option>
        </select>

        <input type="text" name="name" placeholder="Name" value={petForm.name} onChange={handlePetChange} required />

        <input
          type="number"
          name="age"
          placeholder="Age"
          value={petForm.age}
          onChange={handlePetChange}
          min="0.5"
          step="0.5"
          required
        />

        {petForm.pet_type && (
          <select name="breed" value={petForm.breed} onChange={handlePetChange}>
            <option value="">Select breed</option>
            {breedOptions[petForm.pet_type]?.map(breed => (
              <option key={breed} value={breed}>{breed}</option>
            ))}
          </select>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <label style={{ fontSize: "0.9rem", color: "#5b5856" }}>Pet Photo</label>
          {petPhotoPreview && (
            <div style={{ width: "100px", height: "100px", borderRadius: "8px", overflow: "hidden", marginBottom: "8px" }}>
              <img src={petPhotoPreview} alt="Preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </div>
          )}
          <input type="file" name="photo" accept="image/*" onChange={handlePetChange} />
        </div>

        <textarea name="additional_info" placeholder="Additional information" value={petForm.additional_info} onChange={handlePetChange} />
        <button type="submit" className="account-save-btn">Add pet</button>
        </form>

        <h3>My pets</h3>
<ul className="pet-list">
  {pets.map(pet => (
    <li key={pet.id} className="pet-item">
      {pet.photo && (
        <div style={{ width: "60px", height: "60px", borderRadius: "8px", overflow: "hidden", flexShrink: 0 }}>
          <img src={getMediaUrl(pet.photo)} alt={pet.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        </div>
      )}
      <div className="pet-info">
        <b>{pet.name}</b> ({pet.pet_type}, {pet.age} lat) - {pet.breed}
      </div>
      <div className="pet-actions">
        <button className="pet-edit-btn" onClick={() => handleEditPet(pet)}>Edit</button>
        <button className="pet-delete-btn" onClick={() => handleDeletePet(pet.id)}>Delete</button>
      </div>
    </li>
  ))}
</ul>

{editingPet && (
  <form
    className="account-form edit-pet-form"
    onSubmit={async (e) => {
      e.preventDefault();
      const token = localStorage.getItem(ACCESS_TOKEN);
      try {
        const formData = new FormData();
        formData.append("name", editingPet.name);
        formData.append("age", editingPet.age);
        formData.append("breed", editingPet.breed);
        formData.append("pet_type", editingPet.pet_type);
        if (editingPet.additional_info) formData.append("additional_info", editingPet.additional_info);
        if (editingPet.photo instanceof File) formData.append("photo", editingPet.photo);

        await axios.patch(
          `http://localhost:8000/api/v1/pets/${editingPet.id}/`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "multipart/form-data"
            }
          }
        );
        const petsRes = await axios.get("http://localhost:8000/api/v1/pets/", {
          headers: { Authorization: `Bearer ${token}` }
        });
        setPets(petsRes.data);
        setEditingPet(null);
        setEditPetPhotoPreview(null);
      } catch (err) {
        alert("Błąd przy edycji zwierzęcia");
      }
    }}
  >
    <h4>Edit pet: {editingPet.name}</h4>

    <select
      name="pet_type"
      value={editingPet.pet_type}
      onChange={e => setEditingPet({ ...editingPet, pet_type: e.target.value, breed: "" })}
      required
    >
      <option value="">Select pet type</option>
      <option value="dog">Dog</option>
      <option value="cat">Cat</option>
      <option value="rodent">Rodent</option>
    </select>

    <input
      type="text"
      name="name"
      placeholder="Name"
      value={editingPet.name}
      onChange={e => setEditingPet({ ...editingPet, name: e.target.value })}
      required
    />

    <input
      type="number"
      name="age"
      placeholder="Age"
      value={editingPet.age}
      onChange={e => setEditingPet({ ...editingPet, age: e.target.value })}
      min="0.5"
      step="0.5"
      required
    />

    {editingPet.pet_type && (
      <select
        name="breed"
        value={editingPet.breed}
        onChange={e => setEditingPet({ ...editingPet, breed: e.target.value })}
      >
        <option value="">Select breed</option>
        {breedOptions[editingPet.pet_type]?.map(breed => (
          <option key={breed} value={breed}>{breed}</option>
        ))}
      </select>
    )}

    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
      <label style={{ fontSize: "0.9rem", color: "#5b5856" }}>Pet Photo</label>
      {(editingPet.photo || editPetPhotoPreview) && (
        <div style={{ width: "100px", height: "100px", borderRadius: "8px", overflow: "hidden", marginBottom: "8px" }}>
          <img
            src={editingPet.photo instanceof File ? URL.createObjectURL(editingPet.photo) : editPetPhotoPreview}
            alt="Preview"
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        </div>
      )}
      <input
        type="file"
        name="photo"
        accept="image/*"
        onChange={e => {
          if (e.target.files[0]) {
            setImageToCrop(URL.createObjectURL(e.target.files[0]));
            setCropperType('editPet');
            setShowCropper(true);
          }
        }}
      />
    </div>

    <textarea
      name="additional_info"
      placeholder="Additional information"
      value={editingPet.additional_info}
      onChange={e => setEditingPet({ ...editingPet, additional_info: e.target.value })}
    />

    <div className="edit-pet-actions">
      <button type="submit" className="account-save-btn">Zapisz zmiany</button>
      <button type="button" className="pet-cancel-btn" onClick={() => {
        setEditingPet(null);
        setEditPetPhotoPreview(null);
      }}>Anuluj</button>
    </div>
  </form>
)}
        </div>
      );
    }
    if (activeTab === "services" && isPetsitter) {
      return (
        <div>
          <form className="account-form" onSubmit={handleServicesSubmit}>
            <h3>Services</h3>
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
            <input type="number" name="hourly_rate" placeholder="Hourly rate" value={services.hourly_rate || ""} onChange={handleServicesChange} />
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
            <button type="submit" className="account-save-btn">Save Services</button>
          </form>

          <div style={{ marginTop: 32 }}>
            <h3>Availability</h3>
            <p style={{ color: '#5b5856', fontSize: '0.95rem', marginBottom: 16 }}>Click on days to toggle availability, then click Save.</p>
            <AvailabilityCalendar
              availabilityList={pendingAvailability.map(date => ({ date }))}
              onToggleAvailability={handleToggleAvailability}
            />
            <button type="button" className="account-save-btn" onClick={handleSaveAvailability} style={{ marginTop: 16 }}>
              Save Availability
            </button>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="account-wrapper">
<nav className="top-nav">
                <Link to="/">HOME</Link>
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
      {showCropper && imageToCrop && (
        <ImageCropper
          image={imageToCrop}
          onCropComplete={handleCropComplete}
          onCancel={handleCropCancel}
        />
      )}
    </div>
  );
}

export default MyAccount;
