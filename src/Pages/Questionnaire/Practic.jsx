import { useState, useEffect } from "react";
import axios from 'axios';
export default function Practic({ formData, setFormData }) {
    const [specializations, setSpecializations] = useState([]);
    useEffect(() => {
        axios.get('http://psychosearch/store/actions/get_specializations.php')
            .then(response => {
                setSpecializations(response.data);
            })
            .catch(error => {
                console.error('Ошибка при получении списка специализаций', error);
            });
    }, []);
    const toggleSpec = (spec) => {
        const current = formData.specializations;
        const updated = current.includes(spec)
            ? current.filter(s => s !== spec)
            : [...current, spec];
        setFormData({ ...formData, specializations: updated });
    };
    return (
        <>
            <div className="row vacancy">
                <div className="title-content">
                    Основные темы
                    для работы
                    <p>
                        Укажите, с какими из <span>перечисленных тем </span> вы работаете
                    </p>
                </div>
                <div className="vacancy-content">
                    <div className='spec'>
                        {specializations.map(spec => (
                            <div key={spec.specialization}>
                                <input className="custom-checkbox"
                                    type="checkbox"
                                    id={spec.specialization}
                                    checked={formData.specializations.includes(spec.specialization)}
                                onChange={() => toggleSpec(spec.specialization)}
                                />
                                <label htmlFor={spec.specialization}>
                                    {spec.specialization}
                                </label>
                            </div>
                        ))}
                    </div>
                </div>
            </div >
            <div className="row vacancy mt-100">
                <div className="title-content">
                    Практика
                    <p>
                        <span>Укажите год и месяц, когда вы начали консультировать за деньги.</span> <br /> Мы принимаем психологов, у которых есть 3 года опыта консультирования за деньги; опыт считаем после завершения высшего психологического образования, медицинского образования (психиатрия) или переподготовки и с даты начала обучения
                    </p>
                </div>
                <div className="vacancy-content">
                    <div className="label">
                        Информация об практике
                        <textarea placeholder="Опыт работы в данной сфере с указанием места работы"
                         value={formData.practiceInfo}
                         onChange={e => setFormData({ ...formData, practiceInfo: e.target.value })}></textarea>
                    </div>
                </div>
            </div >
        </>
    )
}