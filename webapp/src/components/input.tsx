// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useState} from 'react';

import Setting from './setting';

type Props = {
    id: string,
    label: string,
    placeholder?: string,
    helpText?: string,
    value: string | number,
    maxLength?: number,
    onChange: (title: string) => void,
    disabled?: boolean,
    required?: boolean,
    readOnly?: boolean,
    type: 'number' | 'input' | 'textarea',
}

const Input = ({type = 'input', required = false, readOnly = false, ...remainingProps}: Props) => {
    const [invalid, setInvalid] = useState(false);

    // componentDidMount() {
    //     if (this.props.addValidate && this.props.id) {
    //         this.props.addValidate(this.props.id, this.isValid);
    //     }
    // }

    // componentWillUnmount() {
    //     if (this.props.removeValidate && this.props.id) {
    //         this.props.removeValidate(this.props.id);
    //     }
    // }

    // componentDidUpdate(prevProps, prevState) {
    //     if (prevState.invalid && this.props.value !== prevProps.value) {
    //         this.setState({invalid: false}); //eslint-disable-line react/no-did-update-set-state
    //     }
    // }

    const handleChange = (e: any) => {
        if (type === 'number') {
            remainingProps.onChange(parseInt(e.target.value, 10));
        } else {
            remainingProps.onChange(e.target.value);
        }
    };

    const isValid = () => {
        if (!required) {
            return true;
        }
        const valid = remainingProps.value && remainingProps.value.toString().length !== 0;
        setInvalid(!valid);
        return valid;
    };

    const requiredMsg = 'This field is required.';
    const style = getStyle();
    const value = remainingProps.value || '';

    let validationError = null;
    if (required && invalid) {
        validationError = (
            <p className='help-text error-text'>
                <span>{requiredMsg}</span>
            </p>
        );
    }

    let input = null;
    if (type === 'input') {
        input = (
            <input
                id={remainingProps.id}
                className='form-control'
                type='text'
                placeholder={remainingProps.placeholder}
                value={value}
                maxLength={remainingProps.maxLength}
                onChange={handleChange}
                disabled={remainingProps.disabled}
                readOnly={readOnly}
            />
        );
    } else if (type === 'number') {
        input = (
            <input
                id={remainingProps.id}
                className='form-control'
                type='number'
                placeholder={remainingProps.placeholder}
                value={value}
                maxLength={remainingProps.maxLength}
                onChange={handleChange}
                disabled={remainingProps.disabled}
                readOnly={readOnly}
            />
        );
    } else if (type === 'textarea') {
        input = (
            <textarea
                style={style.textarea as any}
                id={remainingProps.id}
                className='form-control'
                rows={5}
                placeholder={remainingProps.placeholder}
                value={value}
                maxLength={remainingProps.maxLength}
                onChange={handleChange}
                disabled={remainingProps.disabled}
                readOnly={readOnly}
            />
        );
    }

    return (
        <Setting
            label={remainingProps.label}
            helpText={remainingProps.helpText}
            inputId={remainingProps.id}
            required={required}
        >
            {input}
            {validationError}
        </Setting>
    );
};

const getStyle = () => ({
    textarea: {
        resize: 'none',
    },
});

export default Input;