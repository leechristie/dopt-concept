import React from 'react';
import ReactDOM from 'react-dom';

import App from './App';

import { Drizzle } from "drizzle";
import DOneMax from "./contracts/DOneMax.json";

// configure options for Drizzle
const drizzle = new Drizzle({
    contracts: [DOneMax],
    web3: {
        fallback: {
            type: "ws",
            url: "ws://127.0.0.1:9545",
        },
    },
});

// render the React app
ReactDOM.render(<App drizzle={drizzle} />,
                document.getElementById('root'));
