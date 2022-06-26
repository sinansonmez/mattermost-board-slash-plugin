// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useEffect, useState} from 'react';

import {Channel} from 'mattermost-redux/types/channels';

import ReactSelectSetting from 'components/react_select_setting';
import Client from 'client';

export type Props = {
    currentChannel: Channel;
    onChange: (newValue: unknown, actionMeta: any) => void;
    required: boolean;
    value: {value: string; label: string};
    setNoBoardAvailable: (noBoardAvailable: boolean) => void;
}

export const BoardSelector = (props: Props) => {
    const [yourBoards, setYourBoards] = useState<Array<{id: string, title: string}>>([]);

    const onChange = (newValue: unknown, actionMeta: any) => {
        props.onChange(newValue, actionMeta);
    };

    useEffect(() => {
        const response = Client.getBoards(props.currentChannel.id);
        response.then((data) => {
            // eslint-disable-next-line max-nested-callbacks
            Client.getJson(data, []).then((json) => {
                // eslint-disable-next-line max-nested-callbacks
                const onlyBoards = json.filter((item) => item.type === 'board');
                setYourBoards(onlyBoards);
                props.setNoBoardAvailable(onlyBoards.length === 0);
            });
        });
    }, []);

    const boardOptions = yourBoards.map((item) => ({value: item.id, label: item.title}));

    return (
        <div className={'form-group margin-bottom x3'}>
            <ReactSelectSetting
                name={'board'}
                label={'Board'}
                required={true}
                onChange={onChange}
                options={boardOptions}
                key={'board'}
                value={boardOptions.find((option) => option.value === props.value.value)}
            />
            <div className={'help-text'}>
                {'Returns all boards for the user'} <br/>
            </div>
        </div>
    );
};
