import React, { useRef, useState } from 'react';

import fileIcon from 'assets/images/file.png';
import { useTranslation } from 'react-i18next';

interface FileInputProps {
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    className?: string;
}

const FileInput = (props: FileInputProps): JSX.Element => {
    const { className } = props;
    const { t } = useTranslation();

    const innerRef = useRef<HTMLInputElement>(null);

    const [innerLabel, setInnerLabel] = useState(t('welcome.softwareModal.guardaBackup.fileInputDefaultLabel'));

    const onInputClick: React.MouseEventHandler<HTMLLabelElement> = (event) => {
        event.preventDefault();

        if (innerRef && innerRef.current) {
            innerRef.current.click();
        }
    };

    const onFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let fileName = '';
        if (e.target.files && e.target.files.length > 0) {
            fileName = e.target.files[0].name;
        }

        if (fileName) {
            setInnerLabel(fileName);
        } else {
            setInnerLabel(t('welcome.softwareModal.guardaBackup.fileInputDefaultLabel'));
        }

        if (props.onChange) {
            props.onChange(e);
        }
    };

    return (
        <div className={`file-input-container ${className}`}>
            <input
                id="file-input"
                ref={innerRef}
                accept=".txt"
                multiple={false}
                type="file"
                name="file-input"
                onChange={onFileInputChange}
            />
            <label htmlFor="file-input" onClick={onInputClick}>
                <span className="me-4">
                    <img src={fileIcon} className="file-input-icon" />
                </span>
                {innerLabel}
            </label>
        </div>
    );
};

export default FileInput;
