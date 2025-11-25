import { useEffect, useState, useContext } from "react";
import axios from 'axios';
import { AuthContext } from '../../../Components/Header/AuthContext';
import Modal from '../../../Components/Modal/Modal';
import './Schedule.css';
import { toast } from 'react-toastify';

export default function Schedule() {

    const { auth } = useContext(AuthContext);
    const [schedule, setSchedule] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [selectedSlotId, setSelectedSlotId] = useState(null);
    const [newDate, setNewDate] = useState("");
    const [newTime, setNewTime] = useState("");

    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState('');

    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 2;
    useEffect(() => {
        fetchSchedule()
    }, [schedule])
    const fetchSchedule = async () => {
        try {
            const response = await axios.post(
                'http://psychosearch/store/actions/get_schedule.php',
                { psychologist_id: auth.user.id },
                {
                    headers: {
                        'Authorization': `Bearer ${auth.accessToken}`,
                    },
                }
            );
            if (response.data.success) {
                setSchedule(response.data.schedule);
            } else {
                setError(response.data.message);
            }
        } catch (error) {
            setError("Ошибка загрузки расписания.");
        } finally {
            setLoading(false);
        }
    };

    const openModal = (slotId) => {
        setSelectedSlotId(slotId);
        setIsModalOpen(true);
        document.body.style.overflow = 'hidden';
    };

    const closeModal = () => {
        setSelectedSlotId(null);
        setIsModalOpen(false);
        document.body.style.overflow = '';
    };

    const openAdd = () => {
        setIsAddOpen(true);
        document.body.style.overflow = 'hidden';
    };

    const closeAdd = () => {
        setIsAddOpen(false);
        document.body.style.overflow = '';
        setNewDate("");
        setNewTime("");
        setMessage('');
        setMessageType('');
    };

    const deleteTime = async (id) => {
        try {
            const response = await axios.post(
                'http://psychosearch/store/actions/delete_time.php',
                { id },
                {
                    headers: {
                        'Authorization': `Bearer ${auth.accessToken}`,
                        'Content-Type': 'application/json',
                    },
                }
            );

            if (response.data.success) {
                toast.success(`Расписание успешно удалено!`);
                const updatedSchedule = schedule.filter(slot => slot.id !== id);
                setSchedule(updatedSchedule);
                const totalPages = Math.ceil(updatedSchedule.length / itemsPerPage);
                if (currentPage > totalPages) {
                    setCurrentPage(totalPages);
                }
                closeAdd();
            } else {
                setMessage(response.data.message || 'Не удалось удалить время.');
            }
        } catch (error) {
            setError('Ошибка при удалении времени.');
        }
    };


    const addSchedule = async () => {

        const formData = new FormData();
        formData.append('psychologist_id', auth.user.id);
        formData.append('date', newDate);
        formData.append('time', newTime);

        try {
            const response = await axios.post(
                'http://psychosearch/store/actions/add_schedule.php',
                formData,
                {
                    headers: {
                        'Authorization': `Bearer ${auth.accessToken}`,
                    },
                }
            );
            console.log('Ответ от сервера:', response.data);

            if (response.data.success) {
                toast.success(`Расписание успешно добавлено!`);
                const newSchedule = response.data.schedule;
                const updatedSchedule = [...schedule, newSchedule];
                setSchedule(prevSchedule => [...prevSchedule, newSchedule]);
                closeAdd();
                const newTotalPages = Math.ceil(updatedSchedule.length / itemsPerPage);
                setCurrentPage(newTotalPages);
            } else {
                setMessage(response.data.message);
                setMessageType('err');
            }
        } catch (error) {
            console.log('Ошибка при добавлении расписания:', error);
            setMessage('Ошибка при добавлении расписания.');
            setMessageType('err');
        }
    };

    useEffect(() => {
        fetchSchedule();
    }, []);

    if (loading) return <div>Загрузка расписания...</div>;
    if (error) return <div>{error}</div>;

    const groupedSchedule = Array.isArray(schedule) ? schedule.reduce((acc, slot) => {
        if (!slot || !slot.date) {
            return acc;
        }

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
    }, {}) : {};

    const dates = Object.keys(groupedSchedule);
    const totalPages = Math.ceil(dates.length / itemsPerPage);

    const paginatedDates = dates.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const goToPage = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    return (
        <>
            <div className="schedule">
                <div className="title-add">
                    <div className="title-admin">
                        <h5>Расписание</h5>
                    </div>
                    <div onClick={openAdd} className='subtitle-btn'>Добавить расписание +</div>
                </div>
                <div className="schedule-list">
                    {schedule.length > 0 ? (
                        paginatedDates.map((date) => (
                            <div key={date} className="date-item">
                                <h6>{date}</h6>
                                <div className="time-list">
                                    {groupedSchedule[date].map((slot) => (
                                        <div key={slot.id} className={`time-item ${slot.u_id ? 'busy' : ''}`}>
                                            {slot.time}
                                            {!slot.u_id && (
                                                <img className="delete-slot" src='/icons/rmv.svg' onClick={() => openModal(slot.id)} alt="Удалить" />
                                            )}
                                            {isModalOpen && selectedSlotId === slot.id && (
                                                <div className="confirm">
                                                    <Modal isOpen={isModalOpen} onClose={closeModal}>
                                                        <h6>Вы действительно хотите удалить это время ({date} {slot.time})?</h6>
                                                        <div className="row">
                                                            <button className="cancelbtn" type="button" onClick={closeModal}>Отменить</button>
                                                            <button className="deletebtn" type="button" onClick={() => deleteTime(slot.id)}>Удалить</button>
                                                        </div>
                                                    </Modal>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))
                    ) : (
                        <p>У вас пока нет расписания.</p>
                    )}
                </div>
                {dates.length > itemsPerPage && (
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

            {isAddOpen && (
                <div className="adddate">
                    <Modal isOpen={isAddOpen} onClose={closeAdd}>
                        <h6>Добавить расписание</h6>
                        <div className="label">
                            Дата
                            <div className="custom-date-input">
                                <input type="date" value={newDate} onChange={(e) => setNewDate(e.target.value)} />
                            </div>
                        </div>
                        <div className="label">
                            Время
                            <div className="custom-time-input">
                                <input type="time" value={newTime} onChange={(e) => setNewTime(e.target.value)} />
                            </div>
                        </div>
                        {message && (
                            <div className="message">
                                <p className={messageType}>{message}</p>
                            </div>
                        )}
                        <div className="row">
                            <button type="button" className="cancelbtn" onClick={closeAdd}>Отменить</button>
                            <button type="button" onClick={function () {
                                addSchedule();
                            }} className="subtitle-btn">Сохранить</button>
                        </div>

                    </Modal>
                </div>
            )}
        </>
    )
}
