import { useState } from "react";
import Modal from '../../Components/Modal/Modal';

export default function PersonalInfo({ formData, setFormData }) {
    const [isOpen, setOpen] = useState(false);
    const toggleDropdown = () => {
        setOpen(!isOpen);
    };
    const [gender, setGender] = useState('none');
    const handleGenderChange = (value) => {
        setGender(value);
        setFormData({ ...formData, gender: value });
        setOpen(false);
    };
    const handleChange = (field, value) => {
        setFormData({ ...formData, [field]: value });
    };
    const handleNameChange = (e) => {
        const input = e.target.value;
        const cleanedValue = input.replace(/[^а-яёА-ЯЁ\s-]/g, '');
        const formattedValue = cleanedValue
            .split(/(\s|-)/)
            .map((part, index, array) => {
                if (part !== ' ' && part !== '-' &&
                    (index === 0 || array[index - 1] === ' ' || array[index - 1] === '-')) {
                    return part.charAt(0).toUpperCase() + part.slice(1).toLowerCase();
                }
                return part;
            })
            .join('');
        handleChange("fullName", formattedValue);
    };
    const handlePhoneChange = (e) => {
        const input = e.target.value;
        const numbers = input.replace(/\D/g, '');
        if (numbers.length > 11) return;
        let formattedValue = '';
        if (numbers.length > 0) {
            formattedValue = '+7 (';
            if (numbers.length > 1) {
                formattedValue += numbers.substring(1, 4);
            }
            if (numbers.length >= 4) {
                formattedValue += ') - ' + numbers.substring(4, 7);
            }
            if (numbers.length >= 7) {
                formattedValue += ' - ' + numbers.substring(7, 9);
            }
            if (numbers.length >= 9) {
                formattedValue += ' - ' + numbers.substring(9, 11);
            }
        }
        handleChange('phone', formattedValue);
    };
    const handleEmailChange = (e) => {
        let input = e.target.value;
        const cursorPosition = e.target.selectionStart;
        input = input.replace(/[^a-zA-Z0-9@._\s-]/g, '');
        let parts = input.split(' ');
        let transformed = input;
        if (parts.length > 1) {
            transformed = parts[0] + '@' + parts.slice(1).join(' ');
        }
        if (parts.length > 2) {
            transformed = parts[0] + '@' + parts[1] + '.' + parts.slice(2).join(' ');
        }
        transformed = transformed
            .replace(/@+/g, '@')
            .replace(/\.+/g, '.')
            .replace(/(@\.|\.@)/g, '@')
            .toLowerCase();
        let newCursorPosition = cursorPosition;
        if (input.length !== transformed.length) {
            const diff = transformed.length - input.length;
            newCursorPosition = cursorPosition + diff;
        }
        handleChange("email", transformed);
        setTimeout(() => {
            const inputElem = e.target;
            inputElem.setSelectionRange(newCursorPosition, newCursorPosition);
        }, 0);
    };
    const getMaxDateFor18YearsOld = () => {
        const today = new Date();
        today.setFullYear(today.getFullYear() - 18);
        return today.toISOString().split('T')[0];
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
            <div className="row vacancy">
                <div className="title-content vacancy">
                    Личные данные
                    <div className="agree">
                        <input id="agree" className="custom-checkbox" type="checkbox"
                            checked={formData.agreeToTerms}
                            onChange={(e) => setFormData({ ...formData, agreeToTerms: e.target.checked })}
                        />
                        <label htmlFor="agree">
                            Нажимая кнопку «Далее», я подтверждаю, что прочитал и даю <span onClick={openModal}>согласие на обработку своих персональных данных.</span> </label>
                    </div>
                </div>
                <div className="vacancy-content">
                    <div className="label">
                        ФИО
                        <input type="text" placeholder="Иванов Иван Иванович"
                            value={formData.fullName}
                            onChange={handleNameChange} />
                    </div>
                    <div className="label w50">
                        Дата рождения
                        <div className="custom-date-input">
                            <input type="date"
                                value={formData.birthDate}
                                onChange={e => handleChange("birthDate", e.target.value)} max={getMaxDateFor18YearsOld()} />
                        </div>
                    </div>
                    <div className="label w50">
                        Пол
                        <div className="select-container">
                            <div className="custom-select" onClick={toggleDropdown}>
                                <span>{gender === 'none' ? '...' : gender === 'male' ? 'Мужской' : 'Женский'}</span>
                                <img src="/icons/select.svg" alt="" className={`select-icon ${isOpen ? 'open' : ''}`} />
                                {isOpen && (
                                    <div className="dropdown-list">
                                        <div className="dropdown-item">
                                            ...
                                        </div>
                                        <div
                                            onClick={() => handleGenderChange('male')}
                                            className="dropdown-item"
                                        >
                                            Мужской
                                        </div>
                                        <div
                                            onClick={() => handleGenderChange('female')}
                                            className="dropdown-item"
                                        >
                                            Женский
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="label w50">
                        Телефон
                        <input type="text" placeholder="+7 (___) - ___ - __ - __"
                            value={formData.phone}
                            onChange={handlePhoneChange} />
                    </div>
                    <div className="label">
                        Почта
                        <input type="text" placeholder="example@example.example"
                            value={formData.email}
                            onChange={handleEmailChange} />
                        <span>Пришлём письмо с итогом по вашей заявке. Также можем уточнить данные по анкете. Пожалуйста, проверьте правильность адреса несколько раз.</span>
                    </div>
                </div>
            </div>
            {isModalOpen && (
                <div className="agreeuser">
                    <Modal isOpen={isModalOpen} onClose={closeModal} >
                        <div className="agree-header">
                            Согласие на обработку персональных данных
                        </div>
                        <div>
                            <p>
                                Я, настоящим, даю свое добровольное, осознанное и информированное согласие на обработку моих персональных данных, предоставленных мной, в соответствии с Федеральным законом №152-ФЗ «О персональных данных», включая следующие действия с моими персональными данными:
                            </p>
                            <ul>
                                <li>» сбор, систематизацию, накопление, хранение;</li>
                                <li>» уточнение (обновление, изменение);</li>
                                <li>» использование;</li>
                                <li>» распространение, включая передачу третьим лицам;</li>
                                <li>» обезличивание, блокирование, уничтожение.</li>
                            </ul>
                            <p>
                                Персональные данные обрабатываются для целей предоставления услуг, выполнения договорных обязательств, а также для соблюдения требований законодательства Российской Федерации.
                            </p>
                            <p>
                                Я осознаю, что имею право на отзыв данного согласия в любой момент путем направления письменного заявления, а также на доступ к своим персональным данным и их изменение.
                            </p>
                        </div>
                    </Modal>
                </div>
            )}
        </>
    )
}