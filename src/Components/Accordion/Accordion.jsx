import React, { useState, useRef, useEffect } from "react";
import "./Accordion.css"; 

export default function Accordion({ title, content }) {
  const [isOpen, setIsOpen] = useState(false);
  const [height, setHeight] = useState("0px");
  const contentRef = useRef(null); 

  const toggleAccordion = () => {
    setIsOpen(!isOpen); 
    setHeight(isOpen ? "0px" : `${contentRef.current.scrollHeight}px`); 
  };

  useEffect(() => {
    setHeight(isOpen ? `${contentRef.current.scrollHeight}px` : "0px"); 
  }, [isOpen]);

  return (
    <div className="accordion-section">
      <button className={`accordion ${isOpen ? "active" : ""}`} onClick={toggleAccordion}>
        {title}
            <img className={`arrow ${isOpen ? "rotate" : ""}`} src="/icons/accord.svg" alt="" />
      </button>
      <div
        ref={contentRef}
        style={{ maxHeight: `${height}` }}
        className={`accordion-content ${isOpen ? 'open' : ''}`}
      >
        <div className="accordion-text">{content}</div>
      </div>
    </div>
  );
}
