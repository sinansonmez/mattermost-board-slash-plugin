import {connect} from 'react-redux';
import {bindActionCreators, Dispatch} from 'redux';

import {GlobalState} from 'mattermost-redux/types/store';

import {isRootModalVisible, subMenu} from '../../selectors';

import {closeRootModal} from 'actions';

import {id as pluginId} from '../../manifest';

import {CardForm} from './card_form';

const mapStateToProps = (state: GlobalState) => {
    const {title, channelId} = state[`plugins-${pluginId}`];
    console.log('title: ', title);
    console.log('channelId: ', channelId);
    return {
        visible: isRootModalVisible(state),
        subMenu: subMenu(state),
    };
};

const mapDispatchToProps = (dispatch: Dispatch) => bindActionCreators({
    close: closeRootModal,
}, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(CardForm);