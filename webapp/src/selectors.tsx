import {GlobalState} from 'mattermost-redux/types/store';
import {getConfig} from 'mattermost-redux/selectors/entities/general';

import {id as pluginId} from './manifest';

const getPluginState = (state: GlobalState) => state['plugins-' + pluginId] || {};

export const isEnabled = (state: GlobalState) => getPluginState(state).enabled;

export const isRootModalVisible = (state: GlobalState) => getPluginState(state).rootModalVisible;

export const getServerRoute = (state: GlobalState) => {
    const config = getConfig(state);
    let basePath = '';
    if (config && config.SiteURL) {
        basePath = new URL(config.SiteURL).pathname;
        if (basePath && basePath[basePath.length - 1] === '/') {
            basePath = basePath.substr(0, basePath.length - 1);
        }
    }

    return basePath;
};