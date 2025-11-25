import { Link, NavLink } from 'react-router-dom';
import './Header.css';
import Modal from '../Modal/Modal'
import { useState, useContext, useEffect, useRef } from 'react';
import { AuthContext } from './AuthContext';
import axios from 'axios';

export default function Header() {
    // уведомления
    const [visible, setVisible] = useState(false);
    const [shouldRender, setShouldRender] = useState(false);
    const showTooltip = () => {
        setShouldRender(true);
        setTimeout(() => {
            setVisible(true);
        }, 100);
    };
    const hideTooltip = () => {
        setVisible(false);
        setTimeout(() => {
            setShouldRender(false);
        }, 400);
    };
    function formatDate(dateString) {
        if (!dateString) {
            return '';
        }
        const date = new Date(dateString);
        return date.toLocaleDateString('ru-RU');
    }
    // бургер-меню
    const [isModalOpen, setIsOpen] = useState(false)
    const openModal = () => setIsOpen(true)
    const closeModal = () => setIsOpen(false)
    const { auth, logout } = useContext(AuthContext);
    const avatar = auth.user?.avatar ? `/store/avatars/${auth.user.avatar}` : '/img/avatar.svg';
    // поиск
    const [query, setQuery] = useState('');
    const [results, setResults] = useState({ psychologists: [], reviews: [] });
    const [searchCompleted, setSearchCompleted] = useState(false);
    const handleSearch = async (e) => {
        e.preventDefault();
        if (query.trim() === '') return;
        try {
            const response = await axios.get(`http://psychosearch/store/actions/search.php?query=${encodeURIComponent(query)}`);
            console.log('Ответ от сервера:', response.data);
            setResults({
                psychologists: Array.isArray(response.data.psychologists)
                    ? response.data.psychologists
                    : [],
                reviews: Array.isArray(response.data.reviews)
                    ? response.data.reviews
                    : [],
            });
            setSearchCompleted(true);
        } catch (error) {
            console.error('Ошибка поиска:', error);
            setSearchCompleted(true);
        }
    };
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const searchRef = useRef(null);
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setIsSearchOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);
    const handleCloseSearch = () => {
        setIsSearchOpen(false);
        setResults({ psychologists: [], reviews: [] });
        setSearchCompleted(false);
    };
    // уведомления
    const [notifications, setNotifications] = useState([]);
    useEffect(() => {
        axios.get(`http://psychosearch/store/actions/get_notifications.php?user_id=${auth?.user?.id}`)
            .then(res => {
                setNotifications(res.data);
            })
            .catch(err => console.error('Ошибка загрузки уведомлений', err));
    }, [auth.user]);
    const [allNotifications, setAllNotifications] = useState([]);
    useEffect(() => {
        axios.get(`http://psychosearch/store/actions/get_all_notifications.php?user_id=${auth?.user?.id}`)
            .then(res => {
                setAllNotifications(res.data);
            })
            .catch(err => console.error('Ошибка загрузки уведомлений', err));
    }, [auth.user]);
    // функция считывания уведомления
    const handleNotificationClick = (notificationId) => {
        axios.post('http://psychosearch/store/actions/mark_notification_read.php', {
            notification_id: notificationId
        }).then(() => {
            setNotifications(notifications.filter(n => n.id !== notificationId));
        });
    };
    const [isNotOpen, setIsNotOpen] = useState(false);
    const popupRef = useRef(null);
    const togglePopup = () => {
        setIsNotOpen(prev => !prev);
    };
    const handleClickOutside = (event) => {
        if (popupRef.current && !popupRef.current.contains(event.target)) {
            setIsNotOpen(false);
        }
    };
    useEffect(() => {
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);
    const sessionCount = notifications.filter(n => n.message.includes('запись') || n.message.includes('Ссылка')).length;
    const reviewCount = notifications.filter(n => n.message.includes('отзыв')).length;
    const vacancyCount = notifications.filter(n => n.message.includes('вакансию')).length;
    const allNotCount = notifications.length;
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
    // функция удаления старых уведомлений
    const deleteOldNotifications = () => {
        const now = new Date();
        const toDeleteIds = [];
        setAllNotifications((prevAll) => {
            const filtered = prevAll.filter(notification => {
                const createdAt = new Date(notification.created_at);
                const diffDays = (now - createdAt) / (1000 * 60 * 60 * 24);
                if (diffDays >= 3) {
                    toDeleteIds.push(notification.id);
                    return false;
                }
                return true;
            });
            if (toDeleteIds.length > 0) {
                axios.post('http://psychosearch/store/actions/delete_note.php', {
                    ids: toDeleteIds
                }, {
                    headers: { 'Content-Type': 'application/json' }
                })
                    .then(response => {
                        console.log('Уведомления удалены:', response.data);
                        setNotifications(prevNotifications =>
                            prevNotifications.filter(n => !toDeleteIds.includes(n.id))
                        );
                    })
                    .catch(error => {
                        console.error('Ошибка удаления уведомлений:', error);
                    });
            }
            return filtered;
        });
    };
    useEffect(() => {
        deleteOldNotifications();
        const interval = setInterval(deleteOldNotifications, 60000);
        return () => clearInterval(interval);
    }, []);
    return (
        <>
            {/* бургер-меню */}
            <div className="header-mobile">
                <div className="header-content">

                    <Link to="/" className='logo'><img src="/logo/logo.svg" alt="" /></Link>
                    <div className="btns">
                        {auth.isAuthenticated && (
                            <>
                                {notifications.length > 0 ? (
                                    <div className="notification">
                                        <img src="/icons/notification.svg" alt="Уведомление" />
                                        <div className={`notification-popup ${notifications.length > 2 ? 'scrollable' : ''}`}>
                                            {
                                                notifications.map(n => (
                                                    <div key={n.id} className="notification-item" >
                                                        {n.message} <div className='date'>{formatDate(n.created_at)}</div>
                                                        {(n.message.includes('запись') || n.message.includes('Ссылка')) ? (
                                                            <Link onClick={() => handleNotificationClick(n.id)} to="profile/sessions">
                                                                Посмотреть
                                                            </Link>
                                                        ) : (n.message.includes('отзыв') && auth.user?.role === 'psychologist') ? (
                                                            <Link onClick={() => handleNotificationClick(n.id)} to="profile/reviews">
                                                                Посмотреть
                                                            </Link>
                                                        ) : (n.message.includes('отзыв') && auth.user?.role === 'admin') ? (
                                                            <Link onClick={() => handleNotificationClick(n.id)} to="admin/reviews">
                                                                Посмотреть
                                                            </Link>
                                                        ) : (n.message.includes('вакансию') && auth.user?.role === 'admin') ? (
                                                            <Link onClick={() => handleNotificationClick(n.id)} to="admin/vacancies">
                                                                Посмотреть
                                                            </Link>
                                                        ) : null}
                                                    </div>
                                                ))}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="notification" ref={popupRef}>
                                        <img src="/icons/not.svg" alt="Уведомление" onClick={togglePopup} />
                                        <div className={`all-notification-popup ${isNotOpen ? '' : 'hidden'} ${allNotifications.length > 2 ? 'scrollable' : ''}`}>
                                            {allNotifications.length > 0 ? (
                                                allNotifications.map(n => (
                                                    <div className="notification-item" key={n.id}>
                                                        {n.message} <div className='date'>{formatDate(n.created_at)}</div>
                                                        {n.message.includes('запись') ? (
                                                            <Link onClick={() => setIsNotOpen(false)} to="profile/sessions">
                                                                Посмотреть
                                                            </Link>
                                                        ) : (n.message.includes('отзыв') && auth.user?.role === 'psychologist') ? (
                                                            <Link onClick={() => handleNotificationClick(n.id)} to="profile/reviews">
                                                                Посмотреть
                                                            </Link>
                                                        ) : (n.message.includes('отзыв') && auth.user?.role === 'admin') ? (
                                                            <Link onClick={() => handleNotificationClick(n.id)} to="admin/reviews">
                                                                Посмотреть
                                                            </Link>
                                                        ) : (n.message.includes('вакансию') && auth.user?.role === 'admin') ? (
                                                            <Link onClick={() => handleNotificationClick(n.id)} to="admin/vacancies">
                                                                Посмотреть
                                                            </Link>
                                                        ) : null}

                                                    </div>
                                                ))
                                            ) : (
                                                <div className="notification-item">Нет уведомлений</div>
                                            )}
                                        </div>
                                    </div>
                                )
                                }
                            </>
                        )}
                        <button onClick={openModal}>
                            <img src="/icons/menu.svg" alt="" />
                        </button>
                    </div>
                </div>
                <Modal isOpen={isModalOpen} onClose={closeModal}>
                    <div className="title-row">
                        <div className="title">
                            Меню
                        </div>
                    </div>
                    <div className="menu-content">
                        <form className='search-mobile' onSubmit={async (e) => {
                            e.preventDefault();
                            await handleSearch(e);
                            closeModal();
                        }}>
                            <input value={query} type="text" placeholder='Поиск...'
                                onChange={(e) => setQuery(e.target.value)} />
                            <button type="submit">
                                <img src="/icons/search.svg" alt="" />
                            </button>
                        </form>

                        {auth.isAuthenticated && (
                            <div className="hello">Здравствуйте, {auth.user.name}! 🖐🏻</div>
                        )}
                        <NavLink to="/" activeClassName="active" className='link' onClick={closeModal}> <img src="/icons/home.svg" alt="" />Главная</NavLink>
                        <NavLink to="/job" activeClassName="active" className='link' onClick={closeModal}><img src="/icons/job.svg" alt="" />Вакансии</NavLink>
                        <NavLink to="/catalog" activeClassName="active" className='link' onClick={closeModal}><img src="/icons/catalog.svg" alt="" />Психологи</NavLink>
                        {auth.isAuthenticated ? (
                            <>
                                {auth.user.role === 'admin' && (
                                    <NavLink to="/admin/" activeClassName="active" className='link' onClick={closeModal}>
                                        <img src="/icons/adminicon.svg" alt="" />  Администратор {allNotCount > 0 && <span className="badge">{allNotCount}</span>}</NavLink>)}
                                {['user', 'psychologist'].includes(auth.user.role) && (
                                    <NavLink activeClassName="active" className='link' onClick={closeModal} to="/profile/">
                                        <img src="/icons/usericon.svg" />
                                        Профиль
                                        {allNotCount > 0 && <span className="badge">{allNotCount}</span>}
                                    </NavLink>
                                )}
                                <div className="logout link" onClick={function () {
                                    logout();
                                    closeModal();
                                }

                                }>
                                    <img src="/icons/logout.svg" alt="" /> Выход
                                </div>
                            </>
                        ) : (
                            <>
                                <NavLink to="/login" className='link sign' onClick={closeModal}>Вход/регистрация</NavLink>
                            </>
                        )}
                        <div className="contacts">
                            <a href="">info@psychosearch.ru</a>
                            <div className="nets">
                                <a href=""><img src="/icons/tg.svg" alt="" /></a>
                                <a href=""><img src="/icons/vk.svg" alt="" /></a>
                            </div>
                            <a href="">+7 (000) - 899 - 56 - 56</a>
                        </div>
                    </div>
                </Modal>
            </div>
            {/* шапка */}
            <header className='header'>
                <Link to="/" className='logo'><img src="/logo/logo.svg" alt="" /></Link>
                <nav>
                    <Link to="catalog" className='link'>Психологи</Link>
                    <Link to="job" className='link'>Вакансии</Link>
                    <div className="link" id='search' ref={searchRef}>
                        {!isSearchOpen && <div className='text' onClick={() => {
                            setIsSearchOpen(true);
                        }}>Поиск</div>}
                        <form id='searchform' className={isSearchOpen ? 'open' : ''} >
                            <input id='input' value={query} type="text" placeholder='Поиск...'
                                onChange={(e) => setQuery(e.target.value)} />
                            <button onClick={handleSearch} type="submit">
                                <img src="/icons/search.svg" alt="" />
                            </button>
                        </form>
                    </div>
                </nav>
                <div className="btns">
                    {auth.isAuthenticated ? (
                        <>
                            {notifications.length > 0 ? (
                                <div className="notification">
                                    <img src="/icons/notification.svg" alt="Уведомление" />
                                    <div className={`notification-popup ${notifications.length > 2 ? 'scrollable' : ''}`}>
                                        {notifications.map(n => (
                                            <div key={n.id} className="notification-item" >
                                                {n.message} <div className='date'>{formatDate(n.created_at)}</div>
                                                {(n.message.includes('запись') || n.message.includes('Ссылка')) ? (
                                                    <Link onClick={() => handleNotificationClick(n.id)} to="profile/sessions">
                                                        Посмотреть
                                                    </Link>
                                                ) : (n.message.includes('отзыв') && auth.user.role === 'psychologist') ? (
                                                    <Link onClick={() => handleNotificationClick(n.id)} to="profile/reviews">
                                                        Посмотреть
                                                    </Link>
                                                ) : (n.message.includes('отзыв') && auth.user.role === 'admin') ? (
                                                    <Link onClick={() => handleNotificationClick(n.id)} to="admin/reviews">
                                                        Посмотреть
                                                    </Link>
                                                ) : (n.message.includes('вакансию') && auth.user.role === 'admin') ? (
                                                    <Link onClick={() => handleNotificationClick(n.id)} to="admin/vacancies">
                                                        Посмотреть
                                                    </Link>
                                                ) : null}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <div className="notification" ref={popupRef}>
                                    <img src="/icons/not.svg" alt="Уведомление" onClick={togglePopup} />
                                    <div className={`all-notification-popup ${isNotOpen ? '' : 'hidden'} ${allNotifications.length > 2 ? 'scrollable' : ''}`}>
                                        {allNotifications.length > 0 ? (
                                            allNotifications.map(n => (
                                                <div className="notification-item" key={n.id}>
                                                    {n.message} <div className='date'>{formatDate(n.created_at)}</div>
                                                    {n.message.includes('запись') ? (
                                                        <Link onClick={() => setIsNotOpen(false)} to="profile/sessions">
                                                            Посмотреть
                                                        </Link>
                                                    ) : (n.message.includes('отзыв') && auth.user.role === 'psychologist') ? (
                                                        <Link onClick={() => handleNotificationClick(n.id)} to="profile/reviews">
                                                            Посмотреть
                                                        </Link>
                                                    ) : (n.message.includes('отзыв') && auth.user.role === 'admin') ? (
                                                        <Link onClick={() => handleNotificationClick(n.id)} to="admin/reviews">
                                                            Посмотреть
                                                        </Link>
                                                    ) : (n.message.includes('вакансию') && auth.user.role === 'admin') ? (
                                                        <Link onClick={() => handleNotificationClick(n.id)} to="admin/vacancies">
                                                            Посмотреть
                                                        </Link>
                                                    ) : null}

                                                </div>
                                            ))
                                        ) : (
                                            <div className="notification-item">Нет уведомлений</div>
                                        )}
                                    </div>
                                </div>
                            )}
                            <div className="tooltip-container" onMouseEnter={showTooltip} onMouseLeave={hideTooltip}>
                                {auth.user.role === 'admin' && (
                                    <Link className='headerlink' to="/admin/">Администратор <img src="/icons/filteraccord.svg" alt="" /></Link>)}
                                {['user', 'psychologist'].includes(auth.user.role) && (
                                    <div key={auth.user?.name}>
                                        <Link className='headerlink' to="/profile/">
                                            <img className='av' src={avatar} alt="" />
                                            {auth.user?.name}
                                            <img src="/icons/filteraccord.svg" alt="" />
                                        </Link>
                                    </div>
                                )}
                                {shouldRender && (<div className={`tooltip ${visible ? 'visible' : ''}`}>
                                    <div className="tooltip-content">
                                        {['user', 'psychologist'].includes(auth.user.role) && (
                                            <NavLink to='/profile/info' activeClassName="active" className="menu-link" onClick={hideTooltip}><img src="/icons/profile.svg" alt="" />Личная информация</NavLink>
                                        )}
                                        {['psychologist'].includes(auth.user.role) && (
                                            <NavLink to='/profile/schedule' activeClassName="active" className="menu-link" onClick={hideTooltip}><img src="/icons/calendar.svg" alt="" />Расписание</NavLink>
                                        )}
                                        {['user', 'psychologist'].includes(auth.user.role) && (
                                            <NavLink to='/profile/sessions' activeClassName="active" className="menu-link" onClick={() => {
                                                handleMarkNotifications('session');
                                                hideTooltip();
                                            }}><img src="/icons/session.svg" alt="" />Сессии {sessionCount > 0 && <span className="badge">{sessionCount}</span>}</NavLink>
                                        )}
                                        {['user', 'psychologist'].includes(auth.user.role) && (
                                            <NavLink to='/profile/reviews' activeClassName="active" className="menu-link" onClick={() => {
                                                handleMarkNotifications('review');
                                                hideTooltip();
                                            }}><img src="/icons/revs.svg" alt="" />Отзывы {reviewCount > 0 && <span className="badge">{reviewCount}</span>}</NavLink>
                                        )}
                                        {auth.user.role === 'admin' && (
                                            <NavLink to='/admin/users' activeClassName="active" className="menu-link" onClick={hideTooltip}><img src="/icons/profile.svg" alt="" />Пользователи</NavLink>
                                        )}
                                        {auth.user.role === 'admin' && (
                                            <NavLink to='/admin/psychologists' activeClassName="active" className="menu-link" onClick={hideTooltip}><img src="/icons/psychos.svg" alt="" />Психологи</NavLink>
                                        )}
                                        {auth.user.role === 'admin' && (
                                            <NavLink to='/admin/sessions' activeClassName="active" className="menu-link" onClick={hideTooltip}><img src="/icons/session.svg" alt="" />Сессии</NavLink>
                                        )}
                                        {auth.user.role === 'admin' && (
                                            <NavLink to='/admin/topics' activeClassName="active" className="menu-link" onClick={hideTooltip}><img src="/icons/topic.svg" alt="" />Темы для сессий</NavLink>
                                        )}
                                        {auth.user.role === 'admin' && (
                                            <NavLink to='/admin/reviews' activeClassName="active" className="menu-link" onClick={() => {
                                                handleMarkNotifications('review');
                                                hideTooltip();
                                            }}><img src="/icons/revs.svg" alt="" />Отзывы {reviewCount > 0 && <span className="badge">{reviewCount}</span>}</NavLink>
                                        )}
                                        {auth.user.role === 'admin' && (
                                            <NavLink to='/admin/vacancies' activeClassName="active" className="menu-link" onClick={() => {
                                                handleMarkNotifications('vacancy');
                                                hideTooltip();
                                            }}><img src="/icons/vacancy.svg" alt="" />Вакансии {vacancyCount > 0 && <span className="badge">{vacancyCount}</span>}</NavLink>
                                        )}
                                        <div className="logout" onClick={logout}>
                                            <img src="/icons/logout.svg" alt="" /> Выход
                                        </div>
                                    </div>
                                </div>)}
                            </div>
                        </>
                    ) : (
                        <>
                            <Link to="login" className='sign' >Вход или регистрация</Link>
                        </>
                    )}
                </div>
            </header>
            {/* результаты поиска */}
            {searchCompleted && (results.psychologists.length > 0 || results.reviews.length > 0) ? (
                <div className="search-results">
                    <div className="close" onClick={handleCloseSearch}><img src="/icons/close.svg" alt="" /></div>
                    <p><img src="/icons/search.svg" alt="" /> Результаты глобального поиска:</p>
                    {results.psychologists.length > 0 && (
                        <div className="search-section">
                            <div className="section-title">Психологи</div>
                            <ul>
                                {results.psychologists.map((psy) => (
                                    <li key={psy.user_id}>
                                        <Link to={`/psychologist/${psy.user_id}`} onClick={() => {
                                            setIsSearchOpen(false);
                                            handleCloseSearch();
                                        }}>
                                            {psy.name}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                    {results.reviews.length > 0 && (
                        <div className="search-section">
                            <div className="section-title">Отзывы</div>
                            <ul>
                                {results.reviews.map((review) => (
                                    <li key={review.id}>
                                        <Link to={`/psychologist/${review.user_id}/reviews`} onClick={() => {
                                            setIsSearchOpen(false);
                                            handleCloseSearch();
                                        }}>
                                            {review.text.slice(0, 50)}...
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            ) : searchCompleted && (
                <div className="search-results">
                    <p><img src="/icons/search.svg" alt="" /> Результаты глобального поиска:</p>
                    <div className="close" onClick={handleCloseSearch}><img src="/icons/close.svg" alt="" /></div>
                    <div className="no-results">Ничего не найдено по Вашему запросу.</div>
                </div>
            )}
        </>
    )
}

