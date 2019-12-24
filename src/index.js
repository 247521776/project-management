import React from 'react';
import ReactDOM from 'react-dom';
import App from './views';
import store from "./store";
import Provider from "./Provider";


ReactDOM.render(
    <Provider store={store}>
        <App />
    </Provider>,
    document.getElementById('root')
);
