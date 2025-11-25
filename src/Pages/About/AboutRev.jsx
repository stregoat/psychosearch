import './About.css'
import axios from 'axios';
import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom'

export default function Reviews() {
    const { id } = useParams();
    const [reviews, setReviews] = useState([]);
    const [user, setUser] = useState(null);

    useEffect(() => {
        const fetchUserReviews = async () => {
            try {
                const response = await axios.get('http://psychosearch/store/actions/get_psychologist_reviews.php', {
                    params: {
                        user_id: id
                    }
                });
                const availableReviews = response.data.reviews.filter(review => review.is_available === 1);
                setReviews(availableReviews);
            } catch (err) {
                console.error('Ошибка при получении отзывов:', err);
            }
        };

        if (id) {
            fetchUserReviews();
        }
    }, [id]);

    const avatarBaseUrl = 'http://psychosearch/store/avatars/';
    const defaultAvatar = 'http://psychosearch/public/img/avatar.svg';

    function formatDate(dateString) {
        if (!dateString) {
            return '';
        }
        const date = new Date(dateString);
        return date.toLocaleDateString('ru-RU');
    }

    useEffect(() => {
        axios.get(`http://psychosearch/store/actions/get_psychologist.php?user_id=${id}`)
            .then(response => {
                if (response.data) {
                    setUser(response.data);
                } else {
                    console.error('Психолог не найден');
                }
            })
            .catch(error => {
                console.error('Ошибка при получении психолога', error);
            });
    }, [id]);

    if (!user) {
        return <p>Загрузка данных о психологе...</p>;
    }

    return (
        <>
            <div className="about-rev">
                <div className="bread">
                    <Link className='breadlink' to="/catalog"> Психологи </Link>
                    <img src="/icons/to.svg" alt="" />
                    <Link className='breadlink' to={`/psychologist/${user.id}`}>{user.name}</Link>
                    <img src="/icons/to.svg" alt="" />
                    <Link className='breadlink' to={`/psychologist/${user.id}/reviews`}>Отзывы</Link>
                </div>
                <div className="title-admin">
                    <h5>Отзывы</h5>
                </div>
                <div className="reviews-list">
                    {reviews.length > 0 ? (
                        reviews.map((review, index) => (
                            <div key={index} className="review-item">
                                <div className="review_title">
                                    <div className="user_content">
                                        <img src={review.user_avatar ? `${avatarBaseUrl}${review.user_avatar}` : defaultAvatar} alt="" />
                                        <div className="username_content">
                                            <p>{review.user_name}</p>
                                            <span>{formatDate(review.review_date)}</span>
                                        </div>
                                    </div>
                                    <div className="rating_content">
                                        <span>(
                                            {review.review_rating}/5)
                                            {[...Array(review.review_rating)].map((_, i) => (
                                                <img key={i} src='/icons/star.svg' alt="star" className="star" />
                                            ))}
                                        </span>
                                        <div className="psychologist">
                                            <span>Специалист:</span>
                                            <Link to={`/psychologist/${review.psychologist_id}`}>{review.psychologist_name}</Link>
                                        </div>
                                    </div>
                                </div>
                                <p>{review.review_text}</p>
                            </div>
                        ))
                    ) : (
                        <p>Отзывов пока нет.</p>
                    )}
                </div>
            </div>
        </>
    );
}
