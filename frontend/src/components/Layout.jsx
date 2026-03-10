// frontend/src/components/Layout.jsx
import { Box } from '@mantine/core';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';

export default function Layout() {
  return (
    <Box
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        background: '#f9f9f9',
      }}
    >
      <Header />
      <Box component="main" style={{ flex: 1 }}>
        <Outlet />
      </Box>
      <Footer />
    </Box>
  );
}