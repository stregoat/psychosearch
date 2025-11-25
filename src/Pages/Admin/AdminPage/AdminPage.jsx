import { useEffect, useState, useContext } from "react";
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../../../Components/Header/AuthContext';
import './Admin.css';
import Users from '../Users';
import User from '../User';
import Psychologists from '../Psychologists';
import AddPsychologist from '../AddPsychologist';
import Vacancy from '../Vacancy';
import VacancyMore from '../VacancyMore';
import Psychologist from '../Psychologist';
import Sessions from '../Sessions';
import Topics from '../Topics';
import AddTopic from '../AddTopic';
import Review from '../Review';
import Menu from '../../../Components/Menu/Menu';

export default function AdminPage() {
    const { auth, logout } = useContext(AuthContext);
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
        } catch (error) {
            setError('Ошибка загрузки данных');
            logout();
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (auth.isAuthenticated) {
            fetchUserData();
        }
    }, [auth]);

    useEffect(() => {
        if (!auth.isAuthenticated) {
            logout();
            navigate('/');
        }
    }, [auth, logout, navigate]);

    useEffect(() => {
        if (userData && userData.role !== 'admin') {
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
        <div className="admin-row">
            <Menu />
            <div className="admin">
                <Routes>
                    <Route path="" element={<Navigate to="users" />} />
                    <Route path="users" element={<Users />} />
                    <Route path="reviews" element={<Review />} />
                    <Route path="sessions" element={<Sessions />} />
                    <Route path="psychologists" element={<Psychologists />} />
                    <Route path="topics" element={<Topics />} />
                    <Route path="vacancies" element={<Vacancy />} />
                    <Route path="topics/addtopic" element={<AddTopic />} />
                    <Route path="users/user/:id" element={<User />} />
                    <Route path="vacancies/vacancy/:id" element={<VacancyMore />} />
                    <Route path="psychologists/psychologist/:id" element={<Psychologist />} />
                    <Route path="psychologists/addpsychologist" element={<AddPsychologist />} />
                </Routes>
            </div>
        </div>
    );
}
