import {connect} from 'react-redux';
import {bindActionCreators, Dispatch} from 'redux';

import {GlobalState} from 'mattermost-redux/types/store';
import {getAllChannels} from 'mattermost-redux/selectors/entities/channels';

import {isRootModalVisible, subMenu} from '../../selectors';

import {closeRootModal, createCard, getBoards} from 'actions';

import {CardForm} from './card_form';

const mapStateToProps = (state: GlobalState) => {
    return {
        visible: isRootModalVisible(state),
        subMenu: subMenu(state),
        channels: getAllChannels(state),
    };
};

const mapDispatchToProps = (dispatch: Dispatch) => bindActionCreators({
    close: closeRootModal,
    create: createCard,
    // getBoards,
}, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(CardForm);