import { useEffect, useState, useContext } from "react";
import { useNavigate, Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../../../Components/Header/AuthContext';
import './ProfilePage.css';
import Menu from '../../../Components/Menu/Menu';
import Profile from '../Info/Profile';
import Schedule from '../Schedule/Schedule';
import Session from '../Session/Session';
import Reviews from '../Reviews/Reviews';

export default function ProfilePage() {
    const { auth, logout, onUserUpdate } = useContext(AuthContext);
    const navigate = useNavigate();

    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchUserData = async () => {
        try {
            const response = await axios.post(
                'http://psychosearch/store/actions/profile.php',
                {},
                {
                    headers: {
                        'Authorization': `Bearer ${auth.accessToken}`,
                    },
                }
            );

            if (response.data.success) {
                setUserData(response.data.user);
            } else {
                setError(response.data.message);
            }
        } 
        catch (error) {
            setError('Ошибка загрузки данных');
            logout();
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (auth.isAuthenticated) {
            fetchUserData();
        } else {
            logout();
            navigate('/');
        }
    }, [auth, logout, navigate]);

    useEffect(() => {
        if (userData && userData.role !== 'user' && userData.role !== 'psychologist') {
            navigate('/');
        }
    }, [userData, navigate]);

    if (loading) {
        return <div>Загрузка...</div>;
    }

    if (error) {
        return <div>{error}</div>;
    }

    return (
        <div className="profile-row">
            <Menu />
            <div className="profile">
                <Routes>
                    <Route path="" element={<Navigate to="info" />} />
                    <Route 
                        path="info"
                        element={
                            <Profile
                                userData={userData}
                                accessToken={auth.accessToken}
                                onUserUpdate={onUserUpdate}
                            /> 
                        } 
                    />
                    <Route path="sessions" element={<Session />} />
                    <Route path="reviews" element={<Reviews />} />
                    <Route path="schedule" element={<Schedule />} />
                </Routes>
            </div>
        </div>
    );
}
