// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

type Props = {
    executing?: boolean,
    disabled?: boolean,
    children?: JSX.Element | string,
    executingMessage?: JSX.Element,
    defaultMessage: string,
    btnClass: string,
    onClick?: (e: React.MouseEvent) => void,
    extraClasses?: string,
    saving?: boolean,
    savingMessage?: string,
    type?: 'submit' | 'reset' | 'button',
}

const FormButton = ({saving, disabled = false, savingMessage = 'Creating', defaultMessage = 'Create', btnClass = 'btn-primary', extraClasses = '', ...remainingProps}: Props) => {
    let contents;
    if (saving) {
        contents = (
            <span>
                <span
                    className='fa fa-spin fa-spinner'
                    title={'Loading Icon'}
                />
                {savingMessage}
            </span>
        );
    } else {
        contents = defaultMessage;
    }

    let className = 'save-button btn ' + btnClass;

    if (extraClasses) {
        className += ' ' + extraClasses;
    }

    return (
        <button
            id='saveSetting'
            className={className}
            disabled={disabled}
            {...remainingProps}
        >
            {contents}
        </button>
    );
};

export default FormButton;