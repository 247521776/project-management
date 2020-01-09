import { Menu, Dropdown, Icon, Modal, Form, Input, message, Select, Tooltip } from "antd";
import React, { Component, PropTypes } from "react";
import "antd/dist/antd.css";
import { LoadingPage } from "./loading";
import * as path from "path";

const { Option } = Select;

const electron = window.require('electron');

const style = {
    "margin-left": "7px"
};

const selectDefault = "default_value";

const formItemLayout = {
    labelCol: { span: 4 },
    wrapperCol: { span: 14 }
};

const AddProjectForm = Form.create()(
    (props) => {
        const { visible, addProject, hideModal, form, workspaces, directories, onSelectChange } = props;
        const { getFieldDecorator } = form;
        return (
            <Modal
                visible={visible}
                onOk={addProject}
                onCancel={hideModal}
                okText="确认"
                cancelText="取消"
            >
                <Form>
                    <Form.Item label="目录" {...formItemLayout}>
                        {getFieldDecorator('workspace', {
                            initialValue: selectDefault,
                            rules: [
                                {
                                    required: true,
                                    message: '请选择目录',
                                },
                            ]
                        })(
                            <Select
                                style={{ width: 120 }}
                                onChange={onSelectChange}
                            >
                                <Option value={selectDefault}>请选择目录</Option>
                                {
                                    workspaces.map((workspace) => {
                                        return (<Option title={workspace.dirPath} value={workspace.dirPath}>
                                            {workspace.dirName}
                                        </Option>)
                                    })
                                }
                            </Select>
                        )}
                    </Form.Item>
                    <Form.Item label="项目" {...formItemLayout}>
                        {getFieldDecorator('projectDir', {
                            initialValue: selectDefault,
                            rules: [
                                {
                                    required: true,
                                    message: '请选择项目',
                                },
                            ]
                        })(
                            <Select
                                style={{ width: 120 }}
                            >
                                <Option value={selectDefault}>请选择项目</Option>
                                {
                                    directories.map((dirName) => {
                                        return (<Option title={dirName} value={dirName}>
                                            {dirName}
                                        </Option>)
                                    })
                                }
                            </Select>
                        )}
                    </Form.Item>
                </Form>
            </Modal>
        );
    }
);

const NewAddProjectForm = Form.create()(
    (props) => {
        const { visible, addProject, hideModal, form, workspaces } = props;
        const { getFieldDecorator } = form;

        return (
            <Modal
                visible={visible}
                onOk={addProject}
                onCancel={hideModal}
                okText="确认"
                cancelText="取消"
            >
                <Form>
                    <Form.Item label="目录" {...formItemLayout}>
                        {getFieldDecorator('projectPath', {
                            initialValue: "default_value",
                            rules: [
                                {
                                    required: true,
                                    message: '请选择目录',
                                },
                            ]
                        })(
                            <Select
                                style={{ width: 120 }}
                            >
                                <Option value={"default_value"}>请选择目录</Option>
                                {
                                    workspaces.map((workspace) => {
                                        return (<Option title={workspace.dirPath} value={workspace.dirPath}>
                                            {workspace.dirName}
                                        </Option>)
                                    })
                                }
                            </Select>
                        )}
                    </Form.Item>
                    <Form.Item label="git地址" {...formItemLayout}>
                        {getFieldDecorator('gitPath', {
                            rules: [
                                {
                                    required: true,
                                    message: '请输入git地址',
                                },
                            ]
                        })(
                            <Input allowClear={true} placeholder="请输入git地址" />
                        )}
                    </Form.Item>
                </Form>
            </Modal>
        );
    }
);

export class MenuPage extends Component {
    constructor() {
        super(...arguments);

        this.props.onRef(this);
        this.addProject = this.addProject.bind(this);
        this.newAddProject = this.newAddProject.bind(this);
        this.onSelectChange = this.onSelectChange.bind(this);

        const workspaces = electron.ipcRenderer.sendSync("getWorkspace");
        this.state.workspaces = workspaces;

        electron.ipcRenderer.on('workspace', (event, workspaces) => {
            this.setState({
                workspaces
            });
        });
    }
    state = {
        visible: false,
        newVisible: false,
        loading: false,
        directories: []
    };

    showModal = () => {
        this.setState({
            visible: true,
            menuClick: false,
        });
    };

    hideModal = () => {
        this.setState({
            visible: false,
            menuClick: false,
        });
    };

    newShowModal = () => {
        this.setState({
            newVisible: true,
            menuClick: false,
        });
    };

    newHideModal = () => {
        this.setState({
            newVisible: false,
            menuClick: false,
        });
    };

    onError(msg) {
        message.error(msg);
    }

    addProject() {
        const self = this;
        this.addForm.validateFields((errors, values) => {
            if (errors !== null) {
                return;
            }

            const projectDir = values.projectDir;
            const workspace = values.workspace;

            const msg = self.props.onCreate({ projectDir: path.resolve(workspace, projectDir), type: "add" });
            if (msg) {
                self.onError(msg);
                self.setState({
                    visible: false,
                    loading: false,
                    menuClick: false,
                });
            }
            else {
                self.addForm.resetFields();

                self.setState({
                    visible: false,
                    loading: true,
                    menuClick: false,
                });
            }
        });
    }

    newAddProject() {
        const self = this;
        this.newForm.validateFields((errors, values) => {
            if (errors !== null) {
                return;
            }

            const gitPath = values.gitPath;
            const projectPath = values.projectPath;

            if (projectPath === selectDefault) {
                self.onError("请选择目录");
            }

            const msg = self.props.onCreate({ gitPath, type: "new", projectPath });
            if (msg) {
                self.onError(msg);
                self.setState({
                    visible: false,
                    loading: false,
                    menuClick: false,
                });
            }
            else {
                self.newForm.resetFields();

                self.setState({
                    newVisible: false,
                    loading: true,
                    menuClick: false,
                });
            }
        });
    }

    onDropdownVisibleChange(visible) {
        if (visible) {
            this.setState({
                menuClick: true
            });
        }
        else {
            this.setState({
                menuClick: false
            });
        }
    }

    onSelectChange(dirPath) {
        if (dirPath === selectDefault) {
            return this.setState({
                directories: []
            });
        }

        const directories = electron.ipcRenderer.sendSync("getWorkspaceDirectories", dirPath);

        this.setState({
            directories
        });
    }

    render() {
        const menu = (
            <Menu>
                <Menu.Item key="0" onClick={this.newShowModal.bind(this)}>添加新项目</Menu.Item>
                <Menu.Item key="1" onClick={this.showModal.bind(this)}>添加已有项目</Menu.Item>
            </Menu>
        );

        return (
            <div>
                {this.state.loading ? <LoadingPage tipContent={"努力添加中..."} /> : ""}
                <Dropdown overlay={menu} onVisibleChange={this.onDropdownVisibleChange.bind(this)} trigger={["click"]}>
                    <a style={style} className="ant-dropdown-link" href="#">
                        {this.state.menuClick ? <Icon type="minus-square" theme="twoTone" /> : <Icon type="plus-square" theme="twoTone" />}
                    </a>
                </Dropdown>
                <AddProjectForm
                    ref={(form) => { this.addForm = form; }}
                    visible={this.state.visible}
                    addProject={this.addProject}
                    hideModal={this.hideModal}
                    workspaces={this.state.workspaces}
                    directories={this.state.directories}
                    onSelectChange={this.onSelectChange}
                />
                <NewAddProjectForm
                    ref={(form) => { this.newForm = form; }}
                    visible={this.state.newVisible}
                    addProject={this.newAddProject}
                    hideModal={this.newHideModal}
                    workspaces={this.state.workspaces}
                />
            </div>
        );
    }
}

MenuPage.contextTypes = {
    store: PropTypes.object
};
