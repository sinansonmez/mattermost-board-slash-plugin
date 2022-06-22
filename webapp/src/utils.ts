// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

interface IAppWindow extends Window {
    baseURL?: string
    frontendBaseURL?: string
    isFocalboardPlugin?: boolean
    getCurrentTeamId?: () => string
    msCrypto: Crypto
    openInNewBrowser?: ((href: string) => void) | null
    webkit?: {messageHandlers: {nativeApp?: {postMessage: <T>(message: T) => void}}}
}

declare let window: IAppWindow;

class Utils {
    static getBaseURL(absolute?: boolean): string {
        let baseURL = window.baseURL || '';
        baseURL = baseURL.replace(/\/+$/, '');
        if (baseURL.indexOf('/') === 0) {
            baseURL = baseURL.slice(1);
        }
        if (absolute) {
            return window.location.origin + '/' + baseURL;
        }
        return baseURL;
    }
}

export {Utils};