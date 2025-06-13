// import React, { useState } from 'react';
// import { TextField, Button, Typography, Container, Box } from '@mui/material';

// const Login = () => {
//     const [username, setUsername] = useState('');
//     const [password, setPassword] = useState('');
//     const [error, setError] = useState('');
//     const [success, setSuccess] = useState('');

//     const handleSubmit = async (e) => {
//         e.preventDefault();
//         setError('');
//         setSuccess('');

//     // try {
//     //     const response = await fetch('http://127.0.0.1:8000/api/login/', {
//     //         method: 'POST',
//     //         headers: {
//     //             'Content-Type': 'application/json',
//     //         },
//     //         body: JSON.stringify({ username, password }),
//     //     });

//     try {
//         const response = await fetch('http://127.0.0.1:8000/api/login/', {
//             method: 'POST',
//             headers: {
//                 'Content-Type': 'application/json',
//             },
//             body: JSON.stringify({ username, password }),
//         });
    
//         if (!response.ok) {
//             throw new Error(`HTTP error! Status: ${response.status}`);
//         }
    
//         const data = await response.json(); // Ensure it's JSON
//         console.log("Login Successful", data);
//         if (!response.ok) {
//             throw new Error(data.detail || 'Login failed');
//         }
    
//         // ✅ If login is successful
//         setSuccess('Login successful!');
//         console.log('Login successful:', data); // Debugging
//     } catch (error) {
//         console.error('Error:', error.message);
//         setError(error.message || 'Network error. Please try again.');
//     }
//             throw new Error(data.detail || 'Login failed');
//         }
        
// return (
//         <Container maxWidth="xs">
//             <Box 
//                 sx={{ 
//                     display: 'flex', 
//                     flexDirection: 'column', 
//                     alignItems: 'center', 
//                     justifyContent: 'center', 
//                     padding: 3,
//                     boxShadow: 3, 
//                     borderRadius: 2 
//                 }}
//             >
//                 <Typography variant="h5" component="h2" gutterBottom>
//                     Login
//                 </Typography>
//                 <form onSubmit={handleSubmit} style={{ width: '100%' }}>
//                     <TextField
//                         label="Username"
//                         variant="outlined"
//                         fullWidth
//                         value={username}
//                         onChange={(e) => setUsername(e.target.value)}
//                         required
//                         margin="normal"
//                     />
//                     <TextField
//                         label="Password"
//                         variant="outlined"
//                         type="password"
//                         fullWidth
//                         value={password}
//                         onChange={(e) => setPassword(e.target.value)}
//                         required
//                         margin="normal"
//                     />
//                     <Button 
//                         type="submit" 
//                         variant="contained" 
//                         color="primary" 
//                         fullWidth
//                         sx={{ marginTop: 2 }}
//                     >
//                         Login
//                     </Button>
//                 </form>
//                 {error && <Typography color="error" variant="body2" sx={{ marginTop: 2 }}>{error}</Typography>}
//                 {success && <Typography color="success" variant="body2" sx={{ marginTop: 2 }}>{success}</Typography>}
//             </Box>
//         </Container>
//     );
// };

// export default Login;
