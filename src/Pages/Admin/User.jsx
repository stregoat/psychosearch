import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useParams, Link } from 'react-router-dom';
import { AuthContext } from '../../Components/Header/AuthContext';
import Modal from '../../Components/Modal/Modal';
import { toast } from 'react-toastify';

export default function User() {
    const { id } = useParams();
    const [user, setUser] = useState(null);
    const { auth } = useContext(AuthContext);
    const avatarBaseUrl = 'http://psychosearch/store/avatars/';
    const defaultAvatar = 'http://psychosearch/public/img/avatar.svg';

    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState('');
    const [isModalOpen, setIsOpen] = useState(false);

    const openModal = () => {
        setIsOpen(true);
        document.body.style.overflow = 'hidden';
    };

    const closeModal = () => {
        setIsOpen(false);
        document.body.style.overflow = '';
    };

    useEffect(() => {
        axios.get(`http://psychosearch/store/actions/get_user.php?id=${id}`)
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

    if (user === null) {
        return <p>Загрузка...</p>;
    }

    if (!user) {
        return <p>Пользователь не найден</p>;
    }

    const Ban = async () => {
        setMessage('');
        setMessageType('');

        try {
            await axios.post(
                'http://psychosearch/store/actions/ban.php',
                { id: user.id },
                {
                    headers: {
                        'Authorization': `Bearer ${auth.accessToken}`
                    }
                }
            );
            setUser((prevUser) => ({ ...prevUser, role: 'ban' }));
            toast.success(`Пользователь ${user.name} успешно заблокирован!`);
        } catch (error) {
            console.error(error);
        }
        closeModal();
    };

    const Unban = async () => {
        setMessage('');
        setMessageType('');

        try {
            await axios.post(
                'http://psychosearch/store/actions/unban.php',
                { id: user.id },
                {
                    headers: {
                        'Authorization': `Bearer ${auth.accessToken}`
                    }
                }
            );
            setUser((prevUser) => ({ ...prevUser, role: 'user' }));
            toast.success(`Пользователь ${user.name} успешно разблокирован!`);
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <>
            <div className="one-user">
                <img src={user.avatar ? `${avatarBaseUrl}${user.avatar}` : defaultAvatar} alt="" />
                <div className="one-user-content">
                    <div className="info">
                        Основная информация
                        <div className="label">
                            Имя
                            <p>{user.name}</p>
                        </div>
                    </div>
                    <div className="info">
                        Безопасность
                        <div className="label">
                            Почта
                            <p>{user.email}</p>
                        </div>
                    </div>
                </div>
            </div>
            <div className="user-btns">
                <Link className='subtitle-btn' to='/admin/users'>Назад</Link>
                {user.role === 'user' && (
                    <div className="delete" onClick={openModal}>Заблокировать</div>
                )}
                {user.role === 'ban' && (
                    <div className="cancelbtn" onClick={Unban}>Разблокировать</div>
                )}
            </div>
            {isModalOpen && (
                <div className="confirm">
                    <Modal isOpen={isModalOpen} onClose={closeModal}>
                        <h6>Вы действительно хотите заблокировать пользователя с ID {user.id}?</h6>
                        <div className="row">
                            <button type="button" className='cancelbtn' onClick={closeModal}>Отменить</button>
                            <button type="button" className='deletebtn' onClick={Ban}>Заблокировать</button>
                        </div>
                    </Modal>
                </div>
            )}
        </>
    )
}