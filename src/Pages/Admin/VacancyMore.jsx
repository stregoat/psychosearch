import { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, Link } from 'react-router-dom';
import Modal from '../../Components/Modal/Modal';


export default function User() {
    const { id } = useParams();
    const [user, setUser] = useState(null);
    const avatarBaseUrl = 'http://psychosearch/store/avatars/';
    const diploma = 'http://psychosearch/store/diplomas/';
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [activeImage, setActiveImage] = useState(null);
    const [isModalVisible, setIsModalVisible] = useState(false);

    useEffect(() => {
        axios.get(`http://psychosearch/store/actions/get_vacancy.php?id=${id}`)
            .then(response => {
                if (response.data) {
                    setUser(response.data);
                } else {
                    console.error('Пользователь не найден');
                }
            })
            .catch(error => {
                console.error('Ошибка при получении пользователя', error);

            });
    }, [id]);

    const diplomas = user?.photos_diploma ? JSON.parse(user.photos_diploma) : [];

    if (user === null) {
        return <p>Загрузка...</p>;
    }

    if (!user) {
        return <p>Пользователь не найден</p>;
    }

    const openModal = (imgSrc) => {
        setActiveImage(imgSrc);
        setIsModalVisible(true);
        setTimeout(() => {
            setIsModalOpen(true);
        }, 10);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setTimeout(() => {
            setIsModalVisible(false);
            setActiveImage(null);
        }, 300);
    };

    return (
        <>
            <div className="title-admin">
                <h5>{user.name}</h5>
                <Link className='subtitle-btn' to='/admin/vacancies'>Назад</Link>
            </div>
            <div className="one-user">
                <img src={user.avatar ? `${avatarBaseUrl}${user.avatar}` : defaultAvatar} alt="" />
                <div className="one-user-content">
                    <div className="info">
                        Основная информация
                        <div className="label">
                            ФИО
                            <p>{user.name}</p>
                        </div>
                        <div className="label">
                            Пол
                            <p>{user.gender === 'male' ? 'Мужской' : 'Женский'}</p>
                        </div>
                        <div className="label">
                            Дата рождения
                            <p>{user.birthday}</p>
                        </div>
                    </div>
                    <div className="info">
                        Контакты
                        <div className="label">
                            Почта
                            <p>{user.email}</p>
                        </div>
                        <div className="label">
                            Телефон
                            <p>{user.phone}</p>
                        </div>
                    </div>
                    <div className="info">
                        Образование
                        <div className="label">
                            Информация об образовании
                            <p>{user.about_study}</p>
                        </div>
                        <div className="label">
                            Страницы диплома
                            {diplomas.map((diplomaPath, index) => (
                                <img
                                    key={index}
                                    src={`${diploma}${diplomaPath}`}
                                    alt=""
                                    onClick={() => openModal(`${diploma}${diplomaPath}`)}
                                    className="diploma-thumbnail"
                                />
                            ))}
                        </div>
                    </div>
                    <div className="info">
                        Практика
                        <div className="label">
                            Основные темы для работы
                            <p>{user.specs}</p>
                        </div>
                        <div className="label">
                            Информация о практике
                            <p>{user.about_practic}</p>
                        </div>
                    </div>
                    <div className="info">
                        О специалисте
                        <div className="label">
                            Информация о специалисте
                            <p>{user.about_me}</p>
                        </div>
                    </div>
                </div>
            </div>
            {isModalVisible && (
                <div className={`modal-diplom ${isModalOpen ? 'open' : ''}`} onClick={closeModal}>
                    <div className="modal-diplom-content container" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-close-btn" onClick={closeModal}>&times;</div>
                        <img src={activeImage} alt="Diploma Large" className="modal-image" />
                    </div>
                </div>
            )}
        </>
    )
}