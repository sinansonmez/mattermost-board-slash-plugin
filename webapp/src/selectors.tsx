import {GlobalState} from 'mattermost-redux/types/store';

import {id as pluginId} from './manifest';

const getPluginState = (state: GlobalState) => state['plugins-' + pluginId] || {};

export const isEnabled = (state: GlobalState) => getPluginState(state).enabled;

export const isRootModalVisible = (state: GlobalState) => getPluginState(state).rootModalVisible;

export const subMenu = (state: GlobalState) => getPluginState(state).subMenu;