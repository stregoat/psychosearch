import { useEffect } from "react";
export default function Study({ formData, setFormData }) {
    const handleFilesChange = (e) => {
        const files = Array.from(e.target.files);
        setFormData(prev => {
            const existingFiles = prev.diplomaFiles || [];
            const totalFiles = existingFiles.length + files.length;
            if (totalFiles > 5) {
                // Добавляем только столько, чтобы было 5
                const allowedFiles = files.slice(0, 5 - existingFiles.length);
                return {
                    ...prev,
                    diplomaFiles: [...existingFiles, ...allowedFiles]
                };
            }
            return {
                ...prev,
                diplomaFiles: [...existingFiles, ...files]
            };
        });
    };
    const removeFile = (indexToRemove) => {
        setFormData(prev => ({
            ...prev,
            diplomaFiles: prev.diplomaFiles.filter((_, index) => index !== indexToRemove)
        }));
    };
    useEffect(() => {
        return () => {
          formData.diplomaFiles?.forEach(file => {
            URL.revokeObjectURL(file);
          });
        };
      }, [formData.diplomaFiles]);
    return (
        <>
            <div className="row vacancy">
                <div className="title-content">
                    Образование
                    <p>
                        Укажите свое <span>высшее психологическое, медицинское (психиатрия) образование или переподготовку, год окончания, название факультета и специалитета</span>
                    </p>
                </div>
                <div className="vacancy-content">
                    <div className="label">
                        Информация об образовании
                        <textarea placeholder="Название ВУЗа, год окончания, название факультета и специалитета"
                            value={formData.education}
                            onChange={e => setFormData({ ...formData, education: e.target.value })}></textarea>
                    </div>
                </div>
            </div >
            <div className="row vacancy mt-100">
                <div className="title-content">
                    Диплом
                    <p>
                        Прикрепите фотографии <span> всех страниц диплома о высшем психологическом образовании, медицинском образовании (психиатрия) или переподготовке (до 5 фото)</span>
                    </p>
                </div>
                <div className="vacancy-content">
                    <div className="avatar">
                        <input type="file" id='file' multiple
                            onChange={handleFilesChange} name="diplomaFiles[]"  disabled={formData.diplomaFiles && formData.diplomaFiles.length >= 5}/>
                        <label htmlFor="file">
                            <img src="/icons/upload.svg" alt="" /> Загрузите файлы
                            <div className="previews">
                                {formData.diplomaFiles && formData.diplomaFiles.map((file, index) => (
                                    <div className="preview">
                                        <img
                                            key={index}
                                            src={URL.createObjectURL(file)}
                                            alt={`preview-${index}`}
                                        />
                                        <button onClick={() => removeFile(index)} >x</button>
                                    </div>
                                ))}
                            </div>

                        </label>
                    </div>
                </div>
            </div >
        </>
    )
}