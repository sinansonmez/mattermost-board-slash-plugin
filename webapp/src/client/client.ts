// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {Client4} from 'mattermost-redux/client';
import {ClientError} from 'mattermost-redux/client/client4';

import {id as pluginId} from '../manifest';

export default class Client {
    url: string | undefined;
    setServerRoute(url: string) {
        this.url = url + `/plugins/${pluginId}/api/v1`;
    }
    createCard = async (payload: any) => {
        return this.doPost(`${this.url}/createcard`, payload);
    }

    doPost = async (url: string, body: any, headers?: Headers) => {
        const options = {
            method: 'post',
            body: JSON.stringify(body),
            headers,
        };

        const response = await fetch(url, Client4.getOptions(options));
        console.log('response: ', response);

        if (response.ok) {
            return response.json();
        }

        const text = await response.text();

        throw new ClientError(Client4.url, {
            message: text || '',
            status_code: response.status,
            url,
        });
    }
}