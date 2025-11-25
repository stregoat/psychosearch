import { useState } from "react";
import { Link, useNavigate } from 'react-router-dom';
import './Sign.css'
import Modal from '../../Components/Modal/Modal';

export default function Register() {
    const navigate = useNavigate()

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [passwordConfirm, setPasswordConfirm] = useState('');
    const [name, setName] = useState('');
    const [agree, setAgree] = useState('');
    const [errors, setErrors] = useState({})

    const [message, setMessage] = useState('')

    const validateForm = async () => {
        const newErrors = {}

        const regexname = /^[a-zA-Zа-яА-Я]+$/

        if (!name) {
            newErrors.name = 'Заполните имя'
        }
        else if (!regexname.test(name)) {
            newErrors.name = 'Имя должно содержать только буквы'
        }
        else if (name.length < 2) {
            newErrors.name = 'Слишком короткое имя'
        }

        const regex = /\S+@\S+\.\S+/
        if (!email) {
            newErrors.email = 'Заполните почту'
        }
        else if (!regex.test(email)) {
            newErrors.email = 'Неверный формат почты'
        }
        else {
            const emailExists = await checkEmailExists();
            if (emailExists) {
                newErrors.email = 'Пользователь с такой почтой уже существует';
            }
        }

        if (!password) {
            newErrors.password = 'Заполните пароль'
        }
        else if (password.length < 6) {
            newErrors.password = 'Пароль должен содержать больше 6 символов'
        }

        if (!passwordConfirm) {
            newErrors.passwordConfirm = 'Подтвердите пароль'
        }
        else if (password !== passwordConfirm) {
            newErrors.passwordConfirm = 'Пароли не совпадают'
        }

        if (!agree) {
            newErrors.agree = 'Соглашение является обязательным'
        }


        setErrors(newErrors)

        return Object.keys(newErrors).length === 0
    }

    const checkEmailExists = async () => {
        const response = await fetch('http://psychosearch/store/actions/register.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ emailCheck: email })
        });

        const data = await response.json();
        return data.exists;
    };

    const handleRegister = async (e) => {

        e.preventDefault()

        if (validateForm()) {
            const response = await fetch('http://psychosearch/store/actions/register.php',
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ name, email, password, passwordConfirm, agree })
                })

            const data = await response.json()

            if (data.success) {
                navigate('/login')
            }

            setMessage(data.message)
            console.log(data);
        }
    }

    const handleNameChange = (e) => {
        const value = e.target.value;
        const formattedName = value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
        setName(formattedName);
    };

    const handleEmailChange = (e) => {
        const value = e.target.value;
        setEmail(value.toLowerCase());
    };

    const [isModalOpen, setIsOpen] = useState(false);
    const openModal = () => {
        setIsOpen(true);
        document.body.style.overflow = 'hidden';
    };
    const closeModal = () => {
        setIsOpen(false);
        document.body.style.overflow = '';
    };

    return (
        <>
            <div className='sign-row'>
                <div className="left-block">
                    <div className="content-form">
                        <div className='subtitle'>Добро пожаловать!</div>
                        <p>Есть аккаунт?</p>
                        <Link to="/login"><div className="mainbtn">Войти <img src="logo/Arrow.svg" alt="" /></div> </Link>
                    </div>
                </div>
                <div className="right-block">
                    <div className="content-form">
                        <div className='subtitle'>Создать аккаунт</div>
                        <form onSubmit={handleRegister}>
                            <div className="label">
                                Имя
                                <input type="text" placeholder='Ваше имя или псевдоним'
                                    value={name}
                                    className={errors.name ? 'error' : ''}
                                    onChange={(e) => {
                                        setName(e.target.value);
                                        handleNameChange(e);
                                    }}
                                    onBlur={() => validateForm()} />
                                {errors.name && <p className='errortext'>{errors.name}</p>}
                            </div>
                            <div className="label">
                                Почта
                                <input type="text" placeholder='example@example.example'
                                    value={email}
                                    className={errors.email ? 'error' : ''}
                                    onChange={(e) => {
                                        setEmail(e.target.value);
                                        handleEmailChange(e);
                                    }}
                                    onBlur={() => validateForm()}

                                />
                                {errors.email && <p className='errortext'>{errors.email}</p>}
                            </div>
                            <div className="label">
                                Пароль
                                <input type="password" placeholder='••••••'
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className={errors.password ? 'error' : ''}
                                    onBlur={() => validateForm()}
                                />
                                {errors.password && <p className='errortext'>{errors.password}</p>}
                            </div>
                            <div className="label">
                                Подтвердить пароль
                                <input type="password" placeholder='••••••'
                                    value={passwordConfirm}
                                    onChange={(e) => setPasswordConfirm(e.target.value)}
                                    className={errors.passwordConfirm ? 'error' : ''}
                                    onBlur={() => validateForm()}
                                />
                                {errors.passwordConfirm && <p className='errortext'>{errors.passwordConfirm}</p>}
                            </div>
                            <div className="agree">
                                <input id="agree" className="custom-checkbox" type="checkbox"
                                    onChange={(e) => setAgree(e.target.value)}
                                />
                                <label for="agree">
                                    Я соглашаюсь с <span onClick={openModal}> Политикой конфиденциальности <br /> и правилами пользования системой</span> </label>
                                {errors.agree && <p className='errortext'>{errors.agree}</p>}
                            </div>
                            <button type="submit" className='mainbtn'>Зарегистрироваться <img src="logo/Arrow.svg" alt="" /></button>
                        </form>
                    </div>
                </div>
            </div>
            {isModalOpen && (
                <div className="agreeuser">
                    <Modal isOpen={isModalOpen} onClose={closeModal} >
                        <div className="agree-header">
                            Политика конфиденциальности  и правила пользования системой
                        </div>
                        <div>
                            <strong>1. Общие положения</strong><br />
                            Настоящая Политика конфиденциальности определяет порядок обработки и защиты персональных данных пользователей сайта <strong>psychosearch.ru</strong> (далее — Сайт).<br /><br />

                            <strong>2. Сбор и обработка данных</strong><br />
                            Мы собираем только те персональные данные, которые вы добровольно предоставляете при регистрации, заполнении анкеты, бронировании сессий или при обращении в службу поддержки. Это может включать: имя, email, телефон, возраст, пол и другую информацию.<br /><br />

                            <strong>3. Цель обработки данных</strong><br />
                            Данные используются для:<br />
                            — предоставления доступа к функционалу Сайта;<br />
                            — подбора подходящего специалиста;<br />
                            — организации консультаций;<br />
                            — уведомлений и поддержки.<br /><br />

                            <strong>4. Передача данных третьим лицам</strong><br />
                            Данные не передаются третьим лицам без согласия, за исключением необходимых случаев (например, передача психологу при записи).<br /><br />

                            <strong>5. Безопасность</strong><br />
                            Мы принимаем все необходимые меры для защиты данных от утечки, потери и несанкционированного доступа.<br /><br />

                            <strong>6. Права пользователя</strong><br />
                            Вы имеете право на:<br />
                            — доступ к своим данным;<br />
                            — их исправление или удаление;<br />
                            — отзыв согласия на обработку.<br /><br />

                            <strong>7. Контакты</strong><br />
                            По вопросам защиты данных: <a href="mailto:info@psychosearch.ru">info@psychosearch.ru</a><br /><br />

                            <h2>Правила пользования системой</h2>

                            <strong>1. Общие положения</strong><br />
                            Сайт <strong>psychosearch.ru</strong> предоставляет возможность подбора и записи к психологу онлайн. Используя сайт, вы соглашаетесь с данными правилами.<br /><br />

                            <strong>2. Регистрация и ответственность</strong><br />
                            — Предоставляйте достоверные данные при регистрации.<br />
                            — Вы несёте ответственность за сохранность своего логина и пароля.<br />
                            — Администрация не отвечает за доступ третьих лиц к аккаунту по вашей вине.<br /><br />

                            <strong>3. Услуги платформы</strong><br />
                            Вы получаете доступ к анкете, поиску психологов, бронированию сессий, отзыву о специалисте.<br /><br />

                            <strong>4. Запрещенные действия</strong><br />
                            — Публикация ложной информации;<br />
                            — Нарушение прав других пользователей;<br />
                            — Незаконное использование платформы.<br /><br />

                            <strong>5. Ответственность</strong><br />
                            — Администрация не несёт ответственности за действия специалистов, но может ограничить доступ по жалобам.<br />
                            — Вы несёте ответственность за переданную информацию.<br /><br />

                            <strong>6. Изменение правил</strong><br />
                            Администрация может обновлять правила. Актуальная версия публикуется на сайте.<br /><br />
                        </div>
                    </Modal>
                </div>
            )}
        </>
    )
}

