import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaUser, FaEnvelope, FaPaw, FaCog, FaSignOutAlt, FaBriefcase } from 'react-icons/fa';
import api from '../api';
import '../styles/Navbar.css';

function Navbar() {
  const [showDropdown, setShowDropdown] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isPetsitter, setIsPetsitter] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const checkRole = () => {
      const token = localStorage.getItem('access');
      if (token) {
        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          setIsAdmin(payload.role === 'admin');
        } catch (e) {
          setIsAdmin(false);
        }
      }
    };
    checkRole();
  }, []);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get('/api/v1/profile/');
        setIsPetsitter(res.data.is_petsitter || false);
      } catch (err) {
        setIsPetsitter(false);
      }
    };
    fetchProfile();
  }, []);

  useEffect(() => {
    const fetchUnreadCount = async () => {
      try {
        const res = await api.get('/api/v1/chats/unread-count/');
        setUnreadCount(res.data.unread_count);
      } catch (err) {
        console.error('Failed to fetch unread count:', err);
      }
    };
    fetchUnreadCount();

    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDropdown]);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-center">
        <Link to="/" className="nav-link">Home</Link>
        <Link to="/" className="nav-link">Find Petsitters</Link>
        <Link to="/visits" className="nav-link">My Visits</Link>
        {!isPetsitter && (
          <Link to="/join-petsitter" className="nav-link nav-link-accent">
            Become a Petsitter
          </Link>
        )}
        {isAdmin && (
          <Link to="/admin-users" className="nav-link nav-link-admin">
            Admin Panel
          </Link>
        )}
      </div>

      <div className="navbar-right">
        <Link to="/messages" className="navbar-icon-btn messages-btn">
          <FaEnvelope />
          {unreadCount > 0 && (
            <span className="badge">{unreadCount > 9 ? '9+' : unreadCount}</span>
          )}
        </Link>

        <div className="user-menu" ref={dropdownRef}>
          <button
            className="navbar-icon-btn user-btn"
            onClick={() => setShowDropdown(!showDropdown)}
          >
            <FaUser />
          </button>

          {showDropdown && (
            <div className="dropdown-menu">
              <Link to="/account" className="dropdown-item" onClick={() => setShowDropdown(false)}>
                <FaUser /> My Account
              </Link>
              <Link to="/account?tab=pets" className="dropdown-item" onClick={() => setShowDropdown(false)}>
                <FaPaw /> My Pets
              </Link>
              {isPetsitter && (
                <Link to="/account?tab=services" className="dropdown-item" onClick={() => setShowDropdown(false)}>
                  <FaBriefcase /> Services
                </Link>
              )}
              <div className="dropdown-divider"></div>
              <button className="dropdown-item logout-item" onClick={handleLogout}>
                <FaSignOutAlt /> Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
