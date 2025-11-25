import './Menu.css'
import { NavLink } from 'react-router-dom';
import { AuthContext } from '../Header/AuthContext';
import { useContext, useState, useEffect } from 'react';
import axios from 'axios';
export default function Menu() {
    const { auth, logout } = useContext(AuthContext);
    const [notifications, setNotifications] = useState([]);
    useEffect(() => {
        axios.get(`http://psychosearch/store/actions/get_notifications.php?user_id=${auth?.user?.id}`)
            .then(res => {
                setNotifications(res.data);
            })
            .catch(err => console.error('Ошибка загрузки уведомлений', err));

    }, [auth.user]);
    const sessionCount = notifications.filter(n =>  n.message.includes('запись') || n.message.includes('Ссылка')).length;
    const reviewCount = notifications.filter(n => n.message.includes('отзыв')).length;
    const vacancyCount = notifications.filter(n => n.message.includes('вакансию')).length;
    const handleMarkNotifications = (type) => {
        const filtered = notifications.filter(n => n.type === type);
        const idsToRemove = filtered.map(n => n.id);
    
        if (idsToRemove.length === 0) return;
    
        axios.post('http://psychosearch/store/actions/mark_notification_read.php', {
            notification_ids: idsToRemove
        }).then(() => {
            setNotifications(prev => prev.filter(n => !idsToRemove.includes(n.id)));
        });
    };
    return (
        <>
            <div className='menu'>
                {['user', 'psychologist'].includes(auth.user.role) && (
                    <NavLink to='info' activeClassName="active" className="menu-link">
                        <img src="/icons/profile.svg" alt="" />Личная информация
                        </NavLink>
                )}
                {['psychologist'].includes(auth.user.role) && (
                    <NavLink to='schedule' activeClassName="active" className="menu-link"><img src="/icons/calendar.svg" alt="" />Расписание</NavLink>
                )}
                {['user', 'psychologist'].includes(auth.user.role) && (
                    <NavLink to='sessions' onClick={() => handleMarkNotifications('session')} activeClassName="active" className="menu-link"><img src="/icons/session.svg" alt="" />Сессии {sessionCount > 0 && <span className="badge">{sessionCount}</span>}</NavLink>
                )}
                {['user', 'psychologist'].includes(auth.user.role) && (
                    <NavLink to='reviews' onClick={() => handleMarkNotifications('review')} activeClassName="active" className="menu-link"><img src="/icons/revs.svg" alt="" />Отзывы   {reviewCount > 0 && <span className="badge">{reviewCount}</span>}</NavLink>
                )}
                {auth.user.role === 'admin' && (
                    <NavLink to='users' activeClassName="active" className="menu-link"><img src="/icons/profile.svg" alt="" />Пользователи</NavLink>
                )}
                {auth.user.role === 'admin' && (
                    <NavLink to='psychologists' activeClassName="active" className="menu-link"><img src="/icons/psychos.svg" alt="" />Психологи</NavLink>
                )}
                {auth.user.role === 'admin' && (
                    <NavLink to='sessions' activeClassName="active" className="menu-link"><img src="/icons/session.svg" alt="" />Сессии</NavLink>
                )}
                {auth.user.role === 'admin' && (
                    <NavLink to='topics' activeClassName="active" className="menu-link"><img src="/icons/topic.svg" alt="" />Темы для сессий</NavLink>
                )}
                {auth.user.role === 'admin' && (
                    <NavLink to='reviews' onClick={() => handleMarkNotifications('review')}  activeClassName="active" className="menu-link"><img src="/icons/revs.svg" alt="" />Отзывы {reviewCount > 0 && <span className="badge">{reviewCount}</span>}</NavLink>
                )}
                {auth.user.role === 'admin' && (
                    <NavLink to='vacancies' onClick={() => handleMarkNotifications('vacancy')}  activeClassName="active" className="menu-link"><img src="/icons/vacancy.svg" alt="" />Вакансии {vacancyCount > 0 && <span className="badge">{vacancyCount}</span>}</NavLink>
                )}
                <div className="logout">
                    <div className="log" onClick={logout}>
                        <img src="/icons/logout.svg" alt="" />
                        Выход
                    </div>
                </div>
            </div>
        </>
    )
}