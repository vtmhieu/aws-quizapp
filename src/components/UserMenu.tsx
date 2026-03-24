import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

interface UserMenuProps {
  onSignInClick: () => void;
}

function UserMenu({ onSignInClick }: UserMenuProps) {
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!user) {
    return (
      <button className="user-menu__signin-btn" onClick={onSignInClick}>
        Sign In
      </button>
    );
  }

  const initial = (user.displayName || user.email || '?')[0].toUpperCase();
  const displayText = user.displayName || user.email || 'User';

  const handleLogout = async () => {
    setIsOpen(false);
    await logout();
  };

  return (
    <div className="user-menu" ref={menuRef}>
      <button
        className="user-menu__trigger"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="User menu"
      >
        <div className="user-menu__avatar">{initial}</div>
        <span className="user-menu__name">{displayText}</span>
        <span className="user-menu__chevron">{isOpen ? '▲' : '▼'}</span>
      </button>

      {isOpen && (
        <div className="user-menu__dropdown">
          <div className="user-menu__dropdown-header">
            <div className="user-menu__dropdown-email">{user.email}</div>
          </div>
          <button className="user-menu__dropdown-item" onClick={handleLogout}>
            <span>🚪</span> Sign Out
          </button>
        </div>
      )}
    </div>
  );
}

export default UserMenu;
