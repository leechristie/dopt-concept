import React from 'react';

import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button';

import LabelledReadOnlyTextBox from '../LabelledReadOnlyTextBox';
import LabelledProgressBar     from '../LabelledProgressBar';
import ButtonSet               from '../ButtonSet';
import BitStrings              from '../BitStrings';
import EthIcon                 from '../EthIcon';

class ContractCard extends React.Component {

    render = () => {

        const { contract } = this.props;

        // gets the properties from the contract object
        const candidate  = BitStrings.format(contract.candidate);
        const fitness    = contract.fitness      !== undefined ? contract.fitness      : "";
        const leader     = contract.leader       !== undefined ? contract.leader       : "";
        const runtime    = contract.runtime      !== undefined ? contract.runtime      :  0;
        const maxRuntime = contract.maxRuntime   !== undefined ? contract.maxRuntime   :  0;

        // calculates progress for progress bar
        const progress = maxRuntime > 0 ? runtime / maxRuntime : 0;

        // check whether the information is valid and should be shown
        const valid = leader !== undefined && leader > 0;

        return (
            <Card className="ContractCard">
                <Card.Header>Contract</Card.Header>
                <Card.Body>
                    <LabelledProgressBar     id="contract-runtime"   label="Runtime"   progress={valid ? progress  :  0}               />
                    <LabelledReadOnlyTextBox id="contract-candidate" label="Candidate" value=   {valid ? candidate : ''}               />
                    <LabelledReadOnlyTextBox id="contract-fitness"   label="Fitness"   value=   {valid ? fitness   : ''} align="right" />
                    <LabelledReadOnlyTextBox id="contract-leader"    label="Leader"    value=   {valid ? leader    : ''} size="big"    />
                    <ButtonSet>
                        <Button variant="primary" onClick={this.props.dummy} ><EthIcon />Dummy Transaction</Button>
                    </ButtonSet>
                </Card.Body>
            </Card>
        );

    }

}
    
export default ContractCard;
