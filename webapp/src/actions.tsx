import {CLOSE_ROOT_MODAL, OPEN_ROOT_MODAL, SUBMENU} from 'action_types';

export const openRootModal = (subMenuText = '') => (dispatch: any) => {
    dispatch({
        type: SUBMENU,
        subMenu: subMenuText,
    });
    dispatch({
        type: OPEN_ROOT_MODAL,
    });
};

export const closeRootModal = () => (dispatch: any) => {
    dispatch({
        type: CLOSE_ROOT_MODAL,
    });
};

export const mainMenuAction = openRootModal;