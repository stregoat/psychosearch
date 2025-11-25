import { Link } from 'react-router-dom'
import './Catalog.css'
import { useState, useEffect } from "react";
import axios from 'axios';
import Modal from '../../Components/Modal/Modal'
import FilterAccord from '../../Components/FilterAccord/FilterAccord'
export default function Catalog() {
    const [isModalOpen, setIsOpen] = useState(false)
    const openModal = () => setIsOpen(true)
    const closeModal = () => setIsOpen(false)
    const [users, setUsers] = useState([]);
    const [specializations, setSpecializations] = useState([]);
    const avatarBaseUrl = 'http://psychosearch/store/avatars/'
    const defaultAvatar = 'http://psychosearch/public/img/avatar.svg';
    useEffect(() => {
        axios.get('http://psychosearch/store/actions/get_psychologists.php')
            .then(response => {
                setUsers(response.data);
            })
            .catch(error => {
                console.error('Ошибка при получении списка психологов', error);
            });
    }, []);
    useEffect(() => {
        axios.get('http://psychosearch/store/actions/get_specializations.php')
            .then(response => {
                setSpecializations(response.data);
            })
            .catch(error => {
                console.error('Ошибка при получении списка специализаций', error);
            });
    }, []);
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
    const [sortOrder, setSortOrder] = useState('popular');
    const handleSortChange = (value) => {
        setSortOrder(value);
        setOpen(false);
    };
    useEffect(() => {
        axios.get('http://psychosearch/store/actions/get_psychologists.php')
            .then(response => {
                let sortedData = response.data;

                if (sortOrder === 'increase') {
                    sortedData = sortedData.sort((a, b) => a.price - b.price);
                } else if (sortOrder === 'dicrease') {
                    sortedData = sortedData.sort((a, b) => b.price - a.price);
                }
                setUsers(sortedData);
            })
            .catch(error => {
                console.error('Ошибка при получении списка психологов', error);
            });
    }, [sortOrder]);
    const [searchQuery, setSearchQuery] = useState('');
    const [filteredUsers, setFilteredUsers] = useState(users);

    const handleSearchChange = (event) => {
        setSearchQuery(event.target.value.toLowerCase());
    };
    const performSearch = () => {
        const filtered = users.filter(user =>
            user.name.toLowerCase().includes(searchQuery) ||
            (user.specializations && user.specializations.some(spec =>
                spec.toLowerCase().includes(searchQuery)
            ))
        );
        setFilteredUsers(filtered);
    };
    const [filters, setFilters] = useState({
        price: [],
        experience: [],
        age: [],
        gender: [],
        specializations: []
    });
    const handleFilterChange = (type, value) => {
        if (type === 'specializations') {
            setFilters(prevFilters => {
                const updatedSpecializations = prevFilters.specializations.includes(value)
                    ? prevFilters.specializations.filter(spec => spec !== value)
                    : [...prevFilters.specializations, value];

                return { ...prevFilters, specializations: updatedSpecializations };
            });
        } else {
            setFilters(prevFilters => {
                const updatedFilters = { ...prevFilters };
                const index = updatedFilters[type].findIndex(item =>
                    Array.isArray(item) && Array.isArray(value)
                        ? item.length === value.length && item.every((val, idx) => val === value[idx])
                        : item === value
                );

                if (index !== -1) {
                    updatedFilters[type] = updatedFilters[type].filter((_, i) => i !== index);
                } else {
                    updatedFilters[type].push(value);
                }

                return updatedFilters;
            });
        }
    };
    const applyFilters = () => {
        const filtered = users.filter(user => {
            const priceMatch = filters.price.length === 0 || filters.price.some(price => user.price <= price);

            const experienceMatch = filters.experience.length === 0 || filters.experience.some(exp => user.experience >= exp);

            const ageMatch = filters.age.length === 0 || filters.age.some(age => calculateAge(user.birthday) >= age[0] && calculateAge(user.birthday) <= age[1]);

            const genderMatch = filters.gender.length === 0 || filters.gender.includes(user.gender);

            const specializationsMatch = filters.specializations.length === 0 ||
                (user.specializations && filters.specializations.every(spec => {
                    const match = user.specializations.includes(spec);
                    return match;
                }));

            return priceMatch && experienceMatch && ageMatch && genderMatch && specializationsMatch;
        });
        setFilteredUsers(filtered);
    };
    const resetFilters = () => {
        setFilters({
            price: [],
            experience: [],
            age: [],
            gender: [],
            specializations: []
        });
        const checkboxes = document.querySelectorAll('.custom-checkbox');
        checkboxes.forEach(checkbox => {
            checkbox.checked = false;
        });
        setFilteredUsers(users);
    };
    const [currentPage, setCurrentPage] = useState(1);
    const usersPerPage = 6;
    const startIndex = (currentPage - 1) * usersPerPage;
    const endIndex = startIndex + usersPerPage;
    const currentUsers = filteredUsers.slice(startIndex, endIndex);
    const totalPages = Math.ceil(filteredUsers.length / usersPerPage);
    const goToPage = (pageNumber) => {
        setCurrentPage(pageNumber);
    };
    useEffect(() => {
        if (users.length > 0) {
            performSearch();
        }
    }, [users]);
    const [isOpen, setOpen] = useState(false);
    const toggleDropdown = () => {
        setOpen(!isOpen);
    };
    return (
        <>
            <div className="bread">
                <Link className='breadlink' to="/"> Главная </Link>
                <img src="/icons/to.svg" alt="" />
                <Link className='breadlink' to="/catalog">Психологи</Link>
            </div>
            <div className="title-row mt-50">
                <div className="title">
                    Психологи
                </div>
                <p>{users.length} квалифицированных специалистов с проверенным образованием и опытом, прошедших строгий отбор</p>
            </div>
            <div className="filter-row">
                <div className="select-container">
                    <div className="custom-select" onClick={toggleDropdown}>
                        <span>{sortOrder === 'popular' ? 'Сначала рекомендованные' : sortOrder === 'increase' ? 'Сначала дешевле' : 'Сначала дороже'}</span>
                        <img src="/icons/select.svg" alt="" className={`select-icon ${isOpen ? 'open' : ''}`} />
                        {isOpen && (
                            <div className="dropdown-list">
                                <div className="dropdown-item" onClick={() => handleSortChange('popular')}>
                                    Сначала рекомендованные
                                </div>
                                <div className="dropdown-item" onClick={() => handleSortChange('increase')}>
                                    Сначала дешевле
                                </div>
                                <div className="dropdown-item" onClick={() => handleSortChange('dicrease')}>
                                    Сначала дороже
                                </div>
                            </div>
                        )}
                    </div>
                </div>
                <div className='fltr'>
                    <form onSubmit={(e) => {
                        e.preventDefault();
                        performSearch();
                    }}>
                        <input type="text" value={searchQuery}
                            onChange={handleSearchChange} placeholder='Поиск...' />
                        <button type="submit"><img src="/icons/search.svg" alt="" /></button>
                    </form>
                    <button onClick={openModal}>
                        Фильтры <img src="/icons/filter.svg" alt="" />
                    </button>
                    <Modal isOpen={isModalOpen} onClose={closeModal} className="fltrs">
                        <div className="title-row">
                            <div className="title">
                                Фильтры
                            </div>
                        </div>
                        <div className="filter-content">
                            <div className="filters">
                                <FilterAccord title="Симптомы">
                                    <div className='spec'>
                                        {specializations.map(spec => (
                                            <div key={spec.specialization}>
                                                <input className="custom-checkbox"
                                                    type="checkbox"
                                                    id={spec.specialization}
                                                    onChange={() => handleFilterChange('specializations', spec.specialization)}
                                                    checked={filters.specializations && filters.specializations.includes(spec.specialization)}
                                                />
                                                <label htmlFor={spec.specialization}>
                                                    {spec.specialization}
                                                </label>
                                            </div>
                                        ))}
                                    </div>
                                </FilterAccord>
                                <FilterAccord title="Цена">
                                    <div className="spec">
                                        <div className="price">
                                            <input className="custom-checkbox"
                                                type="checkbox"
                                                id='pr1'
                                                onChange={() => handleFilterChange('price', 3000)}
                                                checked={filters.price.includes(3000)}
                                            />
                                            <label htmlFor="pr1">До 3 000 ₽</label>
                                            Опыт от 3 лет, прошли личное собеседование и подтвердили образование
                                        </div>
                                        <div className="price">
                                            <input className="custom-checkbox"
                                                type="checkbox"
                                                id='pr2'
                                                onChange={() => handleFilterChange('price', 5000)}
                                                checked={filters.price.includes(5000)}
                                            />
                                            <label htmlFor="pr2">До 5 000 ₽</label>
                                            Опыт от 5 лет, провели более 200 сессий и зарекомендовали себя
                                        </div>
                                        <div className="price">
                                            <input className="custom-checkbox"
                                                type="checkbox"
                                                id='pr3'
                                                onChange={() => handleFilterChange('price', 7000)}
                                                checked={filters.price.includes(7000)}
                                            />
                                            <label htmlFor="pr3" >До 7 000 ₽</label>
                                            Опыт от 7 лет, самые востребованные психологи, кандидаты наук
                                        </div>
                                    </div>
                                </FilterAccord>
                                <FilterAccord title="Опыт">
                                    <div className="spec">
                                        <input className="custom-checkbox"
                                            type="checkbox"
                                            id='exp1'
                                            onChange={() => handleFilterChange('experience', 3)}
                                            checked={filters.experience.includes(3)}
                                        />
                                        <label htmlFor='exp1'>
                                            От 3 лет
                                        </label>
                                        <input className="custom-checkbox"
                                            type="checkbox"
                                            id='exp2'
                                            onChange={() => handleFilterChange('experience', 5)}
                                            checked={filters.experience.includes(5)}
                                        />
                                        <label htmlFor='exp2'>
                                            От 5 лет
                                        </label>
                                        <input className="custom-checkbox"
                                            type="checkbox"
                                            id='exp3'
                                            onChange={() => handleFilterChange('experience', 7)}
                                            checked={filters.experience.includes(7)}
                                        />
                                        <label htmlFor='exp3'>
                                            От 7 лет
                                        </label>
                                    </div>
                                </FilterAccord>
                                <FilterAccord title="Возраст">
                                    <div className="spec">
                                        <input className="custom-checkbox"
                                            type="checkbox"
                                            id='age1'
                                            onChange={() => handleFilterChange('age', [0, 25])}
                                            checked={filters.age.some(age => Array.isArray(age) && age[0] === 0 && age[1] === 25)}
                                        />
                                        <label htmlFor='age1'>
                                            До 25 лет
                                        </label>
                                        <input className="custom-checkbox"
                                            type="checkbox"
                                            id='age2'
                                            onChange={() => handleFilterChange('age', [25, 35])}
                                            checked={filters.age.some(age => Array.isArray(age) && age.length === 2 && age[0] === 25 && age[1] === 35)}
                                        />
                                        <label htmlFor='age2'>
                                            25-35 лет
                                        </label>
                                        <input className="custom-checkbox"
                                            type="checkbox"
                                            id='age3'
                                            onChange={() => handleFilterChange('age', [35, 45])}
                                            checked={filters.age.some(age => Array.isArray(age) && age.length === 2 && age[0] === 35 && age[1] === 45)}
                                        />
                                        <label htmlFor='age3'>
                                            35-45 лет
                                        </label>
                                        <input className="custom-checkbox"
                                            type="checkbox"
                                            id='age4'
                                            onChange={() => handleFilterChange('age', [45, 100])}
                                            checked={filters.age.some(age => Array.isArray(age) && age.length === 2 && age[0] === 45 && age[1] === 100)}
                                        />
                                        <label htmlFor='age4'>
                                            От 45 лет
                                        </label>
                                    </div>
                                </FilterAccord>
                                <FilterAccord title="Пол">
                                    <div className="spec">
                                        <input className="custom-checkbox"
                                            type="checkbox"
                                            id='male'
                                            onChange={() => handleFilterChange('gender', 'Мужской')}
                                            checked={filters.gender.includes('Мужской')}
                                        />
                                        <label htmlFor='male'>
                                            Мужской
                                        </label>
                                        <input className="custom-checkbox"
                                            type="checkbox"
                                            id='female'
                                            onChange={() => handleFilterChange('gender', 'Женский')}
                                            checked={filters.gender.includes('Женский')}
                                        />
                                        <label htmlFor='female'>
                                            Женский
                                        </label>
                                    </div>
                                </FilterAccord>
                            </div>
                        </div>
                        <div className="btns-row">
                            <div className="cancelbtn" onClick={function () { resetFilters(); closeModal(); }}>Очистить</div>
                            <div className="subtitle-btn" onClick={function () { applyFilters(); closeModal(); }}>Применить</div>
                        </div>
                    </Modal>
                </div>
            </div>
            <div className="catalog">
                {currentUsers.length > 0 ? (
                    currentUsers.map(user =>
                    (
                        <div key={user.id}>
                            <Link className="card" to={`/psychologist/${user.id}`}>
                                <img src={user.avatar ? `${avatarBaseUrl}${user.avatar}` : defaultAvatar} alt="" />
                                <h6>{user.name}</h6>
                                <div className="row">
                                    {calculateAge(user.birthday)} {getUserLabel(calculateAge(user.birthday))} <span> —— </span> {user.experience} {getUserLabel(user.experience)} опыта
                                </div>
                                <div className="label">
                                    Стоимость сеанса
                                    <p>{user.price.toLocaleString('ru-RU')} ₽</p>
                                </div>
                                <div className="label">
                                    Темы для сеанса
                                    <div className="topics">
                                        {user.specializations && user.specializations.map((specialization, index) => (
                                            <p key={index}>{specialization}</p>
                                        ))}
                                    </div>
                                </div>
                            </Link>
                        </div>
                    ))
                ) : (
                    <div className='result'> По Вашему запросу ничего не найдено.</div>
                )}
            </div>
            {currentUsers.length > 0 && (
                <div className="pagination">
                    {currentPage > 1 && (
                        <div className='prevpage' onClick={() => goToPage(currentPage - 1)}>
                            <img src="/icons/select.svg" alt="" />
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
                            <img src="/icons/select.svg" alt="" />
                        </div>
                    )}
                </div>
            )
            }
        </>
    )
}

