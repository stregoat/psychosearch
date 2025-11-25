import Home from './Pages/Home/Home';
import Register from './Pages/Sign/Register';
import Login from './Pages/Sign/Login';
import Job from './Pages/Job/Job';
import Catalog from './Pages/Catalog/Catalog';
import NotFound from './Pages/404/404';
import About from './Pages/About/About';
import Payment from './Pages/Payment/Payment';
import AboutRev from './Pages/About/AboutRev';
import AdminPage from './Pages/Admin/AdminPage/AdminPage';
import ProfilePage from './Pages/Profile/ProfilePage/ProfilePage';
import QuestionnaireMain from './Pages/Questionnaire/QuestionnaireMain/QuestionnaireMain';
import './index.css'
import Header from './Components/Header/Header';
import Footer from './Components/Footer/Footer';
import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './Components/Header/AuthContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
export default function App() {
  return (
    <>
      <AuthProvider>
        <div className="container">
          {/* шапка */}
          <Header />
          <Routes>
            {/* главная */}
            <Route path="/" element={<Home />} />
            {/* вход */}
            <Route path="login" element={<Login />} />
            {/* регистрация */}
            <Route path="registration" element={<Register />} />
            {/* вакансии */}
            <Route path="job" element={<Job />} />
            {/* каталог */}
            <Route path="catalog" element={<Catalog />} />
            {/* 404 */}
            <Route path="*" element={<NotFound />} />
            {/* страница 1 специалиста */}
            <Route path="psychologist/:id" element={<About />} />
            {/* отзывы специалиста */}
            <Route path="psychologist/:id/reviews" element={<AboutRev />} />
            {/* профиль */}
            <Route path="profile/*" element={<ProfilePage />} />
            {/* админ. панель */}
            <Route path="admin/*" element={<AdminPage />} />
            {/* анкетирование на ваканисю */}
            <Route path="vacancy" element={< QuestionnaireMain />} />
            {/* оплата */}
            <Route path="payment" element={< Payment />} />
          </Routes>
        </div>
        {/* подвал */}
        <Footer />
      </AuthProvider>
      {/* уведомление */}
      <ToastContainer position="bottom-right" autoClose={3000} />
    </>
  )
}







