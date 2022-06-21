import {connect} from 'react-redux';
import {bindActionCreators, Dispatch} from 'redux';

import {GlobalState} from 'mattermost-redux/types/store';

import {isRootModalVisible, subMenu} from '../../selectors';

import {closeRootModal, createCard} from 'actions';

import {id as pluginId} from '../../manifest';

import {CardForm} from './card_form';

const mapStateToProps = (state: GlobalState) => {
    const {title, channelId} = state[`plugins-${pluginId}`];
    return {
        visible: isRootModalVisible(state),
        subMenu: subMenu(state),
    };
};

const mapDispatchToProps = (dispatch: Dispatch) => bindActionCreators({
    close: closeRootModal,
    create: createCard,
}, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(CardForm);