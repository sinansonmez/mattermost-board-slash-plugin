import {connect} from 'react-redux';
import {bindActionCreators, Dispatch} from 'redux';

import {GlobalState} from 'mattermost-redux/types/store';
import {getCurrentChannel} from 'mattermost-redux/selectors/entities/channels';

import {getCurrentUserId} from 'mattermost-redux/selectors/entities/common';

import {isRootModalVisible} from '../../selectors';

import {closeRootModal, createCard} from 'actions';

import {CardForm} from './card_form';

const mapStateToProps = (state: GlobalState) => {
    return {
        visible: isRootModalVisible(state),
        currentChannel: getCurrentChannel(state),
        currentUserId: getCurrentUserId(state),
    };
};

const mapDispatchToProps = (dispatch: Dispatch) => bindActionCreators({
    close: closeRootModal,
    create: createCard,
}, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(CardForm);