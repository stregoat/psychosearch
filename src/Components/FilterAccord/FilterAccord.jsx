import React, { useState } from 'react';
import './FilterAccord.css';

const Accordion = ({ title, children }) => {
    const [isOpen, setIsOpen] = useState(false);

    const toggleAccordion = () => {
        setIsOpen(!isOpen);
    };

    return (
        <div className="accordion-filter">
            <div className="accordion-header" onClick={toggleAccordion}>
                <h3>{title}</h3>
                <img src="/icons/filteraccord.svg" className={` ${isOpen ? 'rotate' : ''}`} alt="" />
            </div>
            <div className={`accordion-cont ${isOpen ? 'open' : ''}`}>
                {children}
            </div>
        </div>
    );
};

export default Accordion;
