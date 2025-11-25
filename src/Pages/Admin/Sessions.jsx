import { useState, useEffect } from 'react';
import axios from 'axios';

export default function Sessions() {
    const [sessions, setSessions] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const sessionsPerPage = 3;
    const avatarBaseUrl = 'http://psychosearch/store/avatars/';
    const defaultAvatar = 'http://psychosearch/public/img/avatar.svg';

    useEffect(() => {
        axios.get('http://psychosearch/store/actions/get_admin_sessions.php')
            .then(response => {
                setSessions(response.data.sessions || []);
            })
            .catch(error => {
                console.error('Ошибка при получении списка сессий', error);
            });
    }, []);

    const getSessionLabel = (count) => {
        if (count % 10 === 1 && count % 100 !== 11) {
            return 'сессия найдена';
        } else if (count % 10 >= 2 && count % 10 <= 4 && (count % 100 < 10 || count % 100 >= 20)) {
            return 'сессии найдено';
        } else {
            return 'сессий найдено';
        }
    };

    const startIndex = (currentPage - 1) * sessionsPerPage;
    const endIndex = startIndex + sessionsPerPage;
    const currentSessions = sessions.slice ? sessions.slice(startIndex, endIndex) : []; 
    const totalPages = Math.ceil(sessions.length / sessionsPerPage);

    const goToPage = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    return (
        <>
            <div className="title-admin">
                <h5>Сессии</h5>
                <p>{sessions.length} {getSessionLabel(sessions.length)}</p>
            </div>
            {sessions.length !== 0 ? (
                <>
            <div className="user-list">
                <div className="title-list">
                    <p> id</p>
                    <p className='name1'>Психолог</p>
                    <p>Клиент</p>
                    <p>Дата и время</p>
                    <p className='price1'>Стоимость</p>
                    <p className='price1'>Статус</p>
                </div>
                {currentSessions.map(session => (
                    <div key={session.id}>
                        <div className='user' >
                            <p> <span>id: </span> {session.id}</p>
                            <p className='name1'>
                            <span>Психолог: </span>
                                <img src={session.psychologist_avatar ? `${avatarBaseUrl}${session.psychologist_avatar}` : defaultAvatar} alt="Психолог" />
                                {session.psychologist_name}
                            </p>
                            <p>
                            <span>Клиент: </span>
                                <img src={session.user_avatar ? `${avatarBaseUrl}${session.user_avatar}` : defaultAvatar} alt="Клиент" />
                                {session.user_name}
                            </p>
                            <p className='date1'>
                            <span>Дата и время: </span>
                                {session.formatted_date} <br/> {session.time}
                            </p>
                            <p className='price1'>
                            <span>Стоимость: </span>{session.price.toLocaleString('ru-RU')}₽</p>
                            <p className='price1'>
                            <span>Статус: </span>
                                {session.status}</p>
                        </div>
                    </div>
                ))}
            </div>
            </>
            ) : (
                <p>Сессий не обнаружено</p>
            )}
            {sessions.length > sessionsPerPage && (
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
        </>
    );
}
