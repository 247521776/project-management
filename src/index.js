import React from "react";
import ReactDOM from "react-dom";
import { Switch, Route, HashRouter as Router } from "react-router-dom";
import HomePage from "./views";
import SettingPage from "./views/setting";
import store from "./store";
import Provider from "./Provider";

ReactDOM.render(
    <Router basename="/#">
        <div>
            <Switch>
                <Route path="/homePage">
                    <Provider store={store}>
                        <HomePage />
                    </Provider>
                </Route>
                <Route path="/settingPage">
                    <Provider store={store}>
                        <SettingPage />
                    </Provider>
                </Route>
            </Switch>
        </div>
    </Router>,
    document.getElementById("root")
);
