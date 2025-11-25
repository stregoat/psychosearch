import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../Components/Header/AuthContext';
import Modal from '../../Components/Modal/Modal';
import { toast } from 'react-toastify';

export default function Psychologist() {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const { auth } = useContext(AuthContext);
  const navigate = useNavigate();
  const avatarBaseUrl = 'http://psychosearch/store/avatars/';
  const defaultAvatar = 'http://psychosearch/public/img/avatar.svg';
  const [schedule, setSchedule] = useState([]);

  const [isModalOpen, setIsOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);

  const [specializations, setSpecializations] = useState([]);
  const [editData, setEditData] = useState({
    name: '',
    birthday: '',
    gender: '',
    price: '',
    about: '',
    experience: '',
    avatar: null,
    specializations: [],
  });

  const openEdit = () => {
    setIsEditOpen(true);
    document.body.style.overflow = 'hidden';
  };
  const closeEdit = () => {
    setIsEditOpen(false);
    document.body.style.overflow = '';
    setMessage('');
    setMessageType('');
  };

  const openModal = () => {
    setIsOpen(true);
    document.body.style.overflow = 'hidden';
  };

  const closeModal = () => {
    setIsOpen(false);
    document.body.style.overflow = '';
  };

  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const specializationsRes = await axios.get('http://psychosearch/store/actions/get_specializations.php');
        setSpecializations(specializationsRes.data);

        const psychologistRes = await axios.get(`http://psychosearch/store/actions/get_psychologist.php?user_id=${id}`);
        if (psychologistRes.data) {
          setUser(psychologistRes.data);
          const userSpecializations = psychologistRes.data.specializations || [];
          const specializationIds = specializationsRes.data
            .filter(spec => userSpecializations.includes(spec.specialization))
            .map(spec => spec.id);
          setEditData({
            name: psychologistRes.data.name,
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
      } catch (error) {
        console.error('Ошибка при получении данных', error);
      }
    };
    fetchData();
  }, [id]);

  const handleFileChange = (e) => {
    setEditData({ ...editData, avatar: e.target.files[0] });
  };

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

  const saveEdit = async () => {
    const formData = new FormData();
    formData.append('id', id);
    formData.append('name', editData.name);
    formData.append('birthday', editData.birthday);
    formData.append('gender', editData.gender);
    formData.append('price', editData.price);
    formData.append('about', editData.about);
    formData.append('experience', editData.experience);
    formData.append('specializations', JSON.stringify(editData.specializations));
    if (editData.avatar) formData.append('avatar', editData.avatar);

    try {
      const response = await axios.post('http://psychosearch/store/actions/update_psychologist.php', formData, {
        headers: { 'Authorization': `Bearer ${auth.accessToken}` },
      });
      if (response.data.success) {
        toast.success(`Психолог ${editData.name} успешно обновлен!`);
        closeEdit();
      }
      else {
        setMessage(response.data.message);
        setMessageType('err');
      }
    } catch (error) {
      console.error('Ошибка при обновлении', error);
    }
  };

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

  const Delete = (e) => {
    axios
      .post(
        'http://psychosearch/store/actions/delete_psychologist.php',
        { id },
        { headers: { 'Authorization': `Bearer ${auth.accessToken}` } }
      )
      .then(response => {
        if (response.data.success) {
          toast.success(`Психолог ${e} успешно удален!`);
          closeModal();
          navigate('/admin/psychologists');
        } else {
          setMessageType('error');
          setMessage(response.data.message);
        }
      })
      .catch(error => {
        setMessageType('error');
        setMessage('Ошибка при удалении психолога');
        console.error('Ошибка при удалении психолога', error);
      });
  };

  const calculateAge = (birthDate) => {
    const today = new Date();
    const birth = new Date(birthDate);

    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    const dayDiff = today.getDate() - birth.getDate();

    if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
      age--;
    }

    return age;
  };

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


  return (
    <>
      <div className="title-admin">
        <h5>{user?.name}</h5>
        <Link className='subtitle-btn' to='/admin/psychologists'>Назад</Link>
      </div>
      <div className="one-user">
        <img src={user?.avatar ? `${avatarBaseUrl}${user.avatar}` : defaultAvatar} alt="" />
        <div className="one-user-content">
          <div className="info">
            Основная информация
            <div className="label">
              Имя
              <p>{user?.name}</p>
            </div>
            <div className="label">
              Дата рождения
              <p>{user?.birthday} ({calculateAge(user?.birthday)} {getUserLabel(calculateAge(user?.birthday))})</p>
            </div>
            <div className="label">
              Пол
              <p>{user?.gender}</p>
            </div>
          </div>
          <div className="info">
            Безопасность
            <div className="label">
              Почта
              <p>{user?.email}</p>
            </div>
          </div>
          <div className="info">
            О специалисте
            <div className="label">
              Опыт работы
              <p>{user?.experience}</p>
            </div>
            <div className="label">
              Стоимость сеанса
              <p>{user?.price.toLocaleString('ru-RU')} ₽</p>
            </div>
            <div className="label">
              Темы для сеанса
              <div className="topics">
                {user?.specializations?.map((specialization, index) => (
                  <span key={index}>{specialization}</span>
                ))}
              </div>
            </div>
            <div className="label">
              О специалисте
              <div className="block">
                <div className="holder">
                  <input type="checkbox" className="read-more-checker" id="read-more-checker" />
                  <div className="limited">
                    <div className='textcontent' dangerouslySetInnerHTML={{ __html: user?.about }} />
                    <div className="bottom"></div>
                  </div>
                  <label htmlFor="read-more-checker" className="read-more-button"></label>
                </div>
              </div>
            </div>
          </div>
          <div className="label">
            Расписание
            <div className="schedule-list">
              {Object.keys(groupedSchedule).length > 0 ? (
                Object.entries(groupedSchedule).map(([date, slots]) => (
                  <div key={date} className="date-item">
                    <h6>{date}</h6>
                    <div className="time-list">
                      {slots.map((slot) => (
                        <div
                          key={slot.id}
                          className={`time-item ${slot.u_id ? 'busy' : ''}`}
                          onClick={() => !slot.u_id && handleSlotClick(date, slot.time, slot.id)}
                        >
                          {slot.time}
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              ) : (
                <p className='none'>Психолог еще не выложил свое расписание.</p>
              )}
            </div>
          </div>
        </div>
      </div>
      <div className="user-btns">
        <div className="delete" onClick={openModal}>Удалить <img src="/icons/rmv.svg" alt="" /></div>
        <div className="update" onClick={openEdit}>Редактировать <img src="/icons/edt.svg" alt="" /></div>
      </div>
      {message && (
        <div className="message">
          <p className={messageType}>{message}</p>
        </div>
      )}
      {isModalOpen && (
        <div className="confirm">
          <Modal isOpen={isModalOpen} onClose={closeModal}>
            <h6>Вы действительно хотите удалить психолога с ID {user?.id}?</h6>
            <div className='row'>
              <button type="button" className='cancelbtn' onClick={closeModal}>Отменить</button>
              <button type="button" className='deletebtn' onClick={() => Delete(user?.name)}>Удалить</button>
            </div>
          </Modal>
        </div>
      )}
      {isEditOpen && (
        <div className="edit">
          <Modal isOpen={isEditOpen} onClose={closeEdit}>
            <h3>Редактировать психолога с ID {id} </h3>
            <div className="edit-content">
              <div className="label">
                <div className="label-title">
                  ФИО
                  <img src="/icons/edit.svg" alt="" />
                </div>
                <input type="text" name="name" value={editData.name} onChange={handleInputChange} placeholder="Иванов Иван Иванович" />
              </div>
              <div className="label">
                <div className="label-title">
                  Дата рождения
                  <img src="/icons/edit.svg" alt="" />
                </div>
                <div className="custom-date-input">
                  <input type="date" name="birthday" value={editData.birthday} onChange={handleInputChange} />
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
                <input type="number" name="experience" value={editData.experience} onChange={handleInputChange} placeholder="Опыт работы" />
              </div>
              <div className="label price-input">
                <div className="label-title">
                  Стоимость сеанса
                  <img src="/icons/edit.svg" alt="" />
                </div>
                <p>₽</p>
                <input type="number" name="price" value={editData.price} onChange={handleInputChange} placeholder="Стоимость сеанса" />
              </div>
              <div className="label">
                <div className="label-title">
                  О специалисте
                  <img src="/icons/edit.svg" alt="" />
                </div>
                <textarea name="about" value={editData.about} onChange={handleInputChange} placeholder="О специалисте"> </textarea>
              </div>
              <div className="label">
                <div className="label-title">
                  Аватар
                  <img src="/icons/edit.svg" alt="" />
                </div>
                <div className="avatar">
                  <label htmlFor="file">
                    <img src="/icons/upload.svg" alt="" /> Загрузить фото
                  </label>
                  <input type="file" id='file' onChange={handleFileChange} />
                  {editData.avatar && (
                    <img className='look' src={URL.createObjectURL(editData.avatar)} alt="Предпросмотр" />
                  )}
                </div>
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
            </div>
            {message && (
              <div className="message">
                <p className={messageType}>{message}</p>
              </div>
            )}
            <div className="row">
              <button className='cancelbtn' onClick={closeEdit}>Назад</button>
              <button className='subtitle-btn' onClick={saveEdit}>Сохранить</button>
            </div>
          </Modal>
        </div>
      )}
    </>
  );
}
