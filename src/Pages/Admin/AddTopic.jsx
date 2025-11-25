import { useNavigate, Link } from 'react-router-dom';
import { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';


export default function AddTopic() {
    const [name, setName] = useState('');
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState('');
    const navigate = useNavigate();
    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setMessageType('');
        const formData = new FormData();
        formData.append('name', name);
        try {
            const response = await axios.post(
                'http://psychosearch/store/actions/add_topic.php', formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                }
            );
            if (response.data.success) {
                toast.success(`Тема ${name} успешно добавлена!`);
                navigate('/admin/topics');
            } else {
                setMessage(response.data.message);
                setMessageType('err');
            }
        } catch (error) {
            setMessage('Ошибка при добавлении психолога.');
            setMessageType('err');
            console.error(error);
        }
    };

    const handleNameChange = (e) => {
        const formattedName = e.target.value.charAt(0).toUpperCase() + e.target.value.slice(1);
        setName(formattedName);
    };

    return (
        <>
            <div className="title-admin">
                <h5>Добавить тему</h5>
                <Link to='/admin/topics' className='subtitle-btn'>Назад</Link>
            </div>
            <form onSubmit={handleSubmit} className="add_topic">
                <div className="label">
                    Название темы
                    <input type="text" placeholder='Название темы' value={name} onChange={(e) => {
                        setName(e.target.value);
                        handleNameChange(e);
                    }} />
                </div>
                {message && (
                    <div className="message">
                        <p className={messageType}>{message}</p>
                    </div>)}
                <button className='mainbtn'>Добавить тему +</button>
            </form>
        </>
    )
}