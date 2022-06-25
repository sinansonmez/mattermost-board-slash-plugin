// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {Client4} from 'mattermost-redux/client';
import {ClientError} from 'mattermost-redux/client/client4';

import {Utils} from 'utils';

import {id as pluginId} from '../manifest';

export default class Client {
    url: string | undefined;
    readonly serverUrl: string | undefined

    private getBaseURL(): string {
        const baseURL = (this.serverUrl || Utils.getBaseURL(true)).replace(/\/$/, '');
        return baseURL;
    }
    setServerRoute(url: string) {
        this.url = url + `/plugins/${pluginId}/api/v1`;
    }

    private headers() {
        return {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            Authorization: 'Bearer seunw5btj38qx8n97qj4upabeo',
            'X-Requested-With': 'XMLHttpRequest',
        };
    }

    createCard = async (payload: any) => {
        return this.doPost(`${this.url}/createcard`, payload);
    }

    // curl -i -d '{"login_id":"sysadmin","password":"Sys@dmin-sample1"}' https://8065-mattermost-mattermostgi-cf4j2retku7.ws-eu47.gitpod.io/api/v4/users/login

    getBoards = async (payload: string) => {
        const path = `/api/v1/workspaces/${payload}/blocks`;
        return fetch(this.getBaseURL() + path, {headers: this.headers()});
    }

    doPost = async (url: string, body: any, headers?: Headers) => {
        const options = {
            method: 'post',
            body: JSON.stringify(body),
            headers,
        };

        const response = await fetch(url, Client4.getOptions(options));

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

    async getJson<T>(response: Response, defaultValue: T): Promise<T> {
        // The server may return null or malformed json
        try {
            const value = await response.json();
            return value || defaultValue;
        } catch {
            return defaultValue;
        }
    }
}

