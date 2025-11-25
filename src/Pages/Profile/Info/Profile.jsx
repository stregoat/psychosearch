import { useState, useEffect } from 'react';
import './Profile.css';
import Modal from '../../../Components/Modal/Modal';
import axios from 'axios';
import { toast } from 'react-toastify';

export default function Profile({ userData, accessToken, onUserUpdate }) {

    const [isModalOpen, setIsOpen] = useState(false);

    const openModal = () => {
        setIsOpen(true);
        document.body.style.overflow = 'hidden';
    };

    const closeModal = () => {
        setIsOpen(false);
        document.body.style.overflow = '';
    };


    const [name, setName] = useState(userData.name);
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState('');
    const [messageEdit, setMessageEdit] = useState('');
    const [messageTypeEdit, setMessageTypeEdit] = useState('');

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setEditData({ ...editData, [name]: value });
    };

    const handleGenderChange = (e) => {
        setEditData(prevData => ({
            ...prevData,
            gender: e.target.value,
        }));
    };

    const handleSpecializationChange = (id) => {
        setEditData((prevData) => {
            const updatedSpecializations = prevData.specializations.includes(Number(id))
                ? prevData.specializations.filter((s) => s !== Number(id))
                : [...prevData.specializations, Number(id)];
            return { ...prevData, specializations: updatedSpecializations };
        });
    };

    const [user, setUser] = useState(null);
    const [specializations, setSpecializations] = useState([]);
    const [editData, setEditData] = useState({
        birthday: '',
        gender: '',
        price: '',
        about: '',
        experience: '',
        specializations: [],
    });

    const handleEdit = async (e) => {

        e.preventDefault();
        setMessageEdit('');
        setMessageTypeEdit('');

        const formData = new FormData();
        formData.append('birthday', editData.birthday);
        formData.append('gender', editData.gender);
        formData.append('price', editData.price);
        formData.append('about', editData.about);
        formData.append('experience', editData.experience);
        formData.append('specializations', JSON.stringify(editData.specializations));

        try {
            const response = await axios.post('http://psychosearch/store/actions/update_psychologist_profile.php', formData, {
                headers: { 'Authorization': `Bearer ${accessToken}` },
            });
            if (response.data.success) {
                toast.success(`Данные успешно обновлены!`);
            } else {
                setMessageEdit(response.data.message);
                setMessageTypeEdit('err');
            }
        } catch (error) {
            console.error('Ошибка при обновлении', error);
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const specializationsRes = await axios.get('http://psychosearch/store/actions/get_specializations.php');
                setSpecializations(specializationsRes.data);

                const psychologistRes = await axios.get(`http://psychosearch/store/actions/get_psychologist.php?user_id=${userData.id}`);
                if (psychologistRes.data) {
                    setUser(psychologistRes.data);
                    const userSpecializations = psychologistRes.data.specializations || [];
                    const specializationIds = specializationsRes.data
                        .filter(spec => userSpecializations.includes(spec.specialization))
                        .map(spec => spec.id);
                    setEditData({
                        birthday: psychologistRes.data.birthday,
                        gender: psychologistRes.data.gender,
                        price: psychologistRes.data.price,
                        about: psychologistRes.data.about,
                        experience: psychologistRes.data.experience,
                        specializations: specializationIds,
                    });
                } else {
                    console.error('Психолог не найден');
                }
            } catch (error) {
                console.error('Ошибка при получении данных', error);
            }
        };
        fetchData();
    }, [userData.id]);

    const [avatarUrl, setAvatarUrl] = useState(
        userData.avatar ? `/store/avatars/${userData.avatar}` : '/img/avatar.svg'
    );
    const [hasAvatar, setHasAvatar] = useState(!!userData.avatar);

    useEffect(() => {
        setName(userData.name);
        setAvatarUrl(userData.avatar ? `/store/avatars/${userData.avatar}` : '/img/avatar.svg');
        setHasAvatar(!!userData.avatar);
    }, [userData]);

    const handleChangeRegister = (e) => {
        const value = e.target.value;
        const formattedName = value
            .split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join(' ');
        setName(formattedName);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        setMessage('');
        setMessageType('');

        try {
            const response = await axios.post(
                'http://psychosearch/store/actions/update_user.php',
                { name },
                {
                    headers: {
                        'Authorization': `Bearer ${accessToken}`,
                        'Content-Type': 'application/json'
                    }
                }
            )

            if (response.data.success) {
                toast.success(`Имя успешно обновлено!`);
                onUserUpdate({ name });
            } else {
                setMessage(response.data.message);
                setMessageType('err');
            }
        } catch (error) {
            setMessage('Произошла ошибка при обновлении имени.');
            setMessageType('err');
        }
    };

    const handleAvatarChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setMessage('');
        setMessageType('');

        const formData = new FormData();
        formData.append('avatar', file);

        try {
            const response = await axios.post(
                'http://psychosearch/store/actions/update_user.php',
                formData,
                {
                    headers: {
                        'Authorization': `Bearer ${accessToken}`,
                    }
                }
            );

            if (response.data.success) {
                const newAvatarName = response.data.avatar
                toast.success(`Аватар успешно обновлен!`);
                setAvatarUrl(`/store/avatars/${newAvatarName}`);
                setHasAvatar(true);
                onUserUpdate({ avatar: newAvatarName });
            } else {
                setMessage(response.data.message);
                setMessageType('err');
            }
        } catch (error) {
            setMessage('Произошла ошибка при обновлении аватара.');
            setMessageType('err');
            console.error('Ошибка:', error);
        }
    };

    const handleDeleteAvatar = async () => {
        setMessage('');
        setMessageType('');

        try {
            const response = await axios.post(
                'http://psychosearch/store/actions/update_user.php',
                { deleteAvatar: true },
                {
                    headers: {
                        'Authorization': `Bearer ${accessToken}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (response.data.success) {
                toast.success(`Аватар успешно удален!`);
                setAvatarUrl('/img/avatar.svg');
                setHasAvatar(false);
                onUserUpdate({ avatar: null });
            } else {
                setMessage(response.data.message);
                setMessageType('err');
            }
        } catch (error) {
            setMessage('Произошла ошибка при удалении аватара.');
            setMessageType('err');
            console.error(error);
        }
        closeModal();
    };

    return (
        <>
            <div className="info-content">
                <form className="profile-content" onSubmit={handleSubmit}>
                    <div className='avatar'>
                        <img className='photo' src={avatarUrl} alt="Аватар" />
                        <input type="file" id='file' onChange={handleAvatarChange} />
                        <div className="avatar_btns">
                            <label htmlFor="file">
                                <img src="/icons/upload.svg" alt="" /> Загрузить фото
                            </label>
                            {hasAvatar && (
                                <button type="button" className='iconbtn' onClick={openModal}>
                                    <img src="/icons/delete.svg" alt="" />
                                </button>
                            )}
                            {isModalOpen && (
                                <div className="confirm">
                                    <Modal isOpen={isModalOpen} onClose={closeModal}>
                                        <h6>Вы действительно хотите удалить аватар?</h6>
                                        <div className='row'>
                                            <button type="button" className='cancelbtn' onClick={closeModal}>Отменить</button>
                                            <button type="button" className='deletebtn' onClick={handleDeleteAvatar}>Удалить</button>
                                        </div>
                                    </Modal>
                                </div>
                            )}
                        </div>
                    </div>
                    <div className='profile-info'>
                        <div className="info">
                            Основная информация
                            <div className="label">
                                <div className="label-title">Имя<img src="/icons/edit.svg" alt="" /></div>
                                <div className="input profile-name">
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={handleChangeRegister}
                                        placeholder='Ваше имя'
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="info">
                            Безопасность
                            <div className="label">
                                Почта
                                <div className="email">{userData.email}</div>
                            </div>
                        </div>
                        <button className='subtitle-btn' type="submit">Сохранить</button>
                        {message && (
                            <div className="message">
                                <p className={messageType}>{message}</p>
                            </div>
                        )}
                    </div>
                </form>
                {userData.role === 'psychologist' && (
                    <form className='editcontent' onSubmit={handleEdit}>
                        <div className="info">
                            О специалисте
                        </div>
                        <div className="info">
                            <div className="label">
                                <div className="label-title">
                                    Дата рождения
                                    <img src="/icons/edit.svg" alt="" />
                                </div>
                                <div className="input">
                                    <input type="text" name="birthday" value={editData.birthday} onChange={handleInputChange} />
                                </div>
                            </div>
                            <div className="label">
                                <div className="label-title">
                                    Пол
                                    <img src="/icons/edit.svg" alt="" />
                                </div>
                                <div className='gender'>
                                    <label><input type="radio" name="gender" value="Мужской" checked={editData.gender === 'Мужской'} onChange={handleGenderChange} /> Мужской</label>
                                    <label><input type="radio" name="gender" value="Женский" checked={editData.gender === 'Женский'} onChange={handleGenderChange} /> Женский</label>
                                </div>
                            </div>
                            <div className="label">
                                <div className="label-title">
                                    Опыт работы
                                    <img src="/icons/edit.svg" alt="" />
                                </div>
                                <div className="input">
                                    <input type="text" name="experience" placeholder='Опыт работы' value={editData.experience} onChange={handleInputChange} />
                                </div>
                            </div>
                            <div className="label">
                                <div className="label-title">
                                    Стоимость сеанса
                                    <img src="/icons/edit.svg" alt="" />
                                </div>
                                <input type="number" name="price" value={editData.price} placeholder="Стоимость сеанса" onChange={handleInputChange} />
                            </div>
                            <div className="label">
                                <div className="label-title">
                                    Темы для сеанса
                                    <img src="/icons/edit.svg" alt="" />
                                </div>
                                <div className='spec'>
                                    {specializations.map((spec) => {
                                        const isChecked = editData.specializations && editData.specializations.includes(Number(spec.id));
                                        return (
                                            <div key={spec.id}>
                                                <input className="custom-checkbox"
                                                    type="checkbox"
                                                    id={`${spec.id}`}
                                                    checked={isChecked}
                                                    onChange={() => handleSpecializationChange(spec.id)}
                                                />
                                                <label htmlFor={`${spec.id}`}>
                                                    {spec.specialization}
                                                </label>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                            <div className="label">
                                <div className="label-title">
                                    О специалисте
                                    <img src="/icons/edit.svg" alt="" />
                                </div>
                                <textarea name="about" value={editData.about} placeholder="О специалисте" onChange={handleInputChange}> </textarea>
                            </div>
                            <button className='subtitle-btn' type='submit'>Сохранить</button>
                            {messageEdit && (
                                <div className="message">
                                    <p className={messageTypeEdit}>{messageEdit}</p>
                                </div>
                            )}
                        </div>
                    </form>
                )}
            </div>
        </>
    );
}
