class ErrorMessageDecoder {

    decode(error) {
        
        const message = error.message;

        if (message.includes("not an improvement")) {
            return {
                title: 'Not an Improvement',
                type: 'danger',
                body: 'Your submission was rejected beause the collective best fitness is equal or greater than that of your submitted candidate.'
            };
        } else if (message.includes("claimed fitness is not correct")) {
            return {
                title: 'Claimed Fitness is Not Correct',
                type: 'danger',
                body: 'The smart contract calculates a different fitness value for your submitted candidate than the one provided.'
            };
        } else if (message.includes("denied transaction signature")) {
            return {
                title: 'Cancelled Transaction',
                type: 'info',
                body: 'The user cancelled the pending transaction, no action was taken.'
            };
        } else if (message.includes("account has nonce")) {
            return {
                title: 'Nonce Mismatch',
                type: 'danger',
                body: 'Your Ethereum client has the wrong transaction nonce. Try resetting your MetaMask account under Advanced Settings.'
            };
        } else if (message.includes("contract has ended")) {
            return {
                title: 'Contract Ended',
                type: 'danger',
                body: 'The smart contract has ended, no further submissions will be accepted.'
            };
        } else {
            return {
                title: 'Unknown Error',
                type: 'danger',
                body: 'An unknown error occoured.'
            };
        }

    }

}

export default new ErrorMessageDecoder();
