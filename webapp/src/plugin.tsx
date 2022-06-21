// eslint-disable-next-line import/no-unresolved
import {Store, Action} from 'redux';

import {GlobalState} from 'mattermost-redux/types/store';
// eslint-disable-next-line import/no-unresolved
import {PluginRegistry} from 'types/mattermost-webapp';

import CardForm from 'components/card_form';
import reducer from 'reducer';

import {handleOpenCreateIssueModal} from 'websocket';

import Client from 'client';
import {getServerRoute} from 'selectors';

import {id as pluginId} from './manifest';

export default class Plugin {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-function
    public async initialize(registry: PluginRegistry, store: Store<GlobalState, Action<Record<string, unknown>>>) {
        registry.registerReducer(reducer);
        Client.setServerRoute(getServerRoute(store.getState()));

        registry.registerRootComponent(CardForm);
        registry.registerWebSocketEventHandler(`custom_${pluginId}_cardCreate`, handleOpenCreateIssueModal(store));
    }
}