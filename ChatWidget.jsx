import React, { forwardRef } from 'react';
import { Widget } from '@ryaneewx/react-chat-widget';

const ChatWidget = forwardRef((props, ref) => (
  <Widget
    {...props}
    handleNewUserMessage={props.handleNewUserMessage}
    handleToggle={props.handleToggle}
    autofocus={props.autofocus}
    inputRef={ref} // Attach the ref to the input element
  />
));

export default ChatWidget;