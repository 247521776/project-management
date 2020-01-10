import { Empty } from "antd";
import React, { Component } from "react";

const emptyStyle = {
    "padding-top": "50%"
};

export class EmptyPage extends Component {
    render() {

        return (
            <Empty style={emptyStyle} description={<span>暂无数据</span>} />
        );
    }
}
