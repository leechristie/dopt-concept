import React from 'react';

import Alert  from 'react-bootstrap/Alert';
import Button from 'react-bootstrap/Button';

import './index.css';

class ClosableTopAlert extends React.Component {

    render = () => {
        if (this.props.alert !== undefined) {
            return <Alert variant={this.props.alert.type}>
                <Alert.Heading>{this.props.alert.title}</Alert.Heading>
                {this.props.alert.body}
                <div className="d-flex justify-content-end">
                    <Button variant="light" onClick={this.props.onClick}>Okay</Button>
                </div>
            </Alert>
        } else {
            return <></>
        }
    }

}

export default ClosableTopAlert;
