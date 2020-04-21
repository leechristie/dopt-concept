import React from 'react';

import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button';

import LabelledReadOnlyTextBox from '../LabelledReadOnlyTextBox';
import ButtonSet               from '../ButtonSet';
import EthIcon                 from '../EthIcon';
import BitStrings              from '../BitStrings';

class HillClimberCard extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            candidate: undefined,
            fitness:   undefined
        };
    }

    reset = () => {
        if (this.state.candidate !== undefined) {
            this.setState(() => {
                return {
                    candidate: undefined,
                    fitness:   undefined
                }
            });
        }
    }

    randomMutation = (candidate) => {
        if (candidate === undefined) {

            // random start
            let proto = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
            for (let i = 0; i < proto.length; i++) {
                proto[i] = Math.random() >= 0.5 ? 1 : 0;
            }
            return proto;

        } else {

            // random step
            let proto = candidate.slice();
            const index = (Math.random() * candidate.length) | 0;
            proto[index] = 1 - proto[index];
            return proto;

        }
    }

    step = () => {
        this.setState((state) => {

            const candidate = this.randomMutation(state.candidate);
            const fitness = this.props.evaluate(candidate);

            if (state.fitness === undefined || fitness > state.fitness) {

                // improvment
                return {
                    candidate:   candidate,
                    fitness:     fitness
                }

            } else {

                // no improvment
                return {}

            }

        });
    }

    submit = () => {
        if (this.state.candidate !== undefined && this.state.fitness !== undefined) {
            this.props.submit(this.state.candidate, this.state.fitness);
        }
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

        const candidate = BitStrings.format(this.state.candidate);
        const fitness   = this.state.fitness;

        // to check whether to activate the Import button
        const valid = this.props.contract.leader !== undefined && this.props.contract.leader > 0;

        return (
            <Card className="HillClimberCard">
                <Card.Header>Hill-Climber</Card.Header>
                <Card.Body>
                    <LabelledReadOnlyTextBox id="hillclimber-candidate"   label="Candidate"   value={candidate}                 />
                    <LabelledReadOnlyTextBox id="hillclimber-fitness"     label="Fitness"     value={fitness}     align="right" />
                    <ButtonSet>
                        <Button variant="secondary" onClick={this.reset}  disabled={this.state.candidate === undefined} >Reset</Button>
                        <Button variant="secondary" onClick={this.step}                                                 >Step</Button>
                    </ButtonSet>
                    <ButtonSet>
                        <Button variant="primary"   onClick={this.import} disabled={!valid}                                        >Import</Button>
                        <Button variant="primary"   onClick={this.submit} disabled={this.state.candidate === undefined} ><EthIcon />Submit</Button>
                    </ButtonSet>
                </Card.Body>
            </Card>
        );

    }

}
    
export default HillClimberCard;
