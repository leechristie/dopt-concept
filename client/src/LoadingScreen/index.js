import React from 'react';

import Jumbotron from 'react-bootstrap/Jumbotron';
import Spinner from 'react-bootstrap/Spinner';

import './index.css'

class LoadingScreen extends React.Component {

    render = () => {
        return (
            <div className="spinner-container">
                <Jumbotron>
                    <Spinner animation="border" />
                    <p>Loading Drizzle . . .</p>
                </Jumbotron>
            </div>
        );
    }

}

export default LoadingScreen;
