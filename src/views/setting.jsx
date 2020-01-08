import { Table, Button, Icon, Form, Input, Modal, message } from 'antd';
import React, { Component, PropTypes } from "react";
import { LoadingPage } from "../component/loading";
import $ from "jquery";
import "../index.css";

const electron = window.require('electron');

const style = {
    "margin-left": "7px",
    "margin-right": "7px",
    "padding-top": "20px",
};

const tableStyle = {
    "margin-top": "4px",
}

const formItemLayout = {
    labelCol: { span: 4 },
    wrapperCol: { span: 14 }
};

const AddSettingForm = Form.create()(
    (props) => {
        const { visible, addSetting, hideModal, form } = props;
        const { getFieldDecorator } = form;
        return (
            <Modal
                visible={visible}
                onOk={addSetting}
                onCancel={hideModal}
                okText="确认"
                cancelText="取消"
            >
                <Form>
                    <Form.Item label="目录名称" {...formItemLayout}>
                        {getFieldDecorator('dirName', {
                            rules: [
                                {
                                    required: true,
                                    message: '请输入目录名称',
                                },
                            ]
                        })(
                            <Input allowClear={true} id="dirName" placeholder="请输入目录名称" />
                        )}
                    </Form.Item>
                    <Form.Item label="目录路径" {...formItemLayout}>
                        {getFieldDecorator('dirPath', {
                            rules: [
                                {
                                    required: true,
                                    message: '请输入目录路径',
                                },
                            ]
                        })(
                            <Input allowClear={true} id="dirPath" placeholder="请输入目录路径" />
                        )}
                    </Form.Item>
                </Form>
            </Modal>
        );
    }
);

export default class SettingPage extends Component {

    constructor(props) {
        super(props);

        this.showModal = this.showModal.bind(this);
        this.hideModal = this.hideModal.bind(this);
        this.onAddSetting = this.onAddSetting.bind(this);

        const settings = electron.ipcRenderer.sendSync("getSetting");

        this.state = {
            visible: false,
            loading: false,
            tipContent: "加载中",
            data: settings.workspaces
        }

        this.columns = [
            {
                title: '目录名称',
                dataIndex: 'dirName',
                width: "100px",
                key: 'dirName',
                align: "center"
            },
            {
                title: '目录路径',
                dataIndex: 'dirPath',
                align: "center",
                key: 'dirPath',
            },
            {
                title: '操作',
                key: 'action',
                width: "100px",
                align: "center",
                render: (text, record) => (
                    <div>
                        <Button style={{ "margin-bottom": "5px" }} type="primary">修改</Button>
                        <br />
                        <Button type="danger" onClick={this.onDeleteWorkspace.bind(this, record.dirPath)}>删除</Button>
                    </div>
                ),
            },
        ];
    }

    showModal = () => {
        this.setState({
            visible: true,
        });
    };

    hideModal = () => {
        this.setState({
            visible: false,
        });
    };

    onAddSetting() {
        const self = this;
        this.addForm.validateFields((errors) => {
            if (errors !== null) {
                return;
            }

            const dirName = $("#dirName").val();
            const dirPath = $("#dirPath").val();

            const data = { dirName, dirPath };
            const result = electron.ipcRenderer.sendSync("addWorkspace", data);

            if (result) {
                return message.error(result, 1.5);
            }

            self.addForm.resetFields();

            const workspaces = this.state.data;
            workspaces.unshift(data);

            self.setState({
                visible: false,
                data: workspaces
            });

            message.success("添加成功", 1.5);
        });
    }

    onDeleteWorkspace(dirPath) {
        electron.ipcRenderer.send("deleteWorkspace", dirPath);

        const workspaces = this.state.data;
        this.setState({
            data: workspaces.filter((workspace) => workspace.dirPath !== dirPath)
        });
    }

    render() {
        return (
            <div style={style}>
                {this.state.loading ? <LoadingPage tipContent={this.state.tipContent} /> : ""}
                <Icon type="plus-circle" onClick={this.showModal} theme="twoTone" />
                <Table
                    rowClassName={() => "table-row"}
                    deleteWorkspace={this.onDeleteWorkspace}
                    style={tableStyle}
                    bordered
                    columns={this.columns}
                    dataSource={this.state.data}
                />
                <AddSettingForm
                    ref={(form) => { this.addForm = form; }}
                    visible={this.state.visible}
                    addSetting={this.onAddSetting}
                    hideModal={this.hideModal}
                />
            </div>
        );
    }
}

SettingPage.contextTypes = {
    store: PropTypes.object
};