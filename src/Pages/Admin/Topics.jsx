import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import axios from 'axios';
import Modal from '../../Components/Modal/Modal';
import { toast } from 'react-toastify';

export default function Topics() {
    const [topics, setTopics] = useState([]);
    const [selectedTopic, setSelectedTopic] = useState(null);
    const [isModalOpen, setIsOpen] = useState(false);

    useEffect(() => {
        const fetchTopics = async () => {
            try {
                const response = await axios.get('http://psychosearch/store/actions/get_specializations.php');
                setTopics(response.data);
            } catch (error) {
                console.error('Ошибка при получении списка специализаций психологов', error);
            }
        };
        fetchTopics();
    }, []);

    const openModal = (topicId) => {
        setSelectedTopic(topicId);
        setIsOpen(true);
        document.body.style.overflow = 'hidden';
    };

    const closeModal = () => {
        setSelectedTopic(null);
        setIsOpen(false);
        document.body.style.overflow = '';
    };

    const getTopicLabel = (count) => {
        if (count % 10 === 1 && count % 100 !== 11) {
            return "тема найдена";
        } else if (
            count % 10 >= 2 &&
            count % 10 <= 4 &&
            (count % 100 < 10 || count % 100 >= 20)
        ) {
            return "темы найдено";
        } else {
            return "тем найдено";
        }
    };

    const deleteTopic = async (id, name) => {
        try {
            const response = await axios.post('http://psychosearch/store/actions/delete_topic.php', { id });
            if (response.data.success) {
                toast.success(`Тема ${name} успешно удалена!`);
                closeModal();
                setTopics(prevTopics => prevTopics.filter(topic => topic.id !== id));
            } else {
                console.error('Ошибка при удалении темы:', response.data);
            }
        } catch (error) {
            console.error('Ошибка при запросе на удаление:', error);
        }
    };

    return (
        <>
            <div className="title-add">
                <div className="title-admin">
                    <h5>Темы для сеанса</h5>
                    <p>{topics.length} {getTopicLabel(topics.length)}</p>
                </div>
                <Link className='subtitle-btn' to="addtopic">Добавить тему +</Link>
            </div>
            {topics.length === 0 ? (
                <p>Темы еще не добавлены</p>
            ) : (
                <div className="topics adm">
                    {topics.map((topic) => (
                        <div key={topic.id}>
                            <span>
                                {topic.specialization}
                                <img
                                    onClick={() => openModal(topic.id)}
                                    src="/icons/rmv.svg"
                                    alt="Удалить" className='delete-slot'
                                />
                            </span>
                            {isModalOpen && selectedTopic === topic.id && (
                                <div className="confirm">
                                    <Modal isOpen={isModalOpen} onClose={closeModal}>
                                        <h6>Вы действительно хотите удалить тему "{topic.specialization}"?</h6>
                                        <div className="row">
                                            <button type="button" className="cancelbtn" onClick={closeModal}>
                                                Отменить
                                            </button>
                                            <button
                                                type="button"
                                                className="deletebtn"
                                                onClick={() => deleteTopic(topic.id, topic.specialization)}
                                            >
                                                Удалить
                                            </button>
                                        </div>
                                    </Modal>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </>
    );
}
