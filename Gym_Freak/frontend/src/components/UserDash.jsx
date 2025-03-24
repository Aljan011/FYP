import React from 'react';
import { Typography, Box, Container } from '@mui/material';

const UserDash = () => {
    return (
        <Container maxWidth="md">
            <Box 
                sx={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    padding: 3,
                    boxShadow: 3, 
                    borderRadius: 2 
                }}
            >
                <Typography variant="h4" component="h1" gutterBottom>
                    Welcome to Your Dashboard
                </Typography>
                <Typography variant="body1" color="textSecondary">
                    This is the main user dashboard page. You can manage your account, view progress, and more.
                </Typography>
            </Box>
        </Container>
    );
};

export default UserDash;
