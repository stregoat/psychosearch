import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

export default function Users() {
    const [users, setUsers] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const usersPerPage = 3;

    useEffect(() => {
        axios.get('http://psychosearch/store/actions/get_vacancies.php')
            .then(response => {
                setUsers(response.data);
            })
            .catch(error => {
                console.error('Ошибка при получении списка пользователей', error);
            });
    }, []);

    const getUserLabel = (count) => {
        if (count % 10 === 1 && count % 100 !== 11) {
            return 'вакансия найдена';
        } else if (count % 10 >= 2 && count % 10 <= 4 && (count % 100 < 10 || count % 100 >= 20)) {
            return 'вакансий найдено';
        } else {
            return 'вакансий найдено';
        }
    };

    const startIndex = (currentPage - 1) * usersPerPage;
    const endIndex = startIndex + usersPerPage;
    const currentUsers = users.slice(startIndex, endIndex);
    const totalPages = Math.ceil(users.length / usersPerPage);

    const goToPage = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    return (
        <>
            <div className="title-admin">
                <h5>Вакансии</h5>
                <p>{users.length} {getUserLabel(users.length)}</p>
            </div>
            {users.length === 0 ? (
                <p>Вакансий пока нет</p>
            ) : (
                <div className="user-list">
                    <div className="title-list">
                        <p>ФИО</p>
                        <p>Телефон</p>
                        <p>Почта</p>
                        <p>Дата подачи</p>
                    </div>
                    {currentUsers.map(user => (
                        <div key={user.id}>
                            <Link className='user' to={`vacancy/${user.id}`}>
                                <p> <span>ФИО: </span>
                                    {user.name}
                                </p>
                                <p><span>Телефон: </span>{user.phone}</p>
                                <p><span>Почта: </span>{user.email}</p>
                                <p> <span>Дата подачи: </span>{user.created_at.split(' ')[0]}</p>
                            </Link>
                        </div>
                    ))}
                </div>
            )}
            {users.length > usersPerPage && (
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
                </div>)}
        </>
    );
}
