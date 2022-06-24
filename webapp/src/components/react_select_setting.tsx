// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import ReactSelect from 'react-select';

import Setting from 'components/setting';

type props = {
    name: string;
    label: string;
    onChange: (newValue: unknown, actionMeta: any) => void;
    value?: { value: string; label: string };
    options: { value: string; label: string }[];
    required?: boolean;
}

const ReactSelectSetting = (props: props) => {
    const handleChange = (newValue: unknown, actionMeta: any) => {
        props.onChange(newValue, actionMeta);
    };

    const requiredMsg = 'This field is required.';
    let validationError = null;
    if (props.required) {
        validationError = (
            <p className='help-text error-text'>
                <span>{requiredMsg}</span>
            </p>
        );
    }

    return (

        <Setting
            inputId={props.name}
            {...props}
        >
            <ReactSelect
                {...props}
                menuPlacement='auto'
                onChange={handleChange}
            />
            {/* {validationError} */}
        </Setting>
    );
};

export default ReactSelectSetting;
