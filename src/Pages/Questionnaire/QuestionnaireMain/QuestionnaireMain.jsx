import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import PersonalInfo from '../PersonalInfo';
import Study from '../Study';
import Practic from '../Practic';
import axios from 'axios';
import About from '../About';
import './QuestionnaireMain.css';
import confetti from 'canvas-confetti';
export default function QuestionnaireMain() {
    const [currentStep, setCurrentStep] = useState(0);
    const [completedSteps, setCompletedSteps] = useState([false, false, false, false]);
    const [error, setError] = useState('');
    const [isConfirmed, setIsConfirmed] = useState();
    const menuItems = [
        { title: ["Личные", "данные"], icon: "/icons/step4.svg" },
        { title: ["Образование"], icon: "/icons/step1.svg" },
        { title: ["Практика"], icon: "/icons/step3.svg" },
        { title: ["О вас"], icon: "/icons/step2.svg" },
    ];
    const [formData, setFormData] = useState({
        fullName: '',
        birthDate: '',
        gender: '',
        phone: '',
        email: '',
        education: '',
        diplomaFiles: [],
        specializations: [],
        practiceInfo: '',
        about: '',
        photo: null,
        agreeToTerms: false,
    });
    const validateStep = () => {
        const errors = [];
        switch (currentStep) {
            case 0: {
                const { fullName, birthDate, gender, phone, email, agreeToTerms } = formData;
                if (!fullName || !birthDate || !gender || !phone || !email) {
                    errors.push('Пожалуйста, заполните все поля.');
                }
                const birth = new Date(birthDate);
                const today = new Date();
                const age = today.getFullYear() - birth.getFullYear();
                const isTooYoung = age < 18 || (age === 18 && today < new Date(birth.setFullYear(birth.getFullYear() + 18)));
                if (birthDate && isTooYoung) {
                    errors.push('Вам должно быть не менее 18 лет.');
                }
                const phoneRegex = /^\+7\s\(\d{3}\)\s-\s\d{3}\s-\s\d{2}\s-\s\d{2}$/;
                if (phone && !phoneRegex.test(phone)) {
                    errors.push('Введите корректный номер телефона.');
                }
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (email && !emailRegex.test(email)) {
                    errors.push('Пожалуйста, введите корректную почту.');
                }
                if (!agreeToTerms) {
                    errors.push('Вы должны дать согласие на обработку персональных данных.');
                }
                return errors;
            }
            case 1: {
                const { education, diplomaFiles } = formData;
                if (!education) {
                    errors.push('Заполните образование.');
                }
                if (diplomaFiles.length === 0) {
                    errors.push('Прикрепите диплом.');
                }
                if (diplomaFiles.length > 5) {
                    errors.push('Максимальное кол-во фото - 5 шт.');
                }
                const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
                const maxFileSize = 5 * 1024 * 1024; // 5 MB в байтах

                diplomaFiles.forEach((file, index) => {
                    if (!allowedTypes.includes(file.type)) {
                        errors.push(`Файл №${index + 1} должен быть в формате JPG, JPEG или PNG.`);
                    }
                    if (file.size > maxFileSize) {
                        errors.push(`Размер файла №${index + 1} превышает 5 МБ.`);
                    }
                });
                return errors;
            }
            case 2: {
                const { practiceInfo, specializations } = formData;
                if (!practiceInfo.trim()) {
                    errors.push('Укажите информацию о практике.');
                }
                if (specializations.length === 0) {
                    errors.push('Выберите хотя бы одну специализацию.');
                }
                return errors;
            }
            case 3: {
                const { about, photo } = formData;
                if (!about.trim()) {
                    errors.push('Добавьте информацию о себе.');
                }
                if (!photo) {
                    errors.push('Загрузите свою фотографию.');
                } else {
                    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
                    const maxFileSize = 5 * 1024 * 1024; // 5 МБ в байтах

                    if (!allowedTypes.includes(photo.type)) {
                        errors.push('Фотография должна быть в формате JPG, JPEG или PNG.');
                    }
                    if (photo.size > maxFileSize) {
                        errors.push('Размер фотографии не должен превышать 5 МБ.');
                    }
                }
                return errors;
            }
            default:
                return ['Неизвестный шаг.'];
        }
    };
    const goToNextStep = () => {
        const errors = validateStep();

        if (errors.length > 0) {
            setError(errors);
            return;
        }
        setError([]);
        setCompletedSteps(prev => {
            const newCompletedSteps = [...prev];
            newCompletedSteps[currentStep] = true;
            return newCompletedSteps;
        });
        setCurrentStep(currentStep + 1);
    };
    const goToPreviousStep = () => {
        if (currentStep > 0) {
            setCompletedSteps(prev => {
                const newCompletedSteps = prev.map((completed, index) => index < currentStep - 1);
                return newCompletedSteps;
            });
            setCurrentStep(currentStep - 1);
        }
    };
    const renderCurrentStep = () => {
        switch (currentStep) {
            case 0:
                return <PersonalInfo formData={formData} setFormData={setFormData} />;
            case 1:
                return <Study formData={formData} setFormData={setFormData} />;
            case 2:
                return <Practic formData={formData} setFormData={setFormData} />;
            case 3:
                return <About formData={formData} setFormData={setFormData} />;
            default:
                return <PersonalInfo formData={formData} setFormData={setFormData} />;
        }
    };
    const handleSubmit = async () => {
        const errors = validateStep();

        if (errors.length > 0) {
            setError(errors);
            return;
        }
        setError([]);
        const submissionData = new FormData();
        submissionData.append('fullName', formData.fullName);
        submissionData.append('birthDate', formData.birthDate);
        submissionData.append('gender', formData.gender);
        submissionData.append('phone', formData.phone);
        submissionData.append('email', formData.email);
        submissionData.append('education', formData.education);
        submissionData.append('practiceInfo', formData.practiceInfo);
        submissionData.append('about', formData.about);
        submissionData.append('specializations', formData.specializations.join(', '));
        formData.diplomaFiles.forEach((file, index) => {
            submissionData.append(`diplomaFiles[]`, file);
        });
        if (formData.photo) {
            submissionData.append('photo', formData.photo);
        }
        try {
            const response = await axios.post("http://psychosearch/store/actions/send_vacancy.php", submissionData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            if (response.data.success) {
                confetti({
                    particleCount: 150,
                    spread: 100,
                    origin: { y: 0.2 },
                    shapes: ['circle'],
                    colors: ['#72C0F4', '#72c0f492', '#72c0f453', '#2290d9'],
                });
                setIsConfirmed(true);
            } else {
                console.error("Ошибка при отправке анкеты: ", response.data.message);
            }
        } catch (error) {
            console.error("Ошибка при отправке анкеты:", error);
        }
    };
    if (isConfirmed) {
        return (
            <div className="payment-success">
                <img src="/img/confirm.svg" alt="Успешно" />
                <h2>Анкета успешно отправлена!</h2>
                <p>
                    Мы рассмотрим Вашу заявку в течение 5 рабочих дней. Ожидайте письмо с ответом на почту либо звонок на номер, которые Вы указали.
                    <br />
                    <span>Спасибо, что выбрали работать с нами!</span>
                </p>
                <Link to="/" className="mainnbtn">На главную</Link>
            </div>
        );
    }
    return (
        <>
            <div className="select">
                {menuItems.map((item, index) => (
                    <div key={index} className='select-item' >
                        <div className={`img ${completedSteps[index] ? 'completed' : ''} ${currentStep === index ? 'active' : ''}`}>
                            <img src={item.icon} alt="" />
                        </div>
                        <div className="select-title">
                            {item.title.map((line, idx) => (
                                <p key={idx}>
                                    {line}
                                    {idx < item.title.length - 1 && <br />}
                                </p>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
            <div className="step-content">
                <div className='step-warning'><img src="/icons/warning.svg" alt="" />
                    Пожалуйста, заполняйте анкету внимательно, от качества заполнения анкеты зависит принятие решения об одобрении Вашей вакансии!</div>
                {renderCurrentStep()}
                <div className="nav-steps">
                    {currentStep > 0 && (
                        <button className='cancelbtn' onClick={goToPreviousStep}>Назад</button>
                    )}
                    {currentStep < menuItems.length - 1 && (
                        <button className='subtitle-btn' onClick={goToNextStep}>Далее</button>
                    )}
                    {currentStep === menuItems.length - 1 && (
                        <button className='subtitle-btn' onClick={handleSubmit}>Отправить</button>
                    )}
                </div>
                {Array.isArray(error) && error.length > 0 && (
                    <ul className="error">
                        {error.map((err, i) => (
                            <li className='error' key={i}>{err}</li>
                        ))}
                    </ul>
                )}
            </div>
        </>
    );
}
