// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {openRootModal} from 'actions';

type Message = {
    data: {
        title: string;
        channel_id: string;
    };
}

export function handleOpenCreateIssueModal(store: any) {
    return (msg: Message) => {
        if (!msg.data) {
            return;
        }
        store.dispatch(openRootModal(msg.data.title, msg.data.channel_id));
    };
}