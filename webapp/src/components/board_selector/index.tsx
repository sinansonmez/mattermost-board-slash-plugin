// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {Dispatch} from 'react';
import {connect} from 'react-redux';

import {GlobalState} from 'mattermost-redux/types/store';

import {getCurrentChannel} from 'mattermost-redux/selectors/entities/channels';

import {BoardSelector} from './board_selector';

function mapStateToProps(state: GlobalState) {
    return {
        currentChannel: getCurrentChannel(state),
    };
}

export default connect(mapStateToProps)(BoardSelector);
