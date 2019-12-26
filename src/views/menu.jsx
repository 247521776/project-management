import { Menu, Dropdown, Icon, Modal, Form, Input, message } from "antd";
import React, { Component, PropTypes } from "react";
import $ from "jquery";
import "antd/dist/antd.css";
import { LoadingPage } from "./loading";

const style = {
    "margin-left": "10px"
};

export class MenuPage extends Component {
    constructor() {
        super(...arguments);

        this.props.onRef(this);
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

    addProject(type) {
        if (type === "add") {
            const projectDir = $("#projectDir").val();

            this.setState({
                visible: false,
                loading: true,
            });

            const msg = this.props.onCreate({ projectDir, type });
            if (msg) {
                this.onError(msg);
                this.setState({
                    visible: false,
                    loading: false,
                });
            }
    
            $(".anticon .anticon-close-circle .ant-input-clear-icon").click();
        }
        else if (type === "new") {
            const gitPath = $("#gitPath").val();
            const projectPath = $("#projectPath").val();
    
            this.setState({
                newVisible: false,
                loading: true,
            });

            const msg = this.props.onCreate({gitPath, type, projectPath});
            if (msg) {
                this.onError(msg);
                this.setState({
                    visible: false,
                    loading: false,
                });
            }
    
            $(".anticon .anticon-close-circle .ant-input-clear-icon").click();
        }
    }

    render() {
        const menu = (
            <Menu>
                <Menu.Item key="1" onClick={this.newShowModal.bind(this)}>添加新项目</Menu.Item>
                <Menu.Item key="0" onClick={this.showModal.bind(this)}>添加已有项目</Menu.Item>
            </Menu>
        );

        const formItemLayout = {
            labelCol: { span: 4 },
            wrapperCol: { span: 14 }
        };

        return (
            <div>
                {this.state.loading ? <LoadingPage /> : ""}
                <Dropdown overlay={menu} trigger={["click"]}>
                    <a className="ant-dropdown-link" href="#">
                        <Icon style={style} type="align-left" />
                    </a>
                </Dropdown>
                <Modal
                    visible={this.state.visible}
                    onOk={this.addProject.bind(this, "add")}
                    onCancel={this.hideModal.bind(this)}
                    okText="确认"
                    cancelText="取消"
                >
                    <Form.Item label="项目路径" {...formItemLayout}>
                        <Input allowClear={true} id="projectDir" placeholder="请输入项目路径"/>
                    </Form.Item>
                </Modal>
                <Modal
                    visible={this.state.newVisible}
                    onOk={this.addProject.bind(this, "new")}
                    onCancel={this.newHideModal.bind(this)}
                    okText="确认"
                    cancelText="取消"
                >
                    <Form.Item label="目录" {...formItemLayout}>
                        <Input allowClear={true} id="projectPath" placeholder="请输入目录"/>
                    </Form.Item>
                    <Form.Item label="git地址" {...formItemLayout}>
                        <Input allowClear={true} id="gitPath" placeholder="请输入git地址"/>
                    </Form.Item>
                </Modal>
            </div>
        );
    }
}

MenuPage.contextTypes = {
    store: PropTypes.object
};
