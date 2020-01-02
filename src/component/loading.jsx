import { Spin, Modal } from "antd";
import React, { Component } from "react";


const style = {
    width: "100%"
};

export class LoadingPage extends Component {
    render() {
        return (
            <Modal
                visible={true}
                centered={true}
                closable={false}
                okButtonProps={{ htmlType: "display: none;" }}
                cancelButtonProps={{ display: true }}
                footer={null}
            >
                <Spin style={style} tip="努力添加中..." />
            </Modal>
        );
    }
}
