import { Link } from 'react-router-dom';
import './Home.css'
import { useState, useEffect, useRef } from "react";
import axios from 'axios';
import Accordion from "../../Components/Accordion/Accordion"
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import { Autoplay } from 'swiper/modules';
export default function Home() {
    // отзывы
    const [reviews, setReviews] = useState([]);
    useEffect(() => {
        const fetchUserReviews = async () => {
            try {
                const response = await axios.get('http://psychosearch/store/actions/get_reviews.php');
                const availableReviews = response.data.reviews.filter(review => review.is_available === 1);
                setReviews(availableReviews);
            } catch (err) {
                console.error('Ошибка при получении отзывов:', err);
            }
        };
        fetchUserReviews();
    }, []);
    function formatDate(dateString) {
        if (!dateString) {
            return '';
        }
        const date = new Date(dateString);
        return date.toLocaleDateString('ru-RU');
    }
    // cлайдер
    const [currentReviewIndex, setCurrentReviewIndex] = useState(0);
    const [animating, setAnimating] = useState(false);
    const switchReview = (newIndex) => {
        setAnimating(true);
        setTimeout(() => {
            setCurrentReviewIndex(newIndex);
            setAnimating(false);
        }, 300);
    };
    // навигация
    const goToNextReviewSlide = () => {
        const nextIndex = (currentReviewIndex + 1) % reviews.length;
        switchReview(nextIndex);
    };
    const goToPrevReviewSlide = () => {
        const prevIndex = (currentReviewIndex - 1 + reviews.length) % reviews.length;
        switchReview(prevIndex);
    };
    // автопрокрутка
    useEffect(() => {
        const interval = setInterval(() => {
            goToNextReviewSlide();
        }, 5000);
        return () => clearInterval(interval);
    }, [currentReviewIndex, reviews.length]);
    // отзывы
    // faq
    const [email, setEmail] = useState('');
    const [name, setName] = useState('');
    const [question, setQuestion] = useState('');
    const [errors, setErrors] = useState({})
    const validateForm = () => {
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
        if (!question) {
            newErrors.question = 'Заполните вопрос'
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
    // faq
    // инфослайдер
    const swiperRef = useRef(null)
    const sliderData = [
        {
            id: 1,
            image: 'icons/sd1.svg',
            title: 'Подберите специалиста',
            p: 'Выберите специалиста из каталога по своим пожеланиям, воспользовавшись фильтрацией.',
        },
        {
            id: 2,
            image: 'icons/sd2.svg',
            title: 'Выберите удобное время',
            p: 'Подберите удобное время для консультирование, нажмите кнопку для записи. Следующим шагом оплатите сессию. ',
        },
        {
            id: 3,
            image: 'icons/sd3.svg',
            title: 'Ваша сессия назначена!',
            p: 'Мы напомним о сессии за сутки до eё начала. За 10 минут до сессии специалист добавит ссылку на Google Meet, вам также придет уведомление об этом.',
        },
    ]
    // инфослайдер
    // популярные психологи
    const [users, setUsers] = useState([]);
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
    const [currentIndex, setCurrentIndex] = useState(0);
    const slideInterval = 3000;
    const goToNextSlide = () => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % users.length);
    };
    const goToPrevSlide = () => {
        setCurrentIndex((prevIndex) => (prevIndex - 1 + users.length) % users.length);
    };
    useEffect(() => {
        const interval = setInterval(goToNextSlide, slideInterval);
        return () => clearInterval(interval);
    }, [currentIndex, users.length]);
    // популярные психологи
    return (
        <>
            {/* баннер */}
            <div className="banner">
                <div className="banner-content">
                    <p>Онлайн-сервис записи к психологу</p>
                    <div className='title'>Начни жить так, как хочешь <span>ты</span></div>
                    <div className="row">
                        <div className="card">
                            <img src="icons/b1.svg" alt="" />
                            <h6>90%</h6>
                            <p>Довольных <br />
                                клиентов</p>
                        </div>
                        <div className="card">
                            <img src="icons/b2.svg" alt="" />
                            <h6>100+</h6>
                            <p>Проверенных <br />
                                специалистов</p>
                        </div>
                        <div className="card">
                            <img src="icons/b3.svg" alt="" />
                            <h6>5 лет</h6>
                            <p>Средний опыт <br />
                                специалиста</p>
                        </div>
                    </div>
                </div>
                <div className="banner-img">
                    <div className="stroke">
                        <img src="icons/plus.svg" alt="" />
                        Низкая самооценка
                    </div>
                    <div className="stroke">
                        <img src="icons/plus.svg" alt="" />
                        Зависимости
                    </div>
                    <div className="stroke">
                        <img src="icons/plus.svg" alt="" />
                        Потеря близкого
                    </div>
                    <div className="stroke">
                        <img src="icons/plus.svg" alt="" />
                        Эмоциональное выгорание
                    </div>
                    <div className="banner-btn">
                        <Link to="catalog" className="btn">
                            К выбору психолога
                            <img src="logo/Arrow2.svg" alt="" />
                        </Link>
                    </div>
                </div>
            </div>
            {/* баннер */}
            {/* с чем поможет психолог */}
            <div className="content mt">
                <div className="title-row">
                    <div className="subtitle">
                        С чем <span>поможет</span>   психолог
                    </div>
                    <Link to="catalog" className="subtitle-btn">Хочу обсудить свою проблему</Link>
                </div>
                <div className="card-row">
                    <div className="card">
                        <h6>Эмоциональная <br />
                            поддержка</h6>
                        <p>Помогает справляться <br /> с чувствами и стрессом</p>
                    </div>
                    <div className="img">
                        <img src="img/img1.png" alt="" />
                    </div>
                    <div className="line">
                        <div className="card">
                            <h6>Преодоление <br />
                                трудностей</h6>
                            <p>
                                Помогает в решении <br /> личных и <br /> межличностных проблем</p>
                        </div>
                        <div className="img">
                            <img src="img/img2.png" alt="" />
                        </div>
                    </div>
                    <div className="line2">
                        <div className="img"><img src="img/img3.png" alt="" /></div>
                        <div className="card corner">
                            <h6>Развитие  <br />
                                навыков</h6>
                            <p>Обучает навыкам  <br /> управления стрессом <br /> и коммуникации
                            </p>
                        </div>
                    </div>
                    <div className="img"><img src="img/img4.png" alt="" /></div>
                    <div className="card corner2">
                        <h6>Повышение  <br />
                            самосознания</h6>
                        <p>Помогает понять  <br /> собственные мысли <br />  и чувства
                        </p>
                    </div>
                </div>
            </div>
            {/* с чем поможет психолог */}
            {/* инфослайдер */}
            <div className="content">
                <div className="title-row order">
                    <Link className="subtitle-btn" to="catalog">Выбрать психолога</Link>
                    <div className="subtitle reverse">
                        Запишись
                        к <span>проверенному</span> специалисту
                    </div>
                </div>
                <div className="slideshow">
                    <Swiper
                        className='slide'
                        ref={swiperRef}
                        autoplay={{
                            delay: 4000,
                            disableOnInteraction: false,
                        }}
                        modules={[Autoplay]}
                    >
                        {sliderData.map((item) => (
                            <SwiperSlide key={item.id}>
                                <div className="slide-content">
                                    <div className='slide-text'>
                                        <div className="subtitle">
                                            {item.title}
                                        </div>
                                        <p>{item.p}</p>
                                    </div>
                                    <img className='img' src={item.image} alt="" />
                                </div>
                            </SwiperSlide>
                        ))}
                    </Swiper>
                    <div className="swiper-navigation">
                        <button className='prev' onClick={() => swiperRef.current.swiper.slidePrev()} ><img src="icons/prev.svg" alt="" /></button>
                        <button className='next' onClick={() => swiperRef.current.swiper.slideNext()} ><img src="icons/next.svg" alt="" /></button>
                    </div>
                </div>
            </div>
            {/* инфослайдер*/}
            {/* популярные психологи */}
            <div className="content">
                <div className="title-row">
                    <div className="subtitle ">
                        В нашем каталоге <span>более 100</span> проверенных специалистов
                    </div>
                    <Link to="catalog" className="subtitle-btn">К каталогу</Link>
                </div>
                <div className="slider-container">
                    <div className="slider">
                        {users.map(user => (
                            <div key={user.id} className='slider-card'
                                style={{
                                    transform: `translateX(${-currentIndex * 133.5}%)`,
                                    transition: 'transform 0.5s ease-in-out'
                                }}>
                                <img src={user.avatar ? `${avatarBaseUrl}${user.avatar}` : defaultAvatar} alt="" />
                                <Link className="card" to={`/psychologist/${user.id}`}>
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
                        ))}
                    </div>
                    <div className="btns">
                        <img src='icons/prev.svg' onClick={goToPrevSlide} />
                        <img src='/icons/next.svg' onClick={goToNextSlide} />
                    </div>
                </div>
            </div>
            {/* популярные психологи */}
            {/* отзывы */}
            <div className="content review-block">
                <div className="rev-msg">
                    <div className="message-loader">
                        <span className="dots">
                            <span className="dot dot1">.</span>
                            <span className="dot dot2">.</span>
                            <span className="dot dot3">.</span>
                        </span>
                        <span className="message-text">Лучший сервис!</span>
                    </div>
                    <img src="/img/revimg1.png" style={{ width: '95px', height: '95px' }} alt="" />
                </div>
                <div className="rev-msg">
                    <div className="message-loader">
                        <span className="dots">
                            <span className="dot dot1">.</span>
                            <span className="dot dot2">.</span>
                            <span className="dot dot3">.</span>
                        </span>
                        <span className="message-text">Большое спасибо:)</span>
                    </div>
                    <img src="/img/revimg3.png" style={{ width: '80px', height: '80px' }} alt="" />
                </div>
                <div className="rev-msg">
                    <div className="message-loader">
                        <span className="dots">
                            <span className="dot dot1">.</span>
                            <span className="dot dot2">.</span>
                            <span className="dot dot3">.</span>
                        </span>
                        <span className="message-text">Рекомендую!</span>
                    </div>
                    <img src="/img/revimg2.png" style={{ width: '115px', height: '115px' }} alt="" />
                </div>
                <div className="review-block-back">
                    <div className="title">
                        <span>Мнение </span> наших клиентов <br /> очень важно для нас
                    </div>
                    {reviews.length < 5 && reviews[currentReviewIndex] && (
                        <div className={`home-review-content ${animating ? 'fade' : ''}`}>
                            <div className="review-img">
                                <div className="img">
                                    <img
                                        src={
                                            reviews[currentReviewIndex].user_avatar
                                                ? `${avatarBaseUrl}${reviews[currentReviewIndex].user_avatar}`
                                                : defaultAvatar
                                        }
                                        alt=""
                                    />
                                </div>
                            </div>
                            <div className="review-text">
                                <span>“ </span>
                                {reviews[currentReviewIndex].review_text.length > 278
  ? reviews[currentReviewIndex].review_text.slice(0, 200) + '...'
  : reviews[currentReviewIndex].review_text}
                                <span> ”</span>
                            </div>
                            <div className="review-user">
                                <h6>{reviews[currentReviewIndex].user_name}</h6>
                                <p>{formatDate(reviews[currentReviewIndex].review_date)}</p>
                            </div>
                        </div>
                    )}
                    <div className="btns">
                        <img src="icons/prev.svg" onClick={goToPrevReviewSlide} />
                        <img src="icons/next.svg" onClick={goToNextReviewSlide} />
                    </div>
                </div>
            </div>
            {/* отзывы */}
            {/* faq */}
            <div className="content">
                <div className="title-row order">
                    <p>Если нет ответа на нужный вопрос, <span>задайте его нам!</span>
                        Заполните форму ниже, мы ответим вам в течение 3-х рабочих дней.</p>
                    <div className="subtitle reverse">
                        <span>Ответы</span> на часто задаваемые вопросы
                    </div>
                </div>
                <div className="faq">
                    <form onSubmit={handleSubmit}>
                        <div className="label">
                            Имя
                            <input type="text" placeholder='Ваше имя или псевдоним'
                                value={name}
                                className={errors.name ? 'error' : ''}
                                onChange={(e) => setName(e.target.value)}
                                onBlur={validateForm} />
                            {errors.name && <p className='errortext'>{errors.name}</p>}
                        </div>
                        <div className="label">
                            Почта
                            <input type="text" placeholder='example@example.example' value={email}
                                className={errors.email ? 'error' : ''}
                                onChange={(e) => setEmail(e.target.value)}
                                onBlur={validateForm}
                            />
                            {errors.email && <p className='errortext'>{errors.email}</p>}
                        </div>
                        <div className="label">
                            Вопрос
                            <textarea placeholder='Напишите, что вас интересует'
                                value={question}
                                className={errors.question ? 'error' : ''}
                                onChange={(e) => setQuestion(e.target.value)}
                                onBlur={validateForm}
                            ></textarea>
                            {errors.question && <p className='errortext'>{errors.question}</p>}
                        </div>
                        <button type='submit' className='mainbtn'>Отправить <img src="logo/Arrow.svg" alt="" /></button>
                    </form>
                    <div className="accordion-nav">
                        <Accordion title="Как понять, что вам нужен психолог?" content="Психолог нужен, если хочется привести в порядок свои мысли и чувства.

К примеру, у вас не складываются отношения с партнёром. Или никак не получается найти себя и раздражает работа. Или кажется, что в будущем ждёт только плохое — и от этого тревожно. На сеансах с терапевтом можно поговорить об этом, изучить прошлый опыт, обнаружить негативные модели мышления и научиться реагировать на ситуации иначе.

Иногда бывает, что у клиента вроде бы нет готовой темы для разговора с терапевтом, но этот разговор почему-то нужен. А порой люди, переживающие тяжёлый развод или смерть близких, не испытывают потребности в терапии — и это тоже нормально." />
                        <Accordion title="Сколько стоит психолог?" content="Стоимость индивидуальной онлайн-консультации психолога — от 2 850 рублей за 50 минут. Цена сессии для двоих — от 4 850 рублей за 1,5 часа. Чтобы понять, дорого ли это, посмотрим на статистику: в среднем, консультация с психологом стоит в Москве от 2,5 до 8 тысяч рублей. Так что — судите сами." />
                        <Accordion title="Как понять, что психотерапия помогает?" content="Бывают запросы, которые касаются «горящей» ситуации: «Я хочу разорвать отношения с партнёром — но мне страшно». Понять, помог ли психолог, можно по тому, решилась ли конкретная проблема.

Но бывает, что запрос, с которым мы приходим к психологу, — только верхушка айсберга. И тогда терапия будет длительным процессом, в котором будет место и прогрессу, и сопротивлению. Со временем вы заметите изменения: к примеру, научитесь говорить «нет», перестанете идеализировать окружающих и разрешите себе иногда ошибаться." />
                        <Accordion title="Как выбрать психолога, который подойдёт?
" content="В терапии существует много направлений, и в них легко потеряться. Разные подходы уделяют больше внимания разным аспектам: исследованию детства, переживаниям в моменте «здесь и сейчас», телесным реакциям и так далее.

Но на самом деле работает не метод — а контакт с терапевтом. В процессе вы должны чувствовать, что вас внимательно слушают, не осуждают и не оценивают, в вас заинтересованы.

У каждого психолога есть анкета. Изучая описание, можно выбрать того, кто работает с вашей темой и вызывает доверие лично у вас." />
                        <Accordion title="Можно ли оплатить консультацию картой иностранного банка?" content="Да, можно оплатить картой зарубежного банка. Стоимость в евро рассчитывается по курсу ЦБ РФ, включает в себя дополнительные налоги, банковские комиссии и другие транзакционные издержки." />
                    </div>
                </div>
            </div>
            {/* faq */}
        </>
    )
}
