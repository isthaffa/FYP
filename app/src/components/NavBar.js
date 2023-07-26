import React from 'react';

const headerStyles = {
  backgroundColor: '#3399FF',
  color: '#fff',
  padding: '1rem',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
};

const logoStyles = {
  fontSize: '24px',
  fontWeight: 'bold',
};

const menuContainerStyles = {
  display: 'flex',
  alignItems: 'center',
};

const menuItemStyles = {
  marginLeft: '1.5rem',
  color: '#fff',
  textDecoration: 'none',
  fontSize: '16px',
  fontWeight: 'normal',
  textTransform: 'uppercase',
  letterSpacing: '1px',
  transition: 'color 0.3s ease-in-out',
};

const activeMenuItemStyles = {
  ...menuItemStyles,
  fontWeight: 'bold',
};

const Header = () => {
  return (
    <div style={headerStyles}>
      <div style={logoStyles}>SSL</div>
      <div style={menuContainerStyles}>
        <a
          href="/"
          style={
            window.location.pathname === '/'
              ? activeMenuItemStyles
              : menuItemStyles
          }
        >
          Home
        </a>
        <a
          href="/learning"
          style={
            window.location.pathname === '/learning'
              ? activeMenuItemStyles
              : menuItemStyles
          }
        >
          Learning
        </a>
      </div>
    </div>
  );
};

export default Header;
