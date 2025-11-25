import './Session.css';
import axios from 'axios';
import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../../Components/Header/AuthContext';
import Modal from '../../../Components/Modal/Modal';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
export default function Session() {
    const [sessions, setSessions] = useState([]);
    const [newLink, setNewLink] = useState('');
    const { auth } = useContext(AuthContext);
    const [isModalOpen, setIsOpen] = useState(false);
    const [isDeleteOpen, setIsDelete] = useState(false);
    const [isCancelOpen, setIsCancel] = useState(false);
    const [isReviewOpen, setIsReview] = useState(false);
    const [currentSessionId, setCurrentSessionId] = useState(null);
    const navigate = useNavigate();
    const [filter, setFilter] = useState('Ожидается');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 2;
    const openModal = (sessionId) => {
        setCurrentSessionId(sessionId);
        setIsOpen(true);
        document.body.style.overflow = 'hidden';
    };
    const closeModal = () => {
        setIsOpen(false);
        document.body.style.overflow = '';
        setNewLink('');
    };
    const openDelete = () => {
        setIsDelete(true);
        document.body.style.overflow = 'hidden';
    };
    const closeDelete = () => {
        setIsDelete(false);
        document.body.style.overflow = '';
    };
    const openCancel = () => {
        setIsCancel(true);
        document.body.style.overflow = 'hidden';
    };
    const closeCancel = () => {
        setIsCancel(false);
        document.body.style.overflow = '';
    };
    const openReview = () => {
        setIsReview(true);
        document.body.style.overflow = 'hidden';
    };
    const closeReview = () => {
        setIsReview(false);
        document.body.style.overflow = '';
    };
    const avatarBaseUrl = 'http://psychosearch/store/avatars/';
    const defaultAvatar = 'http://psychosearch/public/img/avatar.svg';
    useEffect(() => {
        let url = '';
        if (auth.user.role === 'user') {
            url = 'http://psychosearch/store/actions/get_user_sessions.php';
        } else if (auth.user.role === 'psychologist') {
            url = 'http://psychosearch/store/actions/get_psychologist_sessions.php';
        }
        axios.get(url, {
            params: { user_id: auth.user.id }
        })
            .then(response => {
                if (response.data.success) {
                    setSessions(response.data.sessions);
                } else {
                    console.error('Сессии не найдены');
                }
            })
            .catch(error => {
                console.error('Ошибка при получении сессий:', error);
            });
    }, [auth.user.id, auth.user.role]);
    // обновление статуса сессии
    useEffect(() => {
        const updateSessionStatus = () => {
            setSessions(prevSessions => {
                const now = new Date();
                prevSessions.forEach(session => {
                    const sessionDate = new Date(`${session.date} ${session.time}`);
                    if (session.status === 'Отменена' || sessionDate > now) return;

                    const newStatus = session.link
                        ? 'Прошла'
                        : 'Отменена';

                    axios.post('http://psychosearch/store/actions/update_session_status.php', {
                        id: session.id,
                        status: newStatus
                    }, {
                        headers: { 'Content-Type': 'application/json' }
                    }).then(response => {
                        console.log('Сессия обновлена:', response.data);
                        setSessions(currentSessions =>
                            currentSessions.map(s =>
                                s.id === session.id ? { ...s, status: newStatus } : s
                            )
                        );
                    }).catch(error => {
                        console.error('Ошибка при обновлении сессии:', error);
                    });
                });
                return prevSessions;
            });
        };
        updateSessionStatus();
        const interval = setInterval(updateSessionStatus, 60000);
        return () => clearInterval(interval);
    }, []);
    // пагинация
    const filteredSessions = sessions.filter(session => session.status === filter);
    const totalPages = Math.ceil(filteredSessions.length / itemsPerPage);
    const goToPage = (pageNumber) => {
        setCurrentPage(pageNumber);
    };
    const awaitingCount = sessions.filter(session => session.status === 'Ожидается').length;
    const canceledCount = sessions.filter(session => session.status === 'Отменена').length;
    const pastCount = sessions.filter(session => session.status === 'Прошла').length;
    const getSessionLabel = (count) => {
        if (count % 10 === 1 && count % 100 !== 11) {
            return 'сессия';
        } else if (count % 10 >= 2 && count % 10 <= 4 && (count % 100 < 10 || count % 100 >= 20)) {
            return 'сессии';
        } else {
            return 'сессий';
        }
    };
    // добавление ссылки
    const handleSaveLink = () => {
        axios.post('http://psychosearch/store/actions/add_link.php', {
            session_id: currentSessionId,
            link: newLink
        })
            .then(response => {
                if (response.data.success) {
                    setSessions(sessions.map(session =>
                        session.id === currentSessionId ? { ...session, link: newLink } : session
                    ));
                    closeModal();
                    toast.success(`Ссылка успешно добавлена!`);
                } else {
                    setMessageLink(response.data.message);
                    setMessageTypeLink('err');
                }
            })
            .catch(error => {
                console.error('Ошибка при добавлении ссылки:', error);
            });
    };
    // удаление ссылки
    const handleDeleteLink = (sessionId) => {
        axios.post('http://psychosearch/store/actions/delete_link.php', { session_id: sessionId })
            .then(response => {
                if (response.data.success) {
                    setSessions(prevSessions =>
                        prevSessions.map(session =>
                            session.id === sessionId ? { ...session, link: null } : session
                        )
                    );
                    closeDelete();
                    toast.success(`Ссылка успешно удалена!`);
                } else {
                    console.error('Ошибка при удалении ссылки');
                }
            })
            .catch(error => {
                console.error('Ошибка при удалении ссылки:', error);
            });
    };
    // отмена сессии
    const handleCancelSession = (sessionId) => {
        axios.post('http://psychosearch/store/actions/cancel_session.php', { session_id: sessionId })
            .then(response => {
                if (response.data.success) {
                    setSessions(prevSessions =>
                        prevSessions.map(session =>
                            session.id === sessionId ? { ...session, status: 'Отменена' } : session
                        )
                    );
                    toast.success(`Сессия успешно отменена!`);
                    localStorage.removeItem('confirmedSlotId');
                    closeCancel();
                } else {
                    console.error('Ошибка при отмене сессии');
                }
            })
            .catch(error => {
                console.error('Ошибка при отмене сессии:', error);
            });
    };
    const [rating, setRating] = useState(0);
    const [reviewText, setReviewText] = useState('');
    const handleStarClick = (index) => {
        setRating(index + 1);
    }
    const [messageLink, setMessageLink] = useState('');
    const [messageTypeLink, setMessageTypeLink] = useState('');
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState('');
    // добавление отзыва
    const handleAddReview = async (sessionId, psychologistId) => {
        const requestData = {
            session_id: sessionId,
            psychologist_id: psychologistId,
            user_id: auth.user.id,
            rating: rating,
            text: reviewText
        };
        try {
            const response = await axios.post('http://psychosearch/store/actions/add_review.php', requestData, {
                headers: { 'Content-Type': 'application/json' }
            });
            if (response.data.success) {
                toast.success(`Отзыв успешно добавлен!`);
                navigate('/profile/reviews')
                closeReview();
            } else {
                setMessage(response.data.message);
                setMessageType('err');
            }
        } catch (error) {
            console.error('Ошибка при отправке отзыва:', error);
        }
    }
    const [reviews, setReviews] = useState([]);
    useEffect(() => {
        const fetchUserReviews = async () => {
            try {
                const response = await axios.get('http://psychosearch/store/actions/get_user_reviews.php', {
                    params: {
                        user_id: auth.user.id
                    }
                });
                setReviews(response.data.reviews);
            } catch (err) {
                console.error('Ошибка при получении отзывов:', err);
            }
        };
        if (auth.user.id) {
            fetchUserReviews();
        }
    }, [auth.user.id]);
    return (
        <>
            <div className="session">
                <div className="session-nav">
                    <div
                        className={`session-link ${filter === 'Ожидается' ? 'active' : ''}`}
                        onClick={() => setFilter('Ожидается')}
                    >
                        <div className="count">{awaitingCount}</div>
                        Ожидаемые <br /> {getSessionLabel(awaitingCount)}
                    </div>
                    <div
                        className={`session-link ${filter === 'Отменена' ? 'active' : ''}`}
                        onClick={() => setFilter('Отменена')}
                    >
                        <div className="count">{canceledCount}</div>
                        Отмененные <br /> {getSessionLabel(canceledCount)}
                    </div>
                    <div
                        className={`session-link ${filter === 'Прошла' ? 'active' : ''}`}
                        onClick={() => setFilter('Прошла')}
                    >
                        <div className="count">{pastCount}</div>
                        Прошедшие <br /> {getSessionLabel(pastCount)}
                    </div>
                </div>
                <div className="session-content">
                    {filteredSessions.length === 0 ? (
                        <p>Нет сессий с выбранным статусом.</p>
                    ) : (
                        filteredSessions.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((session, index) => {
                            const dateObj = new Date(session.date);
                            const dayMonth = new Intl.DateTimeFormat('ru-RU', {
                                day: 'numeric',
                                month: 'long'
                            }).format(dateObj);
                            const weekday = new Intl.DateTimeFormat('ru-RU', {
                                weekday: 'long'
                            }).format(dateObj).toLowerCase();

                            const formattedDate = `${dayMonth}, ${weekday}`;

                            const hasReview = reviews.some(
                                review =>
                                    review.u_id === auth.user.id &&
                                    review.p_id === session.p_id
                            );
                            return (
                                <div key={index} className="session-card">
                                    <div className="name">
                                        <img src={session.avatar ? `${avatarBaseUrl}${session.avatar}` : defaultAvatar} alt="" />
                                        <p>{session.name}</p>
                                    </div>
                                    <div className="data">
                                        <div className="label">
                                            <img src="/icons/date.svg" alt="" />
                                            Дата и время
                                        </div>
                                        <p>{formattedDate}, {session.time}</p>
                                    </div>
                                    <div className="data">
                                        <div className="label">
                                            <img src="/icons/ruble.svg" alt="" />
                                            Стоимость сеанса
                                        </div>
                                        <p>{session.price.toLocaleString('ru-RU')} ₽</p>
                                    </div>
                                    {auth.user.role === 'user' && session.status === 'Прошла' && !hasReview && (
                                        <div className="add_rev" onClick={openReview}>
                                            Оставить отзыв <img src="/icons/edt.svg" alt="" />
                                            {isReviewOpen && (
                                                <div className="add_review">
                                                    <Modal isOpen={isReviewOpen} onClose={closeReview}>
                                                        <h6>Оставить отзыв</h6>
                                                        <div className="label">
                                                            Оценка
                                                            <div className='review'>
                                                                <div className="star-rating">
                                                                    {[...Array(5)].map((_, index) => (
                                                                        <img
                                                                            key={index}
                                                                            src={index < rating ? '/icons/star.svg' : '/icons/empty_star.svg'}
                                                                            alt={`star-${index}`}
                                                                            onClick={() => handleStarClick(index)}

                                                                        />
                                                                    ))}
                                                                </div>
                                                                <p>({rating}/5)</p>
                                                            </div>
                                                        </div>
                                                        <div className="label">
                                                            Текст отзыва
                                                            <textarea
                                                                className="inputlink"
                                                                maxLength={200}
                                                                placeholder="Поделитесь своими впечатлениями о специалисте. Пожалуйста, не используйте нецензурную лексику."
                                                                value={reviewText}
                                                                onChange={(e) => setReviewText(e.target.value)}
                                                            ></textarea>
                                                            <div className="char-counter">{reviewText.length}/200</div>
                                                        </div>
                                                        {message && (
                                                            <div className="message">
                                                                <p className={messageType}>{message}</p>
                                                            </div>
                                                        )}
                                                        <div className="row">
                                                            <button type="button" className="cancelbtn" onClick={closeReview}>Отменить</button>
                                                            <button type="button" className="subtitle-btn" onClick={() => handleAddReview(session.id, session.p_id)}>Сохранить</button>
                                                        </div>
                                                    </Modal>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                    {session.status === 'Ожидается' && (
                                        <div className="data">
                                            <div className="label">
                                                <img src="/icons/link.svg" alt="" />
                                                Ссылка на Google Meet
                                            </div>
                                            <div className="link">
                                                {auth.user.role === 'user' ? (
                                                    session.link ? (
                                                    <div className="link-content"> {session?.link.slice(0, 29) + '...'} <div className="copy" onClick={async () => {
                                                        await navigator.clipboard.writeText(session.link);
                                                        toast.success('Ссылка успешно скопирована!');

                                                    }}>🔗</div> </div> ) : ( <div> Ссылка на сессию еще не добавлена </div> )
                                                ) : (
                                                    session.link ? (
                                                        <div className="linkrow">
                                                            <img src="/icons/rmv.svg" onClick={openDelete} alt="" />
                                                            {session?.link.slice(0, 27) + '...'} <div className="copy" onClick={async () => {
                                                                await navigator.clipboard.writeText(session.link);
                                                                toast.success('Ссылка успешно скопирована!');
                                                            }}>🔗</div>
                                                        </div>
                                                    ) : (
                                                        <div onClick={() => openModal(session.id)} className="addlink"> Добавить ссылку + </div>
                                                    )
                                                )}
                                                {isDeleteOpen && (
                                                    <div className="confirm">
                                                        <Modal isOpen={isDeleteOpen} onClose={closeDelete}>
                                                            <h6>Вы действительно хотите удалить ссылку?</h6>
                                                            <div className="row">
                                                                <button type="button" className="cancelbtn" onClick={closeDelete}>Отменить</button>
                                                                <button type="button" className="deletebtn" onClick={() => handleDeleteLink(session.id)}>Удалить</button>
                                                            </div>
                                                        </Modal>
                                                    </div>
                                                )}
                                                {isModalOpen && (
                                                    <div className="add">
                                                        <Modal isOpen={isModalOpen} onClose={closeModal}>
                                                            <h6>Добавить ссылку</h6>
                                                            <input
                                                                className="inputlink"
                                                                type="text"
                                                                placeholder="Ссылка на Google Meet"
                                                                value={newLink}
                                                                onChange={(e) => setNewLink(e.target.value)}
                                                            />
                                                            {messageLink && (
                                                                <div className="message">
                                                                    <p className={messageTypeLink}>{messageLink}</p>
                                                                </div>
                                                            )}
                                                            <div className="row">
                                                                <button type="button" className="cancelbtn" onClick={closeModal}>Отменить</button>
                                                                <button type="button" className="subtitle-btn" onClick={handleSaveLink}>Сохранить</button>
                                                            </div>
                                                        </Modal>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                    {session.status === 'Ожидается' && !session.link && (
                                        <>
                                            <button onClick={openCancel} className="deletebtn">Отменить запись</button>
                                            {isCancelOpen && (
                                                <div className="confirm">
                                                    <Modal isOpen={isCancelOpen} onClose={closeCancel}>
                                                        <h6>Вы действительно хотите отменить запись?</h6>
                                                        <div className="row">
                                                            <button type="button" className="cancelbtn" onClick={closeCancel}>Нет, оставить</button>
                                                            <button type="button" className="deletebtn" onClick={() => handleCancelSession(session.id)}>Да, отменить</button>
                                                        </div>
                                                    </Modal>
                                                </div>
                                            )}
                                        </>
                                    )}
                                </div>
                            );
                        })
                    )}
                </div>
                {/* пагинация */}
                {filteredSessions.length > itemsPerPage && (
                    <div className="pagination">
                        {currentPage > 1 && (
                            <div className='prevpage' onClick={() => goToPage(currentPage - 1)}>
                                <img src="/icons/select.svg" alt="Назад" />
                            </div>
                        )}
                        {[...Array(totalPages)].map((_, index) => (
                            <p
                                key={index}
                                onClick={() => goToPage(index + 1)}
                                className={currentPage === index + 1 ? 'active' : ''}
                            >
                                {index + 1}
                            </p>
                        ))}
                        {currentPage < totalPages && (
                            <div className='nextpage' onClick={() => goToPage(currentPage + 1)}>
                                <img src="/icons/select.svg" alt="Вперед" />
                            </div>
                        )}
                    </div>
                )}
            </div>
        </>
    );
}
