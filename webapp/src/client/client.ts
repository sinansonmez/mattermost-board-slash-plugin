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
            Authorization: 'Bearer jz84iy9m3tbopcirx1qxc14nwr',
            'X-Requested-With': 'XMLHttpRequest',
        };
    }

    private async getJson<T>(response: Response, defaultValue: T): Promise<T> {
        // The server may return null or malformed json
        try {
            const value = await response.json();
            return value || defaultValue;
        } catch {
            return defaultValue;
        }
    }

    createCard = async (payload: any) => {
        return this.doPost(`${this.url}/createcard`, payload);
    }

    // curl -i -d '{"login_id":"sysadmin","password":"Sys@dmin-sample1"}' https://8065-mattermost-mattermostgi-cf4j2retku7.ws-eu47.gitpod.io/api/v4/users/login

    getBoards = async (channelIds: string[]): Promise<any[]> => {
        console.log('channelIds: ', channelIds);
        const boardsList: any[] = [];
        for (const channelId of channelIds) {
            const path = `/api/v1/workspaces/${channelId}/blocks`;
            const response = await fetch(this.getBaseURL() + path, {headers: this.headers()});
            if (response.status !== 200) {
                return [];
            }
            const board = await this.getJson(response, {});
            boardsList.push(board);
        }
        console.log('boards:', boardsList);
        return boardsList;
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
}