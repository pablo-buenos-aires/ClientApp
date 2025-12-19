import React from 'react';
import './UserListModal.scss';

// Define the User type
interface User {
  id: string;
  name: string;
  bio: string;
  photo_url: string;
}

interface UserListModalProps {
  isOpen: boolean;
  onClose: () => void;
  users: User[];
}

const UserListModal: React.FC<UserListModalProps> = ({ isOpen, onClose, users }) => {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="close-button" onClick={onClose}>&times;</button>
        <h2>Найденные пользователи</h2>
        <ul className="user-list">
          {users.length > 0 ? (
            users.map(user => (
              <li key={user.id} className="user-item">
                <img src={user.photo_url || 'https://via.placeholder.com/50'} alt={user.name} className="user-avatar" />
                <div className="user-info">
                  <div className="user-name">{user.name}</div>
                  <p className="user-bio">{user.bio}</p>
                </div>
              </li>
            ))
          ) : (
            <p>Пользователи не найдены.</p>
          )}
        </ul>
      </div>
    </div>
  );
};

export default UserListModal;
