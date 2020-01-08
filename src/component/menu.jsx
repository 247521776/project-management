import { Menu, Dropdown, Icon, Modal, Form, Input, message, Select } from "antd";
import React, { Component, PropTypes } from "react";
import $ from "jquery";
import "antd/dist/antd.css";
import { LoadingPage } from "./loading";

const { Option } = Select;

const electron = window.require('electron');

const style = {
    "margin-left": "7px"
};

const formItemLayout = {
    labelCol: { span: 4 },
    wrapperCol: { span: 14 }
};

const AddProjectForm = Form.create()(
    (props) => {
        const { visible, addProject, hideModal, form } = props;
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
                    <Form.Item label="项目路径" {...formItemLayout}>
                        {getFieldDecorator('projectDir', {
                            rules: [
                                {
                                    required: true,
                                    message: '请输入项目路径',
                                },
                            ]
                        })(
                            <Input allowClear={true} id="projectDir" placeholder="请输入项目路径" />
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
                                    message: '请输入目录',
                                },
                            ]
                        })(
                            <Select
                                style={{ width: 120 }}
                                id="projectPath"
                            >
                                <Option value={"default_value"}>请选择目录</Option>
                                {
                                    workspaces.map((workspace) => {
                                        return (<Option value={workspace.dirPath}>{workspace.dirName}</Option>)
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
                            <Input allowClear={true} id="gitPath" placeholder="请输入git地址" />
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

            const projectDir = $("#projectDir").val();

            const msg = self.props.onCreate({ projectDir, type: "add" });
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

            const gitPath = $("#gitPath").val();
            const projectPath = $("#projectPath").val();

            if (projectPath === "default_value") {
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
