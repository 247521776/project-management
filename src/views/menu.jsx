import { Menu, Dropdown, Icon, Modal, Form, Input, message } from "antd";
import React, { Component, PropTypes } from "react";
import $ from "jquery";
import "antd/dist/antd.css";
import { LoadingPage } from "./loading";

const style = {
    "margin-left": "10px"
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
                        {getFieldDecorator('projectDir', {})(
                            <Input allowClear={true} id="projectDir" placeholder="请输入项目路径"/>
                        )}
                    </Form.Item>
                </Form>
            </Modal>
        );
    }
);

const NewAddProjectForm = Form.create()(
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
                    <Form.Item label="目录" {...formItemLayout}>
                        {getFieldDecorator('projectPath', {})(
                            <Input allowClear={true} id="projectPath" placeholder="请输入目录"/>
                        )}
                    </Form.Item>
                    <Form.Item label="git地址" {...formItemLayout}>
                        {getFieldDecorator('gitPath', {})(
                            <Input allowClear={true} id="gitPath" placeholder="请输入git地址"/>
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
    }
    state = { 
        visible: false,
        newVisible: false,
        loading: false,
    };

    showModal = () => {
        this.setState({
            visible: true
        });
    };

    hideModal = () => {
        this.setState({
            visible: false
        });
    };

    newShowModal = () => {
        this.setState({
            newVisible: true
        });
    };

    newHideModal = () => {
        this.setState({
            newVisible: false
        });
    };

    onError(msg) {
        message.error(msg);
    }

    addProject() {
        const projectDir = $("#projectDir").val();

        const msg = this.props.onCreate({ projectDir, type: "add" });
        if (msg) {
            this.onError(msg);
            this.setState({
                visible: false,
                loading: false,
            });
        }
        else {
            this.addForm.resetFields();

            this.setState({
                visible: false,
                loading: true,
            });
        }
    }

    newAddProject() {
        const gitPath = $("#gitPath").val();
        const projectPath = $("#projectPath").val();

        const msg = this.props.onCreate({gitPath, type: "new", projectPath});
        if (msg) {
            this.onError(msg);
            this.setState({
                visible: false,
                loading: false,
            });
        }
        else {
            this.newForm.resetFields();

            this.setState({
                newVisible: false,
                loading: true,
            });
        }
    }

    render() {
        const menu = (
            <Menu>
                <Menu.Item key="1" onClick={this.newShowModal.bind(this)}>添加新项目</Menu.Item>
                <Menu.Item key="0" onClick={this.showModal.bind(this)}>添加已有项目</Menu.Item>
            </Menu>
        );

        return (
            <div>
                {this.state.loading ? <LoadingPage /> : ""}
                <Dropdown overlay={menu} trigger={["click"]}>
                    <a className="ant-dropdown-link" href="#">
                        <Icon style={style} type="align-left" />
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
                />
            </div>
        );
    }
}

MenuPage.contextTypes = {
    store: PropTypes.object
};
