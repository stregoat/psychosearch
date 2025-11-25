import { createContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
export const AuthContext = createContext();
export const AuthProvider = ({ children }) => {
    const navigate = useNavigate();
    // Инициализация состояния авторизации из localStorage или установка значений по умолчанию
    const [auth, setAuth] = useState(() => {
        const storedAuth = JSON.parse(localStorage.getItem('authData'));
        return storedAuth || {
            isAuthenticated: false,
            user: null,
            accessToken: null,
            refreshToken: null,
        };
    });
    useEffect(() => {
        localStorage.setItem('authData', JSON.stringify(auth));
    }, [auth]);
    // Функция входа
    const login = (userData, accessToken, refreshToken) => {
        setAuth({
            isAuthenticated: true,
            user: userData,
            accessToken: accessToken,
            refreshToken: refreshToken,
        });
    };
    // Функция выхода
    const logout = () => {
        setAuth({
            isAuthenticated: false,
            user: null,
            accessToken: null,
            refreshToken: null,
        });
        navigate('/login');
    };
    // Обновление access-токена с использованием refresh-токена
    const refreshAccessToken = async () => {
        try {
            const response = await axios.post('http://psychosearch/store/actions/refresh_token.php', {
                refresh_token: auth.refreshToken,
            });
            const newAccessToken = response.data.access_token;
            setAuth((prevAuth) => ({
                ...prevAuth,
                accessToken: newAccessToken,
            }));
            return newAccessToken;
        } catch (error) {
            logout();
            throw error;
        }
    };
    // Функция обновления данных пользователя в состоянии авторизации
    const onUserUpdate = (updatedData) => {
        setAuth((prevAuth) => ({
            ...prevAuth,
            user: {
                ...prevAuth.user,
                ...updatedData,
            },
        }));
    };
    return (
        <AuthContext.Provider value={{ auth, login, logout, refreshAccessToken, onUserUpdate }}>
            {children}
        </AuthContext.Provider>
    );
};
