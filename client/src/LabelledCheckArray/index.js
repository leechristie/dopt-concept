import React from 'react';

import InputGroup from 'react-bootstrap/InputGroup';
import Form       from 'react-bootstrap/Form';

import './index.css';

class LabelledCheckArray extends React.Component {

    onChange(index) {
        let candidate = this.props.value.slice();
        candidate[index] = 1 - candidate[index];
        this.props.onCandidateChanged(candidate.slice());
    }

    render = () => {
        if (this.props.value !== undefined) {
            return (
                <Form.Group className="LabelledTextBox" controlId={this.props.id}>
                    <Form.Label>{this.props.label}</Form.Label>
                    <InputGroup className="mb-3">
                        {this.props.value.map(
                            (element, index) =>
                                <input className="checkbox" type="checkbox" key={index} checked={element} onChange={() => {this.onChange(index)}}/>
                            )
                        }
                    </InputGroup>
                </Form.Group>
            );
        } else {
            return <p>TEMP</p>
        }
    }

}
        
export default LabelledCheckArray;
