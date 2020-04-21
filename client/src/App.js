import React from 'react';

import CardDeck from 'react-bootstrap/CardDeck';

import LoadingScreen       from './LoadingScreen';
import ManualCard          from './ManualCard';
import HillClimberCard     from './HillClimberCard';
import ContractCard        from './ContractCard';
import ErrorMessageDecoder from './ErrorMessageDecoder';

import './App.css';
import ClosableTopAlert from './ClosableTopAlert';

class App extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            drizzle:            undefined,
            contractFitness:    undefined,
            contractCandidate:  undefined,
            contractLeader:     undefined,
            contractStartBlock: undefined,
            contractMaxRuntime: undefined,
            contractRuntime:    undefined,
            contractHeadNo:     undefined,
            alert:              undefined
        };
    }

    evaluate = (candidate) => {
        let rv = 0;
        for (let i = 0; i < candidate.length; i++) {
            if (candidate[i]) {
                rv += 1;
            }
        }
        return rv;
    }

    dummy = () => {
        const { drizzle } = this.props;
        const contract = drizzle.contracts.DOneMax;
        contract.methods['DEBUGGING_NOOP']().send({
            from: drizzle.web3.eth.accounts.givenProvider.selectedAddress
        }).then(() => {
            this.setState(() => {
                return  {
                    alert: {
                        title: "Success",
                        type: "success",
                        body: "Dummy transacion accepted."
                    }
                };
            });
        }).catch((error) => {
            const { title, type, body } = ErrorMessageDecoder.decode(error);
            this.setState(() => {
                return  {
                    alert: {
                        title: title,
                        type: type,
                        body: body
                    }
                };
            });
        });
    }

    submit = (candidate, fitness) => {
        const { drizzle } = this.props;
        const contract = drizzle.contracts.DOneMax;
        contract.methods['submit'](candidate, fitness).send({
            from: drizzle.web3.eth.accounts.givenProvider.selectedAddress
        }).then(() => {
            this.setState(() => {
                return  {
                    alert: {
                        title: "Success",
                        type: "success",
                        body: "Your submitted candidate was accepted, placing you as the leader."
                    }
                };
            });
        }).catch((error) => {
            const { title, type, body } = ErrorMessageDecoder.decode(error);
            this.setState(() => {
                return  {
                    alert: {
                        title: title,
                        type: type,
                        body: body
                    }
                };
            });
        });
    }

    // subscribe to Drizzle on mount
    componentDidMount = () => {
        const { drizzle } = this.props;
        this.unsubscribe = drizzle.store.subscribe(() => {
            const drizzleState = drizzle.store.getState();
            if (drizzleState.drizzleStatus.initialized) {
                this.setState(() => {
                    const dOneMax = drizzle.contracts.DOneMax;
                    dOneMax.methods['get_best_fitness']().call().then((result) => {
                        this.setState(() => ({
                        contractFitness: Number(result)
                    }));})
                    dOneMax.methods['get_best_candidate']().call().then((result) => {
                        this.setState(() => ({
                        contractCandidate: result
                    }));})
                    dOneMax.methods['get_leading_host']().call().then((result) => {
                        this.setState(() => ({
                        contractLeader: result
                    }));})
                    dOneMax.methods['get_start_block']().call().then((result) => {
                        this.setState(() => ({
                        contractStartBlock: Number(result)
                    }));})
                    dOneMax.methods['get_max_runtime']().call().then((result) => {
                        this.setState(() => ({
                        contractMaxRuntime: Number(result)
                    }));})
                    dOneMax.methods['get_runtime']().call().then((result) => {
                        this.setState(() => ({
                        contractRuntime: Number(result)
                    }));})
                    dOneMax.methods['DEBUGGING_HEAD_BLOCK_NUMBER']().call().then((result) => {
                        this.setState(() => ({
                        contractDebuggingHeadBlockNumber: result
                    }));})
                    return {
                        drizzle: drizzleState
                    };
                });
            }
        });
    }

    // unsubscribe from Drizzle on unmount
    componentWillUnmount = () => {
        if (this.unsubscribe !== undefined) {
            this.unsubscribe();
        }
    }

    onAlertOkayClick = () => {
        this.setState(() => {
            return {
                alert: undefined
            };
        });
    }

    // render either the app or the loading screen
    render = () => {
        if (this.state.drizzle !== undefined) {
            const contract = {
                fitness:              this.state.contractFitness,
                candidate:            this.state.contractCandidate,
                leader:               this.state.contractLeader,
                startBlock:           this.state.contractStartBlock,
                maxRuntime:           this.state.contractMaxRuntime,
                runtime:              this.state.contractRuntime,
                debuggingHeadBlockNo: this.state.contractDebuggingHeadBlockNumber
            }
            return (
                <div>
                    <ClosableTopAlert    alert={this.state.alert} onClick={this.onAlertOkayClick} />
                    <CardDeck>
                        <ManualCard      contract={contract} evaluate={this.evaluate} submit={this.submit} />
                        <HillClimberCard contract={contract} evaluate={this.evaluate} submit={this.submit} />
                        <ContractCard    contract={contract}                          dummy={this.dummy}   />
                    </CardDeck>
                </div>
            );
        } else {
            return <LoadingScreen />;
        }
    }

}

export default App;
