import {Action, combineReducers} from 'redux';

import {CLOSE_ROOT_MODAL, OPEN_ROOT_MODAL} from 'action_types';

const rootModalVisible = (state = false, action: Action) => {
    console.log('reducer.tsx', action, state);
    switch (action.type) {
    case OPEN_ROOT_MODAL:
        return true;
    case CLOSE_ROOT_MODAL:
        return false;
    default:
        return state;
    }
};

export default combineReducers({
    rootModalVisible,
});