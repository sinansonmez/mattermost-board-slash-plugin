// eslint-disable-next-line import/no-unresolved
import React from 'react';
import {Store, Action} from 'redux';

import {GlobalState} from 'mattermost-redux/types/store';
// eslint-disable-next-line import/no-unresolved
import {PluginRegistry} from 'types/mattermost-webapp';

import {mainMenuAction} from 'actions';
import CardForm from 'components/card_form';
import reducer from 'reducer';

import {handleOpenCreateIssueModal} from 'websocket';

import {id as pluginId} from './manifest';

export default class Plugin {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-function
    public async initialize(registry: PluginRegistry, store: Store<GlobalState, Action<Record<string, unknown>>>) {
        registry.registerReducer(reducer);

        registry.registerRootComponent(CardForm);
        registry.registerMainMenuAction(
            'Slash Plugin',
            () => store.dispatch(mainMenuAction() as any),

            // () => {
            //     window.openInteractiveDialog({
            //         dialog: {
            //             callback_id: 'somecallbackid',
            //             url: '/plugins/' + 12 + '/dialog/2',
            //             title: 'Sample Confirmation Dialog',
            //             elements: [],
            //             submit_label: 'Confirm',
            //             notify_on_cancel: true,
            //             state: 'somestate',
            //         },
            //     });
            // },
            <i className='icon fa fa-plug'/>,
        );
        registry.registerWebSocketEventHandler(`custom_${pluginId}_cardCreate`, handleOpenCreateIssueModal(store));
    }
}