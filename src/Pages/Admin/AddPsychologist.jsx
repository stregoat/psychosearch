import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';

export default function AddPsychologist() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [gender, setGender] = useState('');
    const [about, setAbout] = useState('');
    const [experience, setExperience] = useState('');
    const [price, setPrice] = useState('');
    const [birthday, setBirthday] = useState('');
    const [avatar, setAvatar] = useState(null);
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState('');
    const [specializations, setSpecializations] = useState([]);
    const [selectedSpecializations, setSelectedSpecializations] = useState([]);

    useEffect(() => {
        const fetchSpecializations = async () => {
            try {
                const response = await axios.get('http://psychosearch/store/actions/get_specializations.php');
                setSpecializations(response.data);
            } catch (error) {
                console.error('Ошибка при получении специализаций:', error);
            }
        };
        fetchSpecializations();
    }, []);

    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        setAvatar(file);
    };

    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setMessageType('');

        const formData = new FormData();
        formData.append('name', name);
        formData.append('price', price);
        formData.append('avatar', avatar);
        formData.append('experience', experience);
        formData.append('about', about);
        formData.append('email', email);
        formData.append('password', password);
        formData.append('birthday', birthday);
        formData.append('gender', gender);
        formData.append('specializations', JSON.stringify(selectedSpecializations));

        try {
            const response = await axios.post(
                'http://psychosearch/store/actions/add_psychologist.php', formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                }
            );
            if (response.data.success) {
                toast.success(`Психолог ${name} успешно добавлен!`);
                navigate('/admin/psychologists');
            } else {
                setMessage(response.data.message);
                setMessageType('err');
            }


        } catch (error) {
            setMessage('Ошибка при добавлении психолога.');
            setMessageType('err');
            console.error(error);
        }
    };

    const handleSpecializationChange = (id) => {
        setSelectedSpecializations(prev =>
            prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
        );
    };

    const handleEmailChange = (e) => {
        const value = e.target.value;
        setEmail(value.toLowerCase());
    };

    const handleNameChange = (e) => {
        const formattedName = e.target.value
            .toLowerCase()
            .replace(/(^|\s)\S/g, (char) => char.toUpperCase());
        setName(formattedName);
    };

    return (
        <form onSubmit={handleSubmit}>
            <div className="title-admin">
                <h5>Добавить психолога</h5>
                <Link className='subtitle-btn' to="/admin/psychologists">Назад</Link>
            </div>
            <div className="add">
                <div className="label">
                    Почта
                    <input type="text" placeholder="Введите почту специалиста" value={email} onChange={(e) => {
                        setEmail(e.target.value); handleEmailChange(e);
                    }} />
                </div>
                <div className="label">
                    Пароль
                    <input type="text" placeholder="Введите пароль специалиста" value={password} onChange={(e) => setPassword(e.target.value)} />
                </div>
                <div className="label">
                    Аватар
                    <div className="avatar">
                        <input type="file" id='file' onChange={handleAvatarChange} />
                        <label htmlFor="file">
                            <img src="/icons/upload.svg" alt="" /> Загрузить фото
                        </label>
                        {avatar && (
                            <img className='look' src={URL.createObjectURL(avatar)} alt="Предпросмотр" />
                        )}
                    </div>
                </div>
                <div className="label">
                    ФИО
                    <input type="text" placeholder="Иванов Иван Иванович" value={name} onChange={(e) => {
                        setName(e.target.value);
                        handleNameChange(e);
                    }} />
                </div>
                <div className="label">
                    Пол
                    <div className='gender'>
                        <label className="custom-radio-label">
                            <input
                                type="radio"
                                value="Мужской"
                                checked={gender === 'Мужской'}
                                onChange={() => setGender('Мужской')}
                                className="custom-radio-input"
                            />
                            <span className="custom-radio-outer">
                                {gender === 'Мужской' && <span className="custom-radio-inner" />}
                            </span>
                            Мужской
                        </label>
                        <label className="custom-radio-label">
                            <input
                                type="radio"
                                value="Женский"
                                checked={gender === 'Женский'}
                                onChange={() => setGender('Женский')}
                                className="custom-radio-input"
                            />
                            <span className="custom-radio-outer">
                                {gender === 'Женский' && <span className="custom-radio-inner" />}
                            </span>
                            Женский
                        </label>
                    </div>
                </div>
                <div className="label">
                    Дата рождения
                    <div className="custom-date-input">
                        <input type="date" value={birthday} onChange={(e) => setBirthday(e.target.value)} />
                    </div>
                </div>
                <div className="label">
                    О специалисте
                    <textarea placeholder="Напишите информацию о специалисте" value={about} onChange={(e) => setAbout(e.target.value)} />
                </div>
                <div className="label">
                    Опыт работы
                    <input type="number" placeholder="Напишите опыт работы специалиста" value={experience} onChange={(e) => setExperience(e.target.value)} />
                </div>
                <div className="label">
                    Цена
                    <div className="price-input">
                        <input type="number" placeholder="₽" value={price} onChange={(e) => setPrice(e.target.value)} />
                        <p>₽</p>
                    </div>
                </div>
                <div className="label">
                    Специализации
                    <div className='spec'>
                        {specializations.map((spec) => (
                            <div key={spec.id}>
                                <input className="custom-checkbox"
                                    type="checkbox"
                                    id={`${spec.id}`}
                                    value={spec.id}
                                    checked={selectedSpecializations.includes(spec.id)}
                                    onChange={() => handleSpecializationChange(spec.id)}
                                />
                                <label htmlFor={`${spec.id}`}>{spec.specialization}</label>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            <div className="user-btns">

                <button className='mainbtn' type="submit">Добавить психолога +</button>
            </div>
            {message && (
                <div className="message">
                    <p className={messageType}>{message}</p>
                </div>)}
        </form>
    );
}
