import './Reviews.css'
import { AuthContext } from '../../../Components/Header/AuthContext';
import axios from 'axios';
import { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom'
import Modal from '../../../Components/Modal/Modal';
import { toast } from 'react-toastify';

export default function Reviews() {
    const { auth } = useContext(AuthContext);
    const [reviews, setReviews] = useState([]);
    const [isModalOpen, setIsOpen] = useState(false);
    const [selectedReview, setSelectedReview] = useState(null);
    const [selectedViewReport, setSelectedViewReport] = useState(null);
    const [isReportOpen, setIsReportOpen] = useState(false);
    const [isReportViewOpen, setIsReportViewOpen] = useState(false);
    useEffect(() => {
        const fetchUserReviews = async () => {
            try {
                let url = '';
                if (auth.user.role === 'user') {
                    url = 'http://psychosearch/store/actions/get_user_reviews.php';
                } else if (auth.user.role === 'psychologist') {
                    url = 'http://psychosearch/store/actions/get_psychologist_reviews.php';
                }
                const response = await axios.get(url, {
                    params: {
                        user_id: auth.user.id
                    }
                });
                if (auth.user.role === 'user') {
                    setReviews(response.data.reviews);
                }
                else if (auth.user.role === 'psychologist') {
                    const availableReviews = response.data.reviews.filter(review => review.is_available === 1);
                    setReviews(availableReviews);
                }
            } catch (err) {
                console.error('Ошибка при получении отзывов:', err);
            }
        };

        if (auth.user.id) {
            fetchUserReviews();
        }
    }, [auth.user.id]);

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
        setSelectedReview(reviewId);
        setIsReportOpen(true);
        document.body.style.overflow = 'hidden';
    };

    const closeReport = () => {
        setSelectedReview(null);
        setIsReportOpen(false);
        document.body.style.overflow = '';
    };

    const openViewReport = (reviewId) => {
        setSelectedViewReport(reviewId);
        setIsReportViewOpen(true);
        document.body.style.overflow = 'hidden';
    };

    const closeViewReport = () => {
        setSelectedViewReport(null);
        setIsReportViewOpen(false);
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

    const [messageReport, setMessageReport] = useState('');
    const [messageTypeReport, setMessageTypeReport] = useState('');
    const [report, setReport] = useState('');
    const handleReport = () => {
        setReviews(prevReviews =>
            prevReviews.map(review =>
                review.review_id === selectedReview ? { ...review, review_report: report } : review
            )
        );
        axios.post('http://psychosearch/store/actions/add_report.php', {
            review_id: selectedReview,
            report: report,
        })
            .then(response => {
                if (response.data.success) {
                    closeReport();
                    toast.success(`Ваша жалоба успешно отправлена!`);
                } else {
                    setMessageReport(response.data.message);
                    setMessageTypeReport('err');
                }
            })
            .catch(error => {
                console.error('Ошибка при отправке жалобы:', error);
            });
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



    return (
        <>
            <div className="revs">
                <div className="title-admin">
                    <h5>Мои отзывы</h5>
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
                                {auth.user.role === 'psychologist' && (
                                    <div className="user-btns">
                                        {review.review_report && review.review_report.trim() !== "" ? (
                                            <>
                                                <div className="report-view">Ваша жалоба отправлена на рассмотрение. <p onClick={() => openViewReport(review.review_id)}>Посмотреть жалобу.</p> </div>
                                                {isReportViewOpen && selectedViewReport === review.review_id && (
                                                    <div className="report">
                                                        <Modal isOpen={isReportViewOpen} onClose={closeViewReport}>
                                                            <h6>Жалоба</h6>
                                                            <p>{review.review_report}</p>
                                                        </Modal>
                                                    </div>
                                                )}
                                            </>
                                        ) : (
                                            <div className="report-btn" onClick={() => openReport(review.review_id)}>
                                                Обжаловать <img src="/icons/report.svg" alt="" />
                                            </div>
                                        )}
                                    </div>
                                )}
                                {isReportOpen && selectedReview === review.review_id && (
                                    <div className="report-win">
                                        <Modal isOpen={isReportOpen} onClose={closeReport}>
                                            <h6>Обжаловать отзыв</h6>
                                            <div className="label">
                                                Текст претензии
                                                <textarea maxLength={200} placeholder='Распишите ситуацию, мы постараемся Вам помочь.'
                                                    value={report}
                                                    onChange={(e) => setReport(e.target.value)}></textarea>
                                                <div className="char-counter">{report.length}/200</div>
                                            </div>
                                            {messageReport && (
                                                <div className="message">
                                                    <p className={messageTypeReport}>{messageReport}</p>
                                                </div>
                                            )}
                                            <div className='row'>
                                                <button type="button" className='cancelbtn' onClick={closeReport}>Отменить</button>
                                                <button type="button" className='subtitle-btn'
                                                    onClick={handleReport} >Сохранить</button>
                                            </div>
                                        </Modal>
                                    </div>
                                )}
                                {auth.user.role === 'user' && (
                                    <div className="user-btns">
                                        {review.is_available == 0 && (
                                            <div className='check'><img src="/icons/clock.svg" alt="" /> Ваш отзыв находится на проверке</div>
                                        )}
                                        <div className="delete" onClick={() => openModal(review.review_id)}>Удалить <img src="/icons/rmv.svg" alt="" /></div>
                                    </div>
                                )}
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
                </div>
            </div>
        </>
    )
}