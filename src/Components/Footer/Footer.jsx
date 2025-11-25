import { Link } from 'react-router-dom';
import './Footer.css';
import { useState, useContext } from "react";
import { AuthContext } from '../Header/AuthContext';

export default function Footer() {

    const { auth } = useContext(AuthContext);
    const [email, setEmail] = useState('');
    const [errors, setErrors] = useState({})

    const validateForm = () => {
        const newErrors = {}
        const regex = /\S+@\S+\.\S+/
        if (!email) {
            newErrors.email = 'Заполните почту'
        }
        else if (!regex.test(email)) {
            newErrors.email = 'Неверный формат почты'
        }
        setErrors(newErrors)

        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        if (validateForm()) {
            console.log('success')
        }
    }


    return (
        <footer>
            <div className="container">
                <span>24/7 на связи</span>
                <div className="row">
                    <div className="column">
                        <div className="subtitle">
                            Наши <span>контакты</span>
                        </div>
                        <div className="contacts">
                            <div className="column">
                                <div className="label">
                                    Почта
                                    <a href="mailto:info@psychosearch.ru">info@psychosearch.ru</a>
                                </div>
                                <div className="label">
                                    Адрес
                                    <a href="https://www.google.com/maps?q=г.Казань+ул.Достоевского,+д.15" target="_blank">г. Казань <br></br>
                                        ул. Достоевского, д. 15</a>
                                </div>
                            </div>
                            <div className="column">
                                <div className="label">
                                    Телефон
                                    <a href="tel:+7(900)-899-56-56">+7 (000) - 899 - 56 - 56</a>
                                </div>
                                <div className="label">
                                    Соц. сети
                                    <div className="nets">
                                        <a href=""><img src="/icons/tg.svg" alt="" /></a>
                                        <a href=""><img src="/icons/vk.svg" alt="" /></a>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>
                    <div className="column">
                        <p>Подпишитесь на рассылку, чтобы узнавать о наших специальных предложениях и новостях самыми первыми.</p>
                        <form onSubmit={handleSubmit}>
                            <div className="label">
                                Почта
                                <input type="text" placeholder='example@example.example' value={email}
                                    className={errors.email ? 'error' : ''}
                                    onChange={(e) => setEmail(e.target.value)}
                                    onBlur={validateForm}
                                />
                                {errors.email && <p className='errortext'>{errors.email}</p>}
                            </div>
                            <button className='mainbtn' type="submit">
                                Подписаться <img src="/logo/Arrow.svg" alt="" />
                            </button>
                        </form>
                    </div>
                </div>
                <div className="footer">
                    <p>© Ильясова Александра 426ВЕБ, 2025</p>
                    <Link to="/" className='logo'><img src="/logo/logofoot.svg" alt="" /></Link>
                    <nav>
                        <Link to="/" className='link'>Главная</Link>
                        <Link to="catalog" className='link'>Психологи</Link>
                        <Link to="job" className='link'>Вакансии</Link>
                    </nav>
                </div>
            </div>
        </footer>
    )
}

