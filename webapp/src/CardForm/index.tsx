import {connect} from 'react-redux';
import {bindActionCreators, Dispatch} from 'redux';

import {GlobalState} from 'mattermost-redux/types/store';

import {isRootModalVisible, subMenu} from '../selectors';

import {closeRootModal} from 'actions';

import CardForm from './CardForm';

const mapStateToProps = (state: GlobalState) => ({
    visible: isRootModalVisible(state),
    subMenu: subMenu(state),
});

const mapDispatchToProps = (dispatch: Dispatch) => bindActionCreators({
    close: closeRootModal,
}, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(CardForm);