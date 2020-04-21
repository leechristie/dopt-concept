import React from 'react';

import Form from 'react-bootstrap/Form';

import './index.css';

class LabelledReadOnlyTextBox extends React.Component {

    render = () => {
        return (
            <Form.Group className="LabelledReadOnlyTextBox" controlId={this.props.id}>
                <Form.Label>{this.props.label}</Form.Label>
                {this.props.value !== undefined && this.props.value !== ''
                ? <p className={'readonly-textbox align-' + this.props.align + " size-" + this.props.size}>{this.props.value}</p>
                : <p className={'readonly-textbox align-' + this.props.align + " size-" + this.props.size}>&nbsp;</p>}
            </Form.Group>
        );
    }

}

LabelledReadOnlyTextBox.defaultProps = {
    align: "left",
    size:  "normal"
}
        
export default LabelledReadOnlyTextBox;
