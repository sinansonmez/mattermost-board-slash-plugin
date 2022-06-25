import React, {useState} from 'react';
import {Modal} from 'react-bootstrap';

import {Channel} from 'mattermost-redux/types/channels';

import {UserProfile} from 'mattermost-redux/types/users';

import FormButton from 'components/form_button';
import Input from 'components/input';
import BoardSelector from 'components/board_selector';

type Theme = {
    centerChannelColor: string,
    centerChannelBg: string
}

type Props = {
    visible: boolean;
    currentChannel: Channel;
    currentUserId: string
    close: () => void;
    create: (card: {title: string, body: string}) => {data?: string, error?: {message: string}};
    theme: Theme;
}

const MAX_TITLE_LENGTH = 256;

export const CardForm = ({visible, close, theme, create, currentChannel, currentUserId}: Props) => {
    const [error, setError] = useState('');
    const [board, setBoard] = useState({id: '', name: ''});
    const [showErrors, setShowErrors] = useState(false);
    const [cardTitle, setCardTitle] = useState('');
    const [cardDescription, setCardDescription] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const getErrorMessage = (str: string) => {
        try {
            const parsed = JSON.parse(str);
            return parsed.message;
        } catch (e) {
            return str;
        }
    };

    const requiredMsg = 'This field is required.';
    let issueTitleValidationError = null;
    if (showErrors) {
        issueTitleValidationError = (
            <p className='help-text error-text'>
                <span>{requiredMsg}</span>
            </p>
        );
    }

    let submitError = null;
    if (error) {
        submitError = (
            <p className='help-text error-text'>
                <span>{error}</span>
            </p>
        );
    }

    // handle card creation after form is populated
    const handleCreate = async (e: React.FormEvent) => {
        if (e && e.preventDefault) {
            e.preventDefault();
        }

        if (!cardTitle || !board.id) {
            setShowErrors(true);
            return;
        }

        const card = {
            RootID: board.id,
            Title: cardTitle,
            body: cardDescription,
            WorkspaceID: currentChannel.id,
            CreatedBy: currentUserId,
            ModifiedBy: currentUserId,
        };

        setSubmitting(true);

        const created = await create(card);
        if (created.error) {
            const errMessage = getErrorMessage(created.error.message);
            setError(errMessage);
            setShowErrors(true);
            setSubmitting(false);
            return;
        }
        handleClose(e);
    };

    const handleClose = (e: React.FormEvent) => {
        if (e && e.preventDefault) {
            e.preventDefault();
        }
        close();
    };

    const handleCardTitleChange = (cardTitleParam: string) => setCardTitle(cardTitleParam);
    const handleCardDescriptionChange = (cardDescriptionParam: string) => setCardDescription(cardDescriptionParam);
    const handleBoardChange = (boardParam: unknown, actionMeta: any) => {
        if (actionMeta.action === 'select-option') {
            const newBoard = {id: boardParam.value, name: boardParam.label} || {id: '', name: ''};
            setBoard(newBoard);
        }
    };

    const style = getStyle(theme);

    const component = (
        <div>
            <BoardSelector
                onChange={handleBoardChange}
                value={board}
                required={true}
            />

            <Input
                id={'title'}
                label='Title for Card'
                type='input'
                required={true}
                disabled={false}
                maxLength={MAX_TITLE_LENGTH}
                value={cardTitle}
                onChange={handleCardTitleChange}
            />
            {issueTitleValidationError}

            <Input
                id={'description'}
                label='Description for the Card'
                type='textarea'
                value={cardDescription}
                onChange={handleCardDescriptionChange}
            />
        </div>
    );

    if (!visible) {
        return null;
    }

    return (
        <Modal
            dialogClassName='modal--scroll'
            show={true}
            onHide={handleClose}
            bsSize='large'
            backdrop='static'
        >
            <Modal.Header closeButton={true}>
                <Modal.Title>
                    {'Create Card'}
                </Modal.Title>
            </Modal.Header>
            <form
                role='form'
                onSubmit={handleCreate}
            >
                <Modal.Body style={style.modal} >
                    {component}
                </Modal.Body>
                <Modal.Footer>
                    {submitError}
                    <FormButton
                        type='button'
                        btnClass='btn-link'
                        defaultMessage='Cancel'
                        onClick={handleClose}
                    />
                    <FormButton
                        type='submit'
                        btnClass='btn btn-primary'
                        saving={submitting}
                        defaultMessage='Submit'
                        savingMessage='Submitting'
                    >
                        {'Submit'}
                    </FormButton>
                </Modal.Footer>
            </form>
        </Modal>
    );
};

const getStyle = (theme: Theme) => ({
    backdrop: {
        position: 'absolute',
        display: 'flex',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.50)',
        zIndex: 2000,
        alignItems: 'center',
        justifyContent: 'center',
    },
    modal: {
        padding: '1em',
        color: theme.centerChannelColor,
        backgroundColor: theme.centerChannelBg,
    },
});