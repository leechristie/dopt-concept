import React from 'react';

import ButtonToolbar from 'react-bootstrap/ButtonToolbar';

class ButtonSet extends React.Component {

    render = () => {
        return (
            <div className="d-flex justify-content-end">
            <ButtonToolbar>
                {this.props.children}
            </ButtonToolbar>
        </div>
        );
    }

}
    
export default ButtonSet;
