import { Link } from 'react-router-dom';
import './Job.css'
import Accordion from "../../Components/Accordion/Accordion"

export default function Job() {
    return (
        <>
            <div className="bread">
                <Link className='breadlink' to="/"> Главная </Link>
                <img src="icons/to.svg" alt="" />
                <Link className='breadlink' to="/job">Вакансии</Link>
            </div>
            <div className="title-job">
                <p>
                    Мы всегда рады специалистам, которые относятся к профессии так же трепетно и бережно, как и мы.
                </p>
                <div className="text">
                    Более <span>100</span>   психологов уже <br /> развивают свою практику в  <br />нашей системе
                    <Link className='btn' to='/vacancy'>Присоединиться к команде <img src="logo/Arrow3.svg" alt="" /></Link>
                </div>
                <img className="img" src="img/j1.svg" alt="" />
                <img className="img" src="img/j2.svg" alt="" />
            </div>
            <div className="ticker">
                <div className="ticker-wrapper">
                    <div className="ticker-text">
                        <img src="/img/t1.png" alt="" />
                    </div>

                    <div className="ticker-text">
                        <img src="/img/t2.png" alt="" />
                    </div>

                    <div className="ticker-text">
                        <img src="/img/t3.png" alt="" />
                    </div>

                    <div className="ticker-text">
                        <img src="/img/t4.png" alt="" />
                    </div>
                    <div className="ticker-text">
                        <img src="/img/t5.png" alt="" />
                    </div>

                </div>
            </div>
            <div className="content pt-200">
                <div className="title-row">
                    <div className="subtitle">
                        Мы ждем от <span>тебя</span>
                    </div>
                </div>
                <div className="card-row">
                    <div className="card">
                        <h6>Профильное <br />
                            образование</h6>
                        <p>Высшее, медицинское (психиатрия) или переподготовка</p>
                    </div>
                    <div className="img">
                        <img src="img/img5.png" alt="" />
                    </div>
                    <div className="line">
                        <div className="card">
                            <h6>Опыт личной <br />
                                терапии</h6>
                            <p>
                                Обязательное наличие регулярной <br /> личной психотерапии</p>
                        </div>
                        <div className="img">
                            <img src="img/img6.png" alt="" />
                        </div>
                    </div>
                    <div className="line2">
                        <div className="img"><img src="img/img7.png" alt="" /></div>
                        <div className="card corner">
                            <h6>От 3-х лет   <br />
                                опыта</h6>
                            <p>Речь только о платном консультировании
                            </p>
                        </div>
                    </div>
                    <div className="img"><img src="img/img8.png" alt="" /></div>
                    <div className="card corner2">
                        <h6>Налоговый <br />
                            статус</h6>
                        <p>Самозанятый или индивидуальный предприниматель
                        </p>
                    </div>
                </div>
            </div>
            <div className="content">
                <div className="title-row">
                    <div className='dn'></div>
                    <div className="subtitle w">
                        Мы дадим <span>тебе</span>
                    </div>
                </div>
                <div className="card-row">
                    <div className="card">
                        <h6>Возможность <br />
                            консультировать</h6>
                        <p>В среднем каждый наш специалист работает <br /> с 10 клиентами.</p>
                    </div>
                    <div className="img">
                        <img src="img/img9.png" alt="" />
                    </div>
                    <div className="line">
                        <div className="card">
                            <h6>Бесплатные <br />
                                супервизии</h6>
                            <p>
                                Каждую неделю у нас проходит 10 <br />супервизионных групп</p>
                        </div>
                        <div className="img">
                            <img src="img/img10.png" alt="" />
                        </div>
                    </div>
                    <div className="line2">
                        <div className="img"><img src="img/img11.png" alt="" /></div>
                        <div className="card corner">
                            <h6>Регулярные   <br />
                                семинары</h6>
                            <p>От самых выдающихся профессиональнов сообщества.
                            </p>
                        </div>
                    </div>
                    <div className="img"><img src="img/img12.png" alt="" /></div>
                    <div className="card corner2">
                        <h6>Доступ к  <br />
                            сообществу</h6>
                        <p>Проводим общие <br /> онлайн-встречи обмениваться знаниями.
                        </p>
                    </div>
                </div>
            </div>
            <div className="content-row">
                <div className="subtitle">
                    Начни  <span>развивать</span>   свою практику вместе  с  нами
                    <Link className='btn' to='/vacancy'>Присоединиться к команде <img src="logo/Arrow3.svg" alt="" /></Link>
                </div>
                <div className="accordion-nav">
                    <Accordion title="Сколько психотерапевт получает за сессию?" content="Это зависит от процентной ставки, но в среднем за одну сессию с клиентом специалист получает около 2000 рублей при начале сотрудничества. У специалиста есть возможность увеличить стоимость своей работы при условии устойчивой практики." />
                    <Accordion title="Каковы условия принятия заявки на рассмотрение?" content="Базовое высшее психологическое образование или профессиональная переподготовка
Подтвержденное сертификатами и дипломами образование в одном из психотерапевтических методов от 500 часов
Личная практика (за деньги, не учебная) от 3-х лет
Наличие регулярных супервизий
Опыт личной психотерапии. Наличие регулярной личной психотерапии в текущий момент — весомый плюс." />
                    <Accordion title="Как долго рассматривается заявка?" content="В среднем мы рассматриваем анкету две-три недели." />
                </div>
            </div>
        </>

    )
}
