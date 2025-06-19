// src/pages/UserProfile.tsx
import React from 'react';
import { useAppSelector } from '../store/hooks';
import { Container, Paper, Typography, Box, Avatar, Grid, Divider } from '@mui/material';
import { Navigate } from 'react-router-dom';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';

const UserProfile = () => {
    // Получаем данные пользователя из Redux store
    const { user } = useAppSelector((state) => state.auth);

    // Если пользователь не аутентифицирован, перенаправляем на страницу входа
    if (!user) {
        return <Navigate to="/login" replace />;
    }

    return (
        <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
            <Paper elevation={3} sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
                <Grid container spacing={3} alignItems="center">
                    {/* Аватар и Заголовок */}
                    <Grid item xs={12} sx={{ textAlign: 'center' }}>
                        <Avatar
                            sx={{
                                width: 100,
                                height: 100,
                                mb: 2,
                                bgcolor: 'primary.main',
                                margin: 'auto'
                            }}
                        >
                            {/* Используем иконку, если нет аватара, или первую букву */}
                            {user.username ? user.username[0].toUpperCase() : <AccountCircleIcon sx={{ width: 60, height: 60 }} />}
                        </Avatar>
                        <Typography variant="h4" component="h1" gutterBottom>
                            {user.username}'s Profile
                        </Typography>
                        <Divider sx={{ my: 1 }}/>
                    </Grid>

                    {/* Информация о пользователе */}
                    <Grid item xs={12} sm={6}>
                        <Typography variant="overline" display="block" color="text.secondary">
                            Username
                        </Typography>
                        <Typography variant="body1">{user.username}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <Typography variant="overline" display="block" color="text.secondary">
                            Email
                        </Typography>
                        <Typography variant="body1">{user.email || 'Not Provided'}</Typography>
                    </Grid>

                    {/* Добавьте другие поля, если они есть в вашем объекте user из Redux */}
                    {/* Например:
                    <Grid item xs={12} sm={6}>
                         <Typography variant="overline" display="block" color="text.secondary">
                            First Name
                        </Typography>
                        <Typography variant="body1">{user.first_name || 'Not Provided'}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                         <Typography variant="overline" display="block" color="text.secondary">
                            Last Name
                        </Typography>
                        <Typography variant="body1">{user.last_name || 'Not Provided'}</Typography>
                    </Grid>
                    */}

                </Grid>

                {/* Сюда можно добавить кнопки для действий (смена пароля, редактирование) */}
                {/* <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end' }}>
                    <Button variant="outlined" sx={{ mr: 1 }} disabled>Edit Profile</Button>
                    <Button variant="contained" color="secondary" disabled>Change Password</Button>
                </Box> */}
            </Paper>
        </Container>
    );
};

export default UserProfile;