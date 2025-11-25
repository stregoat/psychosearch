import { useLocation, useNavigate, Link, Navigate } from 'react-router-dom';
import { useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { AuthContext } from '../../Components/Header/AuthContext';
import './Payment.css';
import confetti from 'canvas-confetti';

export default function Payment() {
    const location = useLocation();
    const navigate = useNavigate();
    const { auth } = useContext(AuthContext);

    const { psychologist, selectedSlot } = location.state || {};

    const [isConfirmed, setIsConfirmed] = useState(() => {
        const confirmedSlotId = localStorage.getItem('confirmedSlotId');
        return confirmedSlotId === String(selectedSlot?.id);
    });
    const [formData, setFormData] = useState({
        fullName: '',
        cardNumber: '',
        cvv: '',
        expiry: ''
    });

    const [errors, setErrors] = useState({});

    useEffect(() => {
        const confirmedSlotId = localStorage.getItem('confirmedSlotId');
        setIsConfirmed(confirmedSlotId === String(selectedSlot?.id));
    }, [selectedSlot]);

    if (!auth.user || auth.user.role !== 'user' || !psychologist || !selectedSlot) {
        return <Navigate to="/" replace />;
    }

    const validateForm = () => {
        const newErrors = {};
        if (!formData.fullName.trim()) {
            newErrors.fio = 'Заполните ФИО';
        }
        if (!formData.cardNumber.trim()) {
            newErrors.number = 'Заполните номер карты';
        }
        if (formData.cardNumber.length !== 19) {
            newErrors.number = 'Заполните номер карты';
        }
        if (!formData.cvv.trim()) {
            newErrors.cvv = 'Заполните CVV';
        }
        if (formData.cvv.length !== 3) {
            newErrors.cvv = 'Заполните CVV';
        }
        if (!formData.expiry.trim()) {
            newErrors.date = 'Заполните срок';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleConfirm = (e) => {
        e.preventDefault();
        if (validateForm()) {
            const requestData = {
                psychologist_id: Number(psychologist.id),
                user_id: auth.user.id,
                schedule_id: selectedSlot.id,
            };

            axios.post('http://psychosearch/store/actions/add_session.php', requestData)
                .then(response => {
                    if (response.data.success) {
                        confetti({
                            particleCount: 150,
                            spread: 100,
                            origin: { y: 0.2 },
                            shapes: ['circle'],
                            colors: ['#72C0F4', '#72c0f492', '#72c0f453', '#2290d9'],
                        });
                        localStorage.setItem('confirmedSlotId', selectedSlot.id);
                        setIsConfirmed(true);
                    } else {
                        console.error('Ошибка при записи на сессию');
                    }
                })
                .catch(error => {
                    console.error('Ошибка при записи:', error);
                });
        }
    };

    const avatarBaseUrl = 'http://psychosearch/store/avatars/';
    const defaultAvatar = 'http://psychosearch/public/img/avatar.svg';

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        let formattedValue = value;

        if (name === 'fullName') {
            formattedValue = value.toUpperCase();
        }

        setFormData(prev => ({
            ...prev,
            [name]: formattedValue,
        }));
    };

    const handleCardNumberChange = (e) => {
        const raw = e.target.value.replace(/\D/g, '').slice(0, 16);
        const formatted = raw.replace(/(.{4})/g, '$1 ').trim();
        setFormData(prev => ({
            ...prev,
            cardNumber: formatted
        }));
    };

    const handleCvvChange = (e) => {
        const formatted = e.target.value.replace(/\D/g, '').slice(0, 3);
        setFormData(prev => ({
            ...prev,
            cvv: formatted
        }));
    };

    if (isConfirmed) {
        return (
            <div className="payment-success">
                <img src="/img/confirm.svg" alt="Успешно" />
                <h2>Оплата успешно прошла!</h2>
                <p>
                    Вы записаны к <span>{psychologist.name}</span> на <span>{selectedSlot.date}, {selectedSlot.time}</span>.
                    Вся информация о сессии хранится в личном кабинете.
                </p>
                <Link to="/profile/sessions" className="mainnbtn">К личному кабинету</Link>
            </div>
        );
    }

    return (
        <div className="payment">
            <div className="psycho">
                <img
                    className="avatarpsycho"
                    src={psychologist.avatar ? `${avatarBaseUrl}${psychologist.avatar}` : defaultAvatar}
                    alt={psychologist.name}
                />
                <div className="psycho-info">
                    <h5>{psychologist.name}</h5>
                    <div className="time">
                        <img src="/icons/clock.svg" alt="Время" />
                        {selectedSlot.date}, {selectedSlot.time}
                    </div>
                </div>
            </div>

            <div className="label">
                ФИО владельца
                <input
                    name="fullName"
                    className={errors.fio ? 'error' : ''}
                    value={formData.fullName}
                    onChange={handleInputChange}
                    type="text"
                    placeholder="ИВАНОВ ИВАН ИВАНОВИЧ"
                    onBlur={validateForm}
                />
                {errors.fio && <p className='errortext'>{errors.fio}</p>}
            </div>

            <div className="label">
                Номер карты
                <input
                    name="cardNumber"
                    className={errors.number ? 'error' : ''}
                    value={formData.cardNumber}
                    onChange={handleCardNumberChange}
                    type="text"
                    onBlur={validateForm}
                    placeholder="0000 0000 0000 0000"
                />
                {errors.number && <p className='errortext'>{errors.number}</p>}
            </div>

            <div className="row">
                <div className="label">
                    CVV
                    <input
                        name="cvv"
                        className={errors.cvv ? 'error' : ''}
                        value={formData.cvv}
                        onChange={handleCvvChange}
                        type="password"
                        onBlur={validateForm}
                        placeholder="CVV"
                    />
                    {errors.cvv && <p className='errortext'>{errors.cvv}</p>}
                </div>
                <div className="label">
                    Срок действия
                    <input
                        name="expiry"
                        className={errors.date ? 'error' : ''}
                        value={formData.expiry}
                        onChange={handleInputChange}
                        type="month"
                        onBlur={validateForm}
                    />
                    {errors.date && <p className='errortext'>{errors.date}</p>}
                </div>
            </div>

            <div className="payment-price">
                К оплате:
                <p>{psychologist.price.toLocaleString('ru-RU')} ₽</p>
            </div>

            <button className="mainnbtn" onClick={handleConfirm}>
                Записаться на {selectedSlot.date}, {selectedSlot.time}
            </button>
            <div className="subtitle-btn" onClick={() => navigate(-1)}>Назад</div>
        </div>
    );
}
