import { Table, Divider, Icon, Form, Input, Modal, message } from 'antd';
import React, { Component, PropTypes } from "react";
import LoadingPage from "../component/loading";
import * as fs from "fs";

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

const columns = [
    {
        title: '目录名称',
        dataIndex: 'dirName',
        width: "100px",
        key: 'dirName',
        render: text => <a>{text}</a>,
    },
    {
        title: '目录路径',
        dataIndex: 'dirPath',
        key: 'dirPath',
    },
    {
        title: '操作',
        key: 'action',
        width: "100px",
        render: (text, record) => (
            <span>
                <a>Invite {record.name}</a>
                <Divider type="vertical" />
                <a>Delete</a>
            </span>
        ),
    },
];

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

        electron.ipcRenderer.send("getSetting");
    }

    state = {
        visible: false,
        loading: true,
        tipContent: "加载中",
        data: []
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
            const isExistDir = fs.existsSync(dirPath);

            if (!isExistDir) {
                return message.error("目录不存在", 1.5);
            }

            const data = { dirName, dirPath };
            electron.ipcRenderer.send("addSetting", data);
            self.addForm.resetFields();

            self.setState({
                visible: false,
                data: this.state.data.push(data)
            });

            message.success("添加成功", 1.5);
        });
    }

    render() {
        return (
            <div style={style}>
                {this.state.loading ? <LoadingPage tipContent={this.state.tipContent} /> : ""}
                <Icon type="plus-circle" onClick={this.showModal} theme="twoTone" />
                <Table style={tableStyle} bordered columns={columns} dataSource={this.state.data} />
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
