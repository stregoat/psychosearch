import { useEffect } from "react";
export default function About({ formData, setFormData }) {
    const handleFilesChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData(prev => ({
                ...prev,
                photo: file
            }));
        }
    };
    const removeFile = () => {
        setFormData(prev => ({
            ...prev,
            photo: null
        }));
    };
    useEffect(() => {
        return () => {
          if (formData.photo) {
            URL.revokeObjectURL(formData.photo);
          }
        };
      }, [formData.photo]);
    return (
        <>
            <div className="row vacancy">
                <div className="title-content">
                    О вас
                    <p>
                        Расскажите <span>о себе в свободной форме. Есть ли у вас другая работа, помимо консультирования?</span>
                    </p>
                </div>
                <div className="vacancy-content">
                    <div className="label">
                        Информация о вас
                        <textarea placeholder="Что считаете нам нужно узнать о вас, чтобы понять, какой вы специалист? Как распределяются интересы и приоритеты?"
                            value={formData.about}
                            onChange={e => setFormData({ ...formData, about: e.target.value })}></textarea>
                    </div>
                </div>
            </div >
            <div className="row vacancy mt-100">
                <div className="title-content">
                    Ваше фото
                    <p>
                        Прикрепите вашу фотографию, требования к фото: <br /><span>
                            1. Цветная <br />
                            2. Размер не менее 1 Мб <br />
                            3. Лицо хорошо освещено <br />
                            4. Лицо должно быть вписано в квадрат <br />
                        </span> <br />
                        Если мы заключим с вами договор, ваша фотография будет использована на платформе для рассказа о вас клиентам
                    </p>
                </div>
                <div className="vacancy-content">
                    <div className="avatar">
                        <input type="file" id='file'
                            onChange={handleFilesChange} />
                        <label htmlFor="file">
                            <img src="/icons/upload.svg" alt="" /> Загрузите файл
                            <div className="previews">
                                {formData.photo && (
                                    <div className="preview">
                                        <img
                                            src={URL.createObjectURL(formData.photo)}
                                            alt={`preview`}
                                        />
                                        <button onClick={removeFile} >x</button>
                                    </div>
                                )}
                            </div>
                        </label>
                    </div>
                </div>
            </div >
        </>
    )
}