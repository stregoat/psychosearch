import { useState, useContext, useEffect } from "react"
import { Link, useNavigate } from 'react-router-dom';
import './Sign.css'
import axios from 'axios';
import { AuthContext } from '../../Components/Header/AuthContext'
export default function Login() {
    const navigate = useNavigate()
    const { login, auth } = useContext(AuthContext)
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [errors, setErrors] = useState({})
    const [message, setMessage] = useState('')
    const validateForm = async () => {
        const newErrors = {}
        const regex = /\S+@\S+\.\S+/
        if (!email) {
            newErrors.email = 'Заполните почту'
        }
        else if (!regex.test(email)) {
            newErrors.email = 'Неверный формат почты'
        }

        if (!password) {
            newErrors.password = 'Заполните пароль'
        }
        if (Object.keys(newErrors).length === 0) {
            const [emailExists, passwordExists] = await Promise.all([checkEmailExists(), checkPasswordExists()]);
            if (!emailExists) {
                newErrors.email = 'Пользователя с такой почтой не существует';
            }
            if (!passwordExists) {
                newErrors.password = 'Неверный пароль';
            }
        }
        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }
    const checkEmailExists = async () => {
        const response = await fetch('http://psychosearch/store/actions/login.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ emailCheck: email })
        });
        const data = await response.json();
        return data.exists;
    };
    const checkPasswordExists = async () => {
        const response = await fetch('http://psychosearch/store/actions/login.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ passwordCheck: password, email: email })
        });
        const data = await response.json();
        return data.passwordValid;
    };
    const handleLogin = async (e) => {
        e.preventDefault()
        if (await validateForm()) {
            axios.post('http://psychosearch/store/actions/login.php', {
                email: email,
                password: password
            })
                .then(response => {
                    if (response.data.access_token) {
                        login(response.data.user, response.data.access_token, response.data.refresh_token);
                    } else {
                        setMessage(response.data.message);
                    }
                })
                .catch(error => {
                    setMessage('Ошибка при авторизации.');
                    console.error(error);
                });
        }
    }
    useEffect(() => {
        if (auth.isAuthenticated) {
            if (['user', 'psychologist'].includes(auth.user.role)) {
                navigate('/profile/info')
            }
            if (auth.user.role === 'admin') {
                navigate('/admin/users')
            }

        }
    }, [auth.isAuthenticated, navigate])
    const handleEmailChange = (e) => {
        const value = e.target.value;
        setEmail(value.toLowerCase());
    };
    return (
        <>
            <div className='sign-row'>
                <div className="left-block">
                    <div className="content-form">
                        <div className='subtitle'>Добро пожаловать!</div>
                        <p>Нет аккаунта?</p>
                        <Link to="/registration"><div className="mainbtn">Зарегистрироваться <img src="logo/Arrow.svg" alt="" /></div> </Link>
                    </div>
                </div>
                <div className="right-block">
                    <div className="content-form">
                        <div className='subtitle'>Войти в профиль</div>
                        <form onSubmit={handleLogin}>
                            <div className="label">
                                Почта
                                <input type="text"
                                    value={email}
                                    className={errors.email ? 'error' : ''}
                                    onChange={(e) => { 
                                        setEmail(e.target.value);
                                        handleEmailChange(e);
                                    } 
                                    }
                                    onBlur={() => validateForm()}
                                    placeholder='example@example.example' />
                                {errors.email && <p className='errortext'>{errors.email}</p>}
                            </div>
                            <div className="label">
                                Пароль
                                <input type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className={errors.password ? 'error' : ''}
                                    onBlur={() => validateForm()}
                                    placeholder='••••••' />
                                {errors.password && <p className='errortext'>{errors.password}</p>}
                            </div>
                            <button type="submit" className='mainbtn'>Войти <img src="logo/Arrow.svg" alt="" /></button>
                            <div className="message">
                                {message && <p className='errortext'>{message}</p>}
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </>
    )
}

