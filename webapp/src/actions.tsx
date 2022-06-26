import {AnyAction, Dispatch} from 'redux';

import {CLOSE_ROOT_MODAL, OPEN_ROOT_MODAL} from 'action_types';

export const openRootModal = () => (dispatch: Dispatch<AnyAction>) => {
    dispatch({
        type: OPEN_ROOT_MODAL,
    });
};

export const closeRootModal = () => (dispatch: Dispatch<AnyAction>) => {
    dispatch({
        type: CLOSE_ROOT_MODAL,
    });
};

export const mainMenuAction = openRootModal;