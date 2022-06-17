import React, {useEffect} from 'react';

type Props = {
    visible: boolean;
    close: () => void;
    subMenu: string;
    theme: any; // PropTypes.object.isRequired,
}

const CardForm = ({visible, close, theme, subMenu}: Props) => {
    console.log('CardForm', visible);

    useEffect(() => {
        console.log('CardForm useEffect');
    }, [visible]);

    if (!visible) {
        return null;
    }

    let extraContent = '';
    let extraContentTitle = '';
    if (subMenu) {
        extraContentTitle = 'Element clicked in the menu: ';
        extraContent = subMenu;
    }

    const style = getStyle(theme);

    return (
        <div
            style={style.backdrop as any}
            onClick={close}
        >
            <div style={style.modal}>
                {'You have triggered the root component of the demo plugin.'}
                <br/>
                <br/>
                {'Click anywhere to close.'}
                <br/>
                <br/>
                {'This is the default string'}
                <br/>
                <br/>
                {extraContentTitle}
                {extraContent}
            </div>
        </div>
    );
};

const getStyle = (theme: any) => ({
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
        height: '250px',
        width: '400px',
        padding: '1em',
        color: theme.centerChannelColor,
        backgroundColor: theme.centerChannelBg,
    },
});

export default CardForm;