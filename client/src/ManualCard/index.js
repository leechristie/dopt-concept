import React from 'react';

import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button';

import LabelledReadOnlyTextBox from '../LabelledReadOnlyTextBox';
import LabelledCheckArray      from '../LabelledCheckArray';
import ButtonSet               from '../ButtonSet';
import EthIcon                 from '../EthIcon';
import BitStrings              from '../BitStrings';

class ManualCard extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            candidate: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0,],
            fitness:   0
        };
    }

    submit = () => {
        if (this.state.candidate !== undefined && this.state.fitness !== undefined) {
            this.props.submit(this.state.candidate, this.state.fitness);
        }
    }

    onCandidateChanged = (candidate) => {
        const fitness = this.props.evaluate(candidate);
        this.setState(() => {
            return {
                candidate: candidate,
                fitness:   fitness
            };
        });
    }

    import = () => {

        const { contract } = this.props;
        const leader = contract.leader !== undefined ? contract.leader : "";
        const valid = leader !== undefined && leader > 0;

        const candidate = contract.candidate.map((x) => Number(x));
        const fitness = contract.fitness !== undefined ? contract.fitness : "";

        if (valid) {
            this.setState(
                () => {
                    return {
                        candidate: candidate,
                        fitness:   fitness
                    }
                }
            );
        }

    }

    render = () => {

        const candidate     = this.state.candidate;
        const candidate_str = BitStrings.format(candidate);
        const fitness       = this.state.fitness;

        // to check whether to activate the Import button
        const valid = this.props.contract.leader !== undefined && this.props.contract.leader > 0;

        return (
            <Card className="ManualCard">
                <Card.Header>Manual</Card.Header>
                <Card.Body>
                    <LabelledCheckArray      id="manual-check"     label="Input"     value={candidate}     length={10} onCandidateChanged={this.onCandidateChanged} />
                    <LabelledReadOnlyTextBox id="manual-candidate" label="Candidate" value={candidate_str}                                                              />
                    <LabelledReadOnlyTextBox id="manual-fitness"   label="Fitness"   value={fitness}       align="right"                                            />
                    <ButtonSet>
                        <Button variant="primary" onClick={this.import} disabled={!valid}                                        >Import</Button>
                        <Button variant="primary" onClick={this.submit} disabled={this.state.candidate === undefined} ><EthIcon />Submit</Button>
                    </ButtonSet>
                </Card.Body>
            </Card>
        );

    }

}
    
export default ManualCard;
