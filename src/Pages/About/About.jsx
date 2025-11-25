import { useParams, Link, useNavigate } from 'react-router-dom';
import './About.css';
import axios from 'axios';
import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../Components/Header/AuthContext';
export default function About() {
    const { auth } = useContext(AuthContext);
    const { id } = useParams();
    const [user, setUser] = useState(null);
    const [schedule, setSchedule] = useState([]);
    const avatarBaseUrl = 'http://psychosearch/store/avatars/';
    const defaultAvatar = 'http://psychosearch/public/img/avatar.svg';
    const [isButtonVisible, setIsButtonVisible] = useState(true);
    const navigate = useNavigate();
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState('');
    const [reviews, setReviews] = useState([]);
    const [averageRating, setAverageRating] = useState(null);
    useEffect(() => {
        const fetchUserReviews = async () => {
            try {
                const response = await axios.get('http://psychosearch/store/actions/get_psychologist_reviews.php', {
                    params: {
                        user_id: id
                    }
                });
                const availableReviews = response.data.reviews.filter(review => review.is_available === 1);
                setReviews(availableReviews);
            } catch (err) {
                console.error('Ошибка при получении отзывов:', err);
            }
        };
        if (id) {
            fetchUserReviews();
        }
    }, [id]);
    // рейтинг
    useEffect(() => {
        if (reviews.length > 0) {
            const totalRating = reviews.reduce((sum, review) => sum + review.review_rating, 0);
            const avgRating = (totalRating / reviews.length).toFixed(1);
            setAverageRating(avgRating);
        } else {
            setAverageRating(null);
        }
    }, [reviews]);
    // исчезнование кнопки
    useEffect(() => {
        const handleScroll = () => {
            const halfScreenHeight = window.innerHeight / 4;
            const scrollPosition = window.scrollY + halfScreenHeight;

            if (scrollPosition < document.documentElement.scrollHeight / 4) {
                setIsButtonVisible(true);
            } else {
                setIsButtonVisible(false);
            }
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);
    // расписание
    const [selectedSlot, setSelectedSlot] = useState(null);
    const handleSlotClick = (date, time, slotId) => {
        setSelectedSlot({ date, time, id: slotId });
    };
    const isSlotSelected = (date, time, id) => {
        return (
            selectedSlot &&
            selectedSlot.date === date &&
            selectedSlot.time === time &&
            selectedSlot.id === id
        );
    };
    const redirectToPayment = () => {
        if (!selectedSlot) {
            setMessage('Пожалуйста, выберите время сессии.');
            setMessageType('err');
            return;
        }
        if (!auth.user) {
            navigate('/login');
            return;
        }
        const psychologistData = {
            id: user.id,
            name: user.name,
            avatar: user.avatar,
            price: user.price,
        };
        navigate('/payment', { state: { psychologist: psychologistData, selectedSlot } });
    };
    // возраст
    const getUserLabel = (count) => {
        if (count % 10 === 1 && count % 100 !== 11) {
            return "год";
        } else if (
            count % 10 >= 2 &&
            count % 10 <= 4 &&
            (count % 100 < 10 || count % 100 >= 20)
        ) {
            return "года";
        } else {
            return "лет";
        }
    };
    useEffect(() => {
        axios.get(`http://psychosearch/store/actions/get_psychologist.php?user_id=${id}`)
            .then(response => {
                if (response.data) {
                    setUser(response.data);
                } else {
                    console.error('Психолог не найден');
                }
            })
            .catch(error => {
                console.error('Ошибка при получении психолога', error);
            });
        axios.post(`http://psychosearch/store/actions/get_schedule.php`, { psychologist_id: id },
            { headers: { 'Content-Type': 'application/json' } }
        )
            .then(response => {
                if (response.data.success) {
                    setSchedule(response.data.schedule);
                } else {
                    console.error('Ошибка получения расписания:', response.data.message);
                }
            })
            .catch(error => {
                console.error('Ошибка при запросе расписания:', error);
            });
    }, [id]);
    const groupedSchedule = schedule.reduce((acc, slot) => {
        const dateObj = new Date(slot.date);
        const formattedDate = `${dateObj.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })}, ${dateObj.toLocaleDateString('ru-RU', { weekday: 'long' })}`;
        if (!acc[formattedDate]) {
            acc[formattedDate] = [];
        }
        acc[formattedDate].push({
            ...slot,
            time: new Date(`1970-01-01T${slot.time}`).toLocaleTimeString('ru-RU', {
                hour: '2-digit',
                minute: '2-digit',
            })
        });
        return acc;
    }, {});
    const isButtonDisabledForRole = auth.user && (auth.user.role === 'admin' || auth.user.role === 'psychologist');
    if (!user) {
        return <p>Загрузка...</p>;
    }
    return (
        <>
            <div className="bread">
                <Link className='breadlink' to="/catalog"> Психологи </Link>
                <img src="/icons/to.svg" alt="" />
                <Link className='breadlink' to={`/psychologist/${user.id}`}>{user.name}</Link>
            </div>
            <div className="about-row">
                <div className="sticky">
                    <img className='img' src={user.avatar ? `${avatarBaseUrl}${user.avatar}` : defaultAvatar} alt="" />
                    <h6>{user.name}</h6>
                    <p>{user.price.toLocaleString('ru-RU')} ₽</p>
                    <div className="row">
                        <Link to='reviews'>
                            <span className='review-content'>
                                {averageRating === null ? 0 : averageRating}<img src="/icons/star.svg" alt="" />
                            </span>
                        </Link>
                        <span><img src="/icons/exp.svg" alt="" /> {user.experience} {getUserLabel(user.experience)} опыта</span>
                    </div>
                    {isButtonVisible && !isButtonDisabledForRole && (
                        <a className={`mainbtn ${!isButtonVisible ? 'hidden' : ''}`} href='#session'>Записаться <img src="/logo/Arrow.svg" alt="" /></a>
                    )}
                </div>
                <div className="about-content">
                    <div className="block">
                        <h6>О специалисте</h6>
                        <div className="holder">
                            <input type="checkbox" className="read-more-checker" id="read-more-checker" />
                            <div className="limited">
                                <div className='textcontent' dangerouslySetInnerHTML={{ __html: user.about }} />
                                <div className="bottom"></div>
                            </div>
                            <label htmlFor="read-more-checker" className="read-more-button"></label>
                        </div>
                    </div>
                    <div className="block">
                        <h6>С чем работает</h6>
                        <div className="row-topics">
                            {user.specializations && user.specializations.map((specialization, index) => (
                                <span key={index}>{specialization}</span>
                            ))}
                        </div>
                    </div>
                    <div className="block" id='session'>
                        <div className="row">
                            <h6>Расписание</h6>
                            <div className="time">
                                <img src="/icons/clock.svg" alt="" />    Время по МСК
                            </div>
                        </div>
                        <div className="schedule-list">
                            {Object.keys(groupedSchedule).length > 0 ? (
                                Object.entries(groupedSchedule).map(([date, slots]) => (
                                    <div key={date} className="date-item">
                                        <h6>{date}</h6>
                                        <div className="time-list">
                                            {slots.map((slot) => (
                                                <div
                                                    key={slot.id}
                                                    className={`time-item about-slot ${slot.u_id ? 'busy' : ''} ${isSlotSelected(date, slot.time, slot.id) ? 'select' : ''} `}
                                                    onClick={() => !slot.u_id && handleSlotClick(date, slot.time, slot.id)}
                                                >
                                                    {slot.time}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="warning">
                                    <img src="/icons/warning.svg" alt="" />
                                    <p>К сожалению, у данного психолога сейчас нет доступных слотов для записи. Рекомендуем ознакомиться с нашим  <Link to='/catalog'> каталогом </Link>психологов.</p>
                                </div>
                            )}
                            {!isButtonDisabledForRole && Object.keys(groupedSchedule).length > 0 && (
                                <div className={`mainnbtn ${isButtonDisabledForRole ? 'hidden' : ''}`}
                                    onClick={redirectToPayment}
                                >
                                    {selectedSlot ? `Записаться на ${selectedSlot.date} в ${selectedSlot.time}` : "Записаться"}
                                </div>
                            )}
                        </div>
                        {message && (
                            <div className="message">
                                <p className={messageType}>{message}</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}
