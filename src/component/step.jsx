import { Steps, Modal, Icon, Button } from "antd";
import React, { Component } from "react";

const { Step } = Steps;

const electron = window.require('electron');

export class StepPage extends Component {
    constructor(props) {
        super(props);

        this.state = {
            visible: false,
            current: 0,
            status: "process"
        }

        electron.ipcRenderer.on('downloadDepend-setting', (event) => {
            this.setState({
                visible: true
            });
        });

        electron.ipcRenderer.on('downloadDepend', (event) => {
            this.setState({
                current: 1
            });
        });

        electron.ipcRenderer.on('downloadDepend-error', (event) => {
            this.setState({
                status: "error"
            });
        });

        electron.ipcRenderer.on('downloadDepend-done', (event, current) => {
            this.setState({
                current
            });

            const timeout = setTimeout(() => {
                this.setState({
                    current: 0,
                    visible: false
                });

                clearTimeout(timeout);
            }, 1500);
        });
    }

    onCancel() {
        electron.ipcRenderer.send("downloadDepend-cancel");
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
