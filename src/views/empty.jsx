import { Empty } from "antd";
import React, { Component } from "react";
import { MenuPage } from "./menu";

const emptyStyle = {
    "padding-top": "50%"
};

export class EmptyPage extends Component {
    render() {

        return (
            <div>
                <MenuPage onCreate={this.props.onCreate} />
                <Empty style={emptyStyle} description={<span>暂无数据</span>} />
            </div>
        );
    }
}
