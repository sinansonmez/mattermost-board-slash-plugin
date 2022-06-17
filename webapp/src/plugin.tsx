// eslint-disable-next-line import/no-unresolved
import React from 'react';
import {Store, Action} from 'redux';

import {GlobalState} from 'mattermost-redux/types/store';
// eslint-disable-next-line import/no-unresolved
import {PluginRegistry} from 'types/mattermost-webapp';

import CardForm from 'CardForm/CardForm';
import {mainMenuAction} from 'actions';

export default class Plugin {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-function
    public async initialize(registry: PluginRegistry, store: Store<GlobalState, Action<Record<string, unknown>>>) {
    // @see https://developers.mattermost.com/extend/plugins/webapp/reference/
        registry.registerRootComponent(<CardForm/>);
        registry.registerMainMenuAction(
            'Slash Plugin',
            () => store.dispatch(mainMenuAction() as any),
            <i className='icon fa fa-plug'/>,
        );
    }
}