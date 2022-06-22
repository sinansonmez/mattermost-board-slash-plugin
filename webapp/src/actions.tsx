import {AnyAction, Dispatch} from 'redux';

import {CLOSE_ROOT_MODAL, OPEN_ROOT_MODAL, SUBMENU} from 'action_types';
import Client from 'client';

export const openRootModal = (title: string, channelId:string, subMenuText = '') => (dispatch: Dispatch<AnyAction>) => {
    dispatch({
        type: SUBMENU,
        subMenu: subMenuText,
    });
    dispatch({
        type: OPEN_ROOT_MODAL,
        data: {
            title,
            channelId,
        },
    });
};

export const closeRootModal = () => (dispatch: Dispatch<AnyAction>) => {
    dispatch({
        type: CLOSE_ROOT_MODAL,
    });
};

export const createCard = (payload: any) => {
    return async (dispatch: Dispatch<AnyAction>) => {
        let data;
        try {
            data = await Client.createCard(payload);
        } catch (error) {
            return {error};
        }

        // const connected = await dispatch(checkAndHandleNotConnected(data));
        // if (!connected) {
        //     return {error: data};
        // }

        return {data};
    };
};

export const getBoards = (payload: string) => {
    return async (dispatch: Dispatch<AnyAction>) => {
        let data;
        try {
            data = await Client.getBoards(payload);
        } catch (error) {
            return {error};
        }

        // const connected = await dispatch(checkAndHandleNotConnected(data));
        // if (!connected) {
        //     return {error: data};
        // }

        return {data};
    };
};

export const mainMenuAction = openRootModal;