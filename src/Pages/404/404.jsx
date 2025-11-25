import './404.css'
import { Link } from 'react-router-dom'
export default function NotFound() {
    return (
        <>
        <div className="notfound">
            <h1>404</h1>
            <p>Страница не найдена</p>
        <Link className='mainbtn' to="/">На главную <img src="/logo/Arrow.svg" alt="" /></Link>
        </div>
        
        </>
    )
}