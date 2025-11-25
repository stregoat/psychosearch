import './Modal.css'
import { useEffect, useState } from 'react'
export default function Modal({ isOpen, onClose, children }) {
    const [show, setShow] = useState(false);
    const [active, setActive] = useState(false);
    useEffect(() => {
        if (isOpen) {
            setShow(true);
            setTimeout(() => setActive(true), 100);
            document.body.style.overflow = 'hidden';
        } else {
            setActive(false);
            document.body.style.overflow = '';
            const timeout = setTimeout(() => setShow(false), 300);
            return () => clearTimeout(timeout);
        }
    }, [isOpen]);
    if (!show) return null;
    return (
        <>
            <div className={`modal-overlay ${active ? 'active' : ''}`}
                onClick={onClose}>
                <div className='modal-cont'
                    onClick={(e) => e.stopPropagation()}>
                    <button className='modal-button' onClick={onClose}>
                        <img src="/icons/close.svg" alt="" /></button>
                    {children}
                </div>
            </div>
        </>
    )
}

