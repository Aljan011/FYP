import React, { useEffect, useState } from "react";
import axiosInstance from "../axiosInstance";
import ChatBox from "../components/ChatBox";
import { useNavigate } from "react-router-dom";
import "../css/ChatPage.css";

const getRoomName = (id1, id2) => {
  const sorted = [id1, id2].sort((a, b) => a - b);
  return `room${sorted[0]}_${sorted[1]}`;
};

const ChatPage = () => {
  const [partners, setPartners] = useState([]);
  const [selectedPartner, setSelectedPartner] = useState(null);
  const [userId, setUserId] = useState(null);
  const [authToken, setAuthToken] = useState(null);
  const [darkMode, setDarkMode] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [userRole, setUserRole] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const savedDarkMode = localStorage.getItem("darkMode") === "true";
    setDarkMode(savedDarkMode);

    if (savedDarkMode) {
      document.body.classList.add("dark-mode");
    }

    const token = localStorage.getItem("authToken");
    const storedUserId = localStorage.getItem("userId");
    const storedRole = localStorage.getItem("userRole");

    if (token && storedUserId && storedRole) {
      setAuthToken(token);
      const currentUserId = parseInt(storedUserId);
      setUserId(currentUserId);
      setUserRole(storedRole);

      axiosInstance.defaults.headers["Authorization"] = `Token ${token}`;

      axiosInstance
        .get(`/chat-partners-for-user/${currentUserId}/`)
        .then((response) => {
          console.log("Partner data:", response.data);
          setPartners(response.data);
        })
        .catch((error) => console.error("Failed to load chat partners", error));
    } else {
      console.error("Missing userId, token, or role");
    }
  }, []);

  const refreshPartners = () => {
  axiosInstance
    .get(`/chat-partners-for-user/${userId}/`)
    .then((response) => {
      const updated = response.data;
      setPartners([...updated]); // ensure array reference is new

      //  Force a re-render of selectedPartner if it's still in the list
      const refreshed = updated.find(p => p.id === selectedPartner?.id);
      if (refreshed) {
        setSelectedPartner({ ...refreshed }); // force new object
      }
    })
    .catch((error) => console.error("Failed to reload partners", error));
};

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem("darkMode", newMode);

    if (newMode) {
      document.body.classList.add("dark-mode");
    } else {
      document.body.classList.remove("dark-mode");
    }
  };

  const selectPartner = (partner) => {
    setSelectedPartner(partner);
    refreshPartners();
  };

  const filteredPartners = partners.filter((partner) =>
    partner.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className={`chatpage-fullscreen ${darkMode ? "dark-mode" : ""}`}>
      <div className="sidebar">
        <div className="sidebar-header">
          <button className="go-back-button" onClick={() => navigate("/UserDash")}>← Back</button>
          <h2>Messages</h2>
          <button 
            className="dark-mode-toggle" 
            onClick={toggleDarkMode}
            aria-label="Toggle dark mode"
          >
            {darkMode ? "🌙" : "☀️"}
          </button>
        </div>

        <div className="search-container">
          <input 
            type="text" 
            placeholder={`Search ${userRole === 'trainer' ? 'users' : 'trainers'}...`} 
            className="search-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="trainers-container">
          <h3 className="section-title">
            {userRole === 'trainer' ? 'Your Users' : 'Your Trainers'}
          </h3>
          {filteredPartners.length === 0 ? (
            <p>No {userRole === 'trainer' ? 'users' : 'trainers'} found.</p>
          ) : (
            <ul className="trainer-list">
              {filteredPartners.map((partner) => (
                <li
                  key={partner.id}
                  onClick={() => selectPartner(partner)}
                  className={`trainer-item ${selectedPartner?.id === partner.id ? "active" : ""}`}
                >
                  <div className="trainer-avatar">
                    {partner.username?.charAt(0).toUpperCase()}
                  </div>
                  <div className="trainer-info">
                    <div className="trainer-name">
  {partner.username}
  {partner.unread_count > 0 && (
    <span className="unread-dot" title={`${partner.unread_count} unread message(s)`}></span>
  )}
</div>
                    {/* <div className="trainer-status">
                      <span className="status-indicator online"></span> Online
                    </div> */}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="chat-area">
        {selectedPartner && userId ? (
          <ChatBox
            senderId={userId}
            receiverId={selectedPartner.id}
            roomName={getRoomName(userId, selectedPartner.id)}
            token={authToken}
            darkMode={darkMode}
            userRole={userRole} //  pass role to ChatBox
            onNewMessage={refreshPartners}

          />
        ) : (
          <div className="empty-chat">
            <h3>Welcome to Chat</h3>
            <p>Select a chat partner to start messaging</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatPage;
