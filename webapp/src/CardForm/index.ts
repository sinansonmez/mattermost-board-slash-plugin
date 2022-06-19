import {connect} from 'react-redux';
import {bindActionCreators, Dispatch} from 'redux';

import {GlobalState} from 'mattermost-redux/types/store';

import {isRootModalVisible, subMenu} from '../selectors';

import {closeRootModal} from 'actions';

// eslint-disable-next-line import/no-unresolved
import {CardForm} from './card_form';

const mapStateToProps = (state: GlobalState) => {
    return {
        visible: isRootModalVisible(state),
        subMenu: subMenu(state),
    };
};

const mapDispatchToProps = (dispatch: Dispatch) => bindActionCreators({
    close: closeRootModal,
}, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(CardForm);