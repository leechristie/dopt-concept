import React from 'react';

import ProgressBar from 'react-bootstrap/ProgressBar';
import Form from 'react-bootstrap/Form';

class LabelledProgressBar extends React.Component {

    render = () => {
        return (
            <Form.Group className="LabelledTextBox" controlId={this.props.id}>
                <Form.Label>{this.props.label}</Form.Label>
                {
                    (this.props.progress >= 1)
                    ? <ProgressBar striped variant="success" now={100} />
                    : <ProgressBar animated now={this.props.progress * 100} />
                }
            </Form.Group>
        );
    }

}
        
export default LabelledProgressBar;
