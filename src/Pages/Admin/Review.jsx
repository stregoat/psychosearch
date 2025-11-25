import axios from 'axios';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom'
import Modal from '../../Components/Modal/Modal';
import { toast } from 'react-toastify';

export default function Review() {
    const [reviews, setReviews] = useState([]);
    const [isModalOpen, setIsOpen] = useState(false);
    const [isReportOpen, setIsReportOpen] = useState(false);
    const [selectedReview, setSelectedReview] = useState(null);
    const [selectedReport, setSelectedReport] = useState(null);
    useEffect(() => {
        const fetchUserReviews = async () => {
            try {
                const response = await axios.get('http://psychosearch/store/actions/get_reviews.php');
                setReviews(response.data.reviews);
            } catch (err) {
                console.error('Ошибка при получении отзывов:', err);
            }
        };
        fetchUserReviews();
    }, []);

    const avatarBaseUrl = 'http://psychosearch/store/avatars/';
    const defaultAvatar = 'http://psychosearch/public/img/avatar.svg';

    function formatDate(dateString) {
        if (!dateString) {
            return '';
        }
        const date = new Date(dateString);
        return date.toLocaleDateString('ru-RU');
    }

    const openModal = (reviewId) => {
        setSelectedReview(reviewId);
        setIsOpen(true);
        document.body.style.overflow = 'hidden';
    };

    const closeModal = () => {
        setSelectedReview(null);
        setIsOpen(false);
        document.body.style.overflow = '';
    };

    const openReport = (reviewId) => {
        setSelectedReport(reviewId);
        setIsReportOpen(true);
        document.body.style.overflow = 'hidden';
    };

    const closeReport = () => {
        setSelectedReport(null);
        setIsReportOpen(false);
        document.body.style.overflow = '';
    };

    const deleteReview = async (review_id) => {
        try {
            const response = await axios.post('http://psychosearch/store/actions/delete_review.php', { review_id });
            if (response.data.success) {
                toast.success(`Отзыв успешно удален!`);
                closeModal();
                setReviews(prevReviews => prevReviews.filter(review => review.review_id !== review_id));
            } else {
                console.error('Ошибка при удалении отзыва:', response.data);
            }
        } catch (error) {
            console.error('Ошибка при запросе на удаление:', error);
        }
    };

    const getReviewLabel = (count) => {
        if (count % 10 === 1 && count % 100 !== 11) {
            return "отзыв найден";
        } else if (
            count % 10 >= 2 &&
            count % 10 <= 4 &&
            (count % 100 < 10 || count % 100 >= 20)
        ) {
            return "отзыва найдено";
        } else {
            return "отзывов найдено";
        }
    };

    const [currentPage, setCurrentPage] = useState(1);
    const reviewsPerPage = 2;
    const startIndex = (currentPage - 1) * reviewsPerPage;
    const endIndex = startIndex + reviewsPerPage;
    const currentReviews = reviews.slice ? reviews.slice(startIndex, endIndex) : [];
    const totalPages = Math.ceil(reviews.length / reviewsPerPage);

    const goToPage = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    const publishReview = async (reviewId) => {
        try {
            const response = await axios.post('http://psychosearch/store/actions/post_review.php', {
                review_id: reviewId,
            });
            if (response.data.success) {
                toast.success(`Отзыв успешно опубликован!`);
                setReviews((prevReviews) =>
                    prevReviews.map((review) =>
                        review.review_id === reviewId
                            ? { ...review, is_available: 1 }
                            : review
                    )
                );
            } else {
                console.error('Ошибка при публикации:', response.data.message);
            }
        } catch (error) {
            console.error('Сервер не отвечает:', error);
        }
    };

    return (
        <>
            <div className="title-admin">
                <h5>Отзывы</h5>
                <p>{reviews.length} {getReviewLabel(reviews.length)}</p>
            </div>
            <div className="reviews-list">
                {reviews.length > 0 ? (
                    currentReviews.map((review, index) => (
                        <div key={index} className="review-item">
                            <div className="review_title">
                                <div className="user_content">
                                    <img src={review.user_avatar ? `${avatarBaseUrl}${review.user_avatar}` : defaultAvatar} alt="" />
                                    <div className="username_content">
                                        <p>{review.user_name}</p>
                                        <span>{formatDate(review.review_date)
                                        }</span>
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
                            <div className="user-btns">
                                {review.review_report && (
                                    <div className="report-btn" onClick={() => openReport(review.review_id)}>Посмотреть жалобу <img src="/icons/report.svg" alt="" /></div>
                                )}
                                {review.is_available === 0 && (
                                    <div className="btn-available" onClick={() => publishReview(review.review_id)}>
                                        Опубликовать <img src="/icons/post.svg" alt="" />
                                    </div>
                                )}
                                {isReportOpen && selectedReport === review.review_id && (
                                    <div className="report">
                                        <Modal isOpen={isReportOpen} onClose={closeReport}>
                                            <h6>Жалоба</h6>
                                            <p>{review.review_report}</p>
                                        </Modal>
                                    </div>
                                )}
                                <div className="delete" onClick={() => openModal(review.review_id)}>Удалить <img src="/icons/rmv.svg" alt="" /></div>
                            </div>
                            {isModalOpen && selectedReview === review.review_id && (
                                <div className="confirm">
                                    <Modal isOpen={isModalOpen} onClose={closeModal}>
                                        <h6>Вы действительно хотите удалить отзыв?</h6>
                                        <div className='row'>
                                            <button type="button" className='cancelbtn' onClick={closeModal}>Отменить</button>
                                            <button type="button" className='deletebtn' onClick={() => deleteReview(review.review_id)}>Удалить</button>
                                        </div>
                                    </Modal>
                                </div>
                            )}
                        </div>
                    ))
                ) : (
                    <p>Отзывов пока нет.</p>
                )}
            </div>
            {reviews.length > reviewsPerPage && (
                <div className="pagination">
                    {currentPage > 1 && (
                        <div className='prevpage' onClick={() => goToPage(currentPage - 1)}>
                            <img src="/icons/select.svg" alt="Назад" />
                        </div>
                    )}

                    {[...Array(totalPages)].map((_, index) => (
                        <p
                            key={index}
                            onClick={() => goToPage(index + 1)}
                            className={currentPage === index + 1 ? 'active' : ''}
                        >
                            {index + 1}
                        </p>
                    ))}
                    {currentPage < totalPages && (
                        <div className='nextpage' onClick={() => goToPage(currentPage + 1)}>
                            <img src="/icons/select.svg" alt="Вперед" />
                        </div>
                    )}
                </div>
            )}
        </>
    )
}