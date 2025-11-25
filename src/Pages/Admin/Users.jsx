import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

export default function Users() {
    const [users, setUsers] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const usersPerPage = 3;
    const avatarBaseUrl = 'http://psychosearch/store/avatars/';
    const defaultAvatar = 'http://psychosearch/public/img/avatar.svg';

    useEffect(() => {
        axios.get('http://psychosearch/store/actions/get_users.php')
            .then(response => {
                setUsers(response.data);
            })
            .catch(error => {
                console.error('Ошибка при получении списка пользователей', error);
            });
    }, []);

    const filteredUsers = users.filter(user => user.role === 'user' || user.role === 'ban');

    const getUserLabel = (count) => {
        if (count % 10 === 1 && count % 100 !== 11) {
            return 'пользователь найден';
        } else if (count % 10 >= 2 && count % 10 <= 4 && (count % 100 < 10 || count % 100 >= 20)) {
            return 'пользователя найдено';
        } else {
            return 'пользователей найдено';
        }
    };

    const startIndex = (currentPage - 1) * usersPerPage;
    const endIndex = startIndex + usersPerPage;
    const currentUsers = filteredUsers.slice(startIndex, endIndex);
    const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

    const goToPage = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    return (
        <>
            <div className="title-admin">
                <h5>Пользователи</h5>
                <p>{filteredUsers.length} {getUserLabel(filteredUsers.length)}</p>
            </div>
            {filteredUsers.length === 0 ? (
                <p>Пользователей пока нет</p>
            ) : (
                <div className="user-list">
                    <div className="title-list">
                        <p>id</p>
                        <p className='name'>Имя</p>
                        <p>Почта</p>
                        <p>Дата рег.</p>
                    </div>
                    {currentUsers.map(user => (
                        <div key={user.id}>
                            <Link className='user' to={`user/${user.id}`}>
                                <p><span>id: </span>{user.id}</p>
                                <p className='name'> <span>Имя: </span>
                                    <img src={user.avatar ? `${avatarBaseUrl}${user.avatar}` : defaultAvatar} alt="" />
                                    {user.name}
                                </p>
                                <p><span>Почта: </span>{user.email}</p>
                                <p> <span>Дата рег.: </span>{user.created_at.split(' ')[0]}</p>
                            </Link>
                        </div>
                    ))}
                </div>
            )}
            {filteredUsers.length > usersPerPage && (
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
