import { Table, Button, Icon, Form, Input, Modal, message, Tabs } from 'antd';
import React, { Component, PropTypes } from "react";
import { LoadingPage } from "../component/loading";
import "../index.css";

const { TabPane } = Tabs;
const { confirm } = Modal;

const workspaceType = "workspace";
const sourceType = "source";

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
        const { visible, addSetting, hideModal, form, workspace = {} } = props;
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
                            initialValue: workspace.dirName || "",
                            rules: [
                                {
                                    required: true,
                                    message: '请输入目录名称',
                                },
                            ]
                        })(
                            <Input allowClear={true} placeholder="请输入目录名称" />
                        )}
                    </Form.Item>
                    <Form.Item label="目录路径" {...formItemLayout}>
                        {getFieldDecorator('dirPath', {
                            initialValue: workspace.dirPath || "",
                            rules: [
                                {
                                    required: true,
                                    message: '请输入目录路径',
                                },
                            ]
                        })(
                            <Input allowClear={true} placeholder="请输入目录路径" />
                        )}
                    </Form.Item>
                </Form>
            </Modal>
        );
    }
);

const AddSourceForm = Form.create()(
    (props) => {
        const { visible, addSource, hideModal, form, source = {} } = props;
        const { getFieldDecorator } = form;
        return (
            <Modal
                visible={visible}
                onOk={addSource}
                onCancel={hideModal}
                okText="确认"
                cancelText="取消"
            >
                <Form>
                    <Form.Item label="别名" {...formItemLayout}>
                        {getFieldDecorator('sourceName', {
                            initialValue: source.sourceName || "",
                            rules: [
                                {
                                    required: true,
                                    message: '请输入别名',
                                },
                            ]
                        })(
                            <Input allowClear={true} placeholder="请输入别名" />
                        )}
                    </Form.Item>
                    <Form.Item label="依赖源" {...formItemLayout}>
                        {getFieldDecorator('source', {
                            initialValue: source.source || "",
                            rules: [
                                {
                                    required: true,
                                    message: '请输入依赖源',
                                },
                            ]
                        })(
                            <Input allowClear={true} placeholder="请输入依赖源" />
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

        const settings = electron.ipcRenderer.sendSync("getSetting");

        this.state = {
            visible: false,
            sourceVisible: false,
            loading: false,
            tipContent: "加载中",
            data: settings.workspaces,
            sources: settings.sources
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
                        <Button style={{ "margin-bottom": "5px" }} onClick={this.editShowModal.bind(this, workspaceType, record)} type="primary">修改</Button>
                        <br />
                        <Button type="danger" onClick={this.onDelete.bind(this, workspaceType, record.id)}>删除</Button>
                    </div>
                ),
            },
        ];

        this.sourceColumns = [
            {
                title: '别名',
                dataIndex: 'sourceName',
                width: "100px",
                key: 'sourceName',
                align: "center"
            },
            {
                title: '依赖源',
                dataIndex: 'source',
                align: "center",
                key: 'source',
            },
            {
                title: '操作',
                key: 'action',
                width: "100px",
                align: "center",
                render: (text, record) => (
                    <div>
                        <Button style={{ "margin-bottom": "5px" }} onClick={this.editShowModal.bind(this, sourceType, record)} type="primary">修改</Button>
                        <br />
                        <Button type="danger" onClick={this.onDelete.bind(this, sourceType, record.id)}>删除</Button>
                    </div>
                ),
            },
        ];
    }

    showModal = (type) => {
        if (type === workspaceType) {
            this.setState({
                visible: true,
            });
        }
        else if (type === sourceType) {
            this.setState({
                sourceVisible: true,
            });
        }
    };

    editShowModal = (type, data) => {
        if (type === workspaceType) {
            this.editForm.resetFields();

            this.setState({
                editVisible: true,
                workspace: data
            });
        }
        else if (type === sourceType) {
            this.editSourceForm.resetFields();

            this.setState({
                editSourceVisible: true,
                source: data
            });
        }
    };

    hideModal = (type) => {
        if (type === workspaceType) {
            this.setState({
                visible: false,
            });
        }
        else if (type === sourceType) {
            this.setState({
                sourceVisible: false,
            });
        }
    };

    editHideModal = (type) => {
        if (type === workspaceType) {
            this.setState({
                editVisible: true,
            });
        }
        else if (type === sourceType) {
            this.setState({
                editSourceVisible: true,
            });
        }
    };

    onAddSetting(type) {
        const self = this;

        if (type === workspaceType) {
            this.addForm.validateFields((errors, values) => {
                if (errors !== null) {
                    return;
                }
    
                const dirName = values.dirName;
                const dirPath = values.dirPath;
    
                const data = { dirName, dirPath };
                const result = electron.ipcRenderer.sendSync("addWorkspace", data);
    
                if (result.errorMessage) {
                    return message.error(result.errorMessage, 1.5);
                }
    
                self.addForm.resetFields();
    
                const workspaces = this.state.data;
                workspaces.unshift(result.data);
    
                self.setState({
                    visible: false,
                    data: workspaces
                });
    
                message.success("添加成功", 1.5);
            });
        }
        else if (type === sourceType) {
            this.addSourceForm.validateFields((errors, values) => {
                if (errors !== null) {
                    return;
                }
    
                const sourceName = values.sourceName;
                const source = values.source;
    
                const data = { sourceName, source };
                const result = electron.ipcRenderer.sendSync("addSource", data);
    
                if (result.errorMessage) {
                    return message.error(result.errorMessage, 1.5);
                }
    
                self.addSourceForm.resetFields();
    
                const sources = this.state.sources;
                sources.unshift(result.data);
    
                self.setState({
                    sourceVisible: false,
                    sources
                });
    
                message.success("添加成功", 1.5);
            });
        }
    }

    onDelete(type, id) {
        confirm({
            title: `确定要删除吗?`,
            okText: '确认',
            cancelText: '取消',
            onOk: () => {
                if (type === workspaceType) {
                    electron.ipcRenderer.send("deleteWorkspace", id);

                    const workspaces = this.state.data;
                    this.setState({
                        data: workspaces.filter((workspace) => workspace.id !== id)
                    });
                }
                else if (type === sourceType) {
                    electron.ipcRenderer.send("deleteSource", id);

                    const sources = this.state.sources;

                    this.setState({
                        sources: sources.filter((source) => source.id !== id)
                    });
                }

                message.success('删除成功', 1.5);
            }
        });
    }

    onSave(type) {
        const self = this;
        if (type === workspaceType) {
            this.editForm.validateFields((errors, values) => {
                if (errors !== null) {
                    return;
                }

                const dirName = values.dirName;
                const dirPath = values.dirPath;

                const data = { newData: { dirName, dirPath }, ...this.state.workspace };
                electron.ipcRenderer.send("editWorkspace", data);

                self.editForm.resetFields();

                const workspaces = this.state.data;

                for (const workspace of this.state.data) {
                    if (workspace.dirPath === this.state.workspace.dirPath) {
                        workspace.dirName = dirName;
                        workspace.dirPath = dirPath;
                    }
                }

                self.setState({
                    editVisible: false,
                    data: workspaces
                });

                message.success("修改成功", 1.5);
            });
        }
        else if (type === sourceType) {
            this.editSourceForm.validateFields((errors, values) => {
                if (errors !== null) {
                    return;
                }

                const sourceName = values.sourceName;
                const source = values.source;

                const data = { newData: { sourceName, source }, ...this.state.source };
                electron.ipcRenderer.send("editSource", data);

                self.editSourceForm.resetFields();

                const sources = this.state.sources;

                for (const _source of sources) {
                    if (_source.source === this.state.source.source) {
                        _source.sourceName = sourceName;
                        _source.source = source;
                    }
                }

                self.setState({
                    editSourceVisible: false,
                    sources
                });

                message.success("修改成功", 1.5);
            });
        }
    }

    render() {
        return (
            <div style={style}>
                <Tabs defaultActiveKey="1" type="card">
                    <TabPane tab={
                        <span>
                            <Icon type="folder" theme="filled" />
                            目录设置
                        </span>
                    } key="1">
                        {this.state.loading ? <LoadingPage tipContent={this.state.tipContent} /> : ""}
                        <Button type="primary"  onClick={this.showModal.bind(this, workspaceType)}>
                            <Icon type="plus-circle" theme="twoTone" />
                            添加
                        </Button>
                        <Table
                            rowClassName={() => "table-row"}
                            style={tableStyle}
                            bordered
                            columns={this.columns}
                            dataSource={this.state.data}
                        />
                        <AddSettingForm
                            ref={(form) => { this.addForm = form; }}
                            visible={this.state.visible}
                            addSetting={this.onAddSetting.bind(this, workspaceType)}
                            hideModal={this.hideModal.bind(this, workspaceType)}
                        />
                        <AddSettingForm
                            ref={(form) => { this.editForm = form; }}
                            visible={this.state.editVisible}
                            addSetting={this.onSave.bind(this, workspaceType)}
                            hideModal={this.editHideModal.bind(this, workspaceType)}
                            workspace={this.state.workspace}
                        />
                    </TabPane>
                    <TabPane tab={
                        <span>
                            <Icon type="compass" theme="filled" />
                            依赖源设置
                        </span>
                    } key="2">
                        {this.state.loading ? <LoadingPage tipContent={this.state.tipContent} /> : ""}
                        <Button type="primary"  onClick={this.showModal.bind(this, sourceType)}>
                            <Icon type="plus-circle" theme="twoTone" />
                            添加
                        </Button>
                        <Table
                            rowClassName={() => "table-row"}
                            style={tableStyle}
                            bordered
                            columns={this.sourceColumns}
                            dataSource={this.state.sources}
                        />
                        <AddSourceForm
                            ref={(form) => { this.addSourceForm = form; }}
                            visible={this.state.sourceVisible}
                            addSource={this.onAddSetting.bind(this, sourceType)}
                            hideModal={this.hideModal.bind(this, sourceType)}
                        />
                        <AddSourceForm
                            ref={(form) => { this.editSourceForm = form; }}
                            visible={this.state.editSourceVisible}
                            addSource={this.onSave.bind(this, sourceType)}
                            hideModal={this.editHideModal.bind(this, sourceType)}
                            source={this.state.source}
                        />
                    </TabPane>
                </Tabs>
            </div>
        );
    }
}

SettingPage.contextTypes = {
    store: PropTypes.object
};
