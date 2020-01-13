import { Steps, Modal, Icon, Button } from "antd";
import React, { Component } from "react";

const { Step } = Steps;

const electron = window.require('electron');

const stateDefault = {
    visible: false,
    current: 0,
    status: "process"
};

export class StepPage extends Component {
    constructor(props) {
        super(props);

        this.onCancel = this.onCancel.bind(this);

        this.state = stateDefault;

        electron.ipcRenderer.on('downloadDepend-setting', () => {
            this.setState({
                visible: true
            });
        });

        electron.ipcRenderer.on('downloadDepend', () => {
            this.setState({
                current: 1
            });
        });

        electron.ipcRenderer.on('downloadDepend-error', () => {
            this.setState({
                status: "error"
            });
        });

        electron.ipcRenderer.on('downloadDepend-done', () => {
            this.setState({
                current: 2
            });

            const timeout = setTimeout(() => {
                this.setState(stateDefault);

                clearTimeout(timeout);
            }, 1500);
        });
    }

    onCancel() {
        electron.ipcRenderer.send("downloadDepend-cancel");

        this.setState(stateDefault);
    }

    render() {
        return (
            <Modal
                visible={this.state.visible}
                centered={true}
                closable={false}
                okButtonProps={{ htmlType: "display: none;" }}
                cancelButtonProps={{ display: true }}
                footer={<Button type="primary" onClick={this.onCancel}>取消</Button>}
            >
                <Steps direction="vertical" current={this.state.current} status={this.state.status}>
                    <Step title="设置仓库源" description="仓库源：https://registry.npmjs.org/" icon={this.state.current !== 0 ? <Icon type="setting" /> : <Icon type="loading" />} />
                    <Step title="下载依赖" icon={this.state.current !== 1 ? <Icon type="download" /> : <Icon type="loading" />} />
                    <Step title="完成" icon={<Icon type="smile-o" />} />
                </Steps>
            </Modal>
        );
    }
}
