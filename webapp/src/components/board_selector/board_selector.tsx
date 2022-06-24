// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useEffect, useState} from 'react';

import {Channel} from 'mattermost-redux/types/channels';

import ReactSelectSetting from 'components/react_select_setting';
import Client from 'client';

export type Props = {
    currentChannel: Channel;
    // onChange: (newValue: unknown, actionMeta: any) => void;
    // value: string;

    // addValidate: (name: string) => void;
    // removeValidate: (name: string) => void;
}

export const BoardSelector = (props: Props) => {
    const [yourBoards, setYourBoards] = useState<Array<{id: string, title: string}>>([]);

    const onChange = (newValue: unknown, actionMeta: any) => {
        console.log('onChange: ', newValue);
        props.onChange(newValue, actionMeta);
    };

    useEffect(() => {
        const response = Client.getBoards(props.currentChannel.id);
        response.then((data) => {
            Client.getJson(data, {}).then((json) => setYourBoards(json));
        });
    }, []);

    const boardOptions = yourBoards.map((item) => ({value: item.id, label: item.title}));
    // const boardOptions = [{value: 'board1', label: 'board1'}, {value: 'board2', label: 'board2'}];

    return (
        <div className={'form-group margin-bottom x3'}>
            <ReactSelectSetting
                name={'board'}
                label={'Board'}
                required={true}
                // onChange={onChange}
                options={boardOptions}
                // key={'board'}
                // value={boardOptions.find((option) => option.value === props.value)}
            />
            <div className={'help-text'}>
                {'Returns all boards for the user'} <br/>
            </div>
        </div>
    );
};
