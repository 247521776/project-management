import { Card, Icon, Descriptions, Modal, message } from 'antd';
import React, { Component, PropTypes } from "react";
import "antd/dist/antd.css";
import { MenuPage } from "./menu";
import { EmptyPage } from "./empty";
import * as path from "path";
const { confirm } = Modal;

const electron = window.require('electron');

const cardStyle = {
    "width": 300,
    "margin-left": "5px",
    "margin-top": "5px",
    "background-color": "#f1ae52"
};

const iconStyle = {
    "-webkit-app-region": "no-drag"
};

class HomePage extends Component {
    constructor() {
        super(...arguments);

        this.state = this.getOwnState();
        this.onCreate = this.onCreate.bind(this);
        this.state.data = {
            projects: []
        };

        electron.ipcRenderer.on('data', (event, message) => {
            this.setState({
                data: message
            });
        });
    }

    getOwnState() {
        return this.context.store.getState();
    }

    onOpen(index) {
        electron.ipcRenderer.send("openProject", index);
    }

    onDelete(index) {
        confirm({
            title: `确定要删除吗?`,
            okText: '确认',
            cancelText: '取消',
            onOk: () => {
                this.state.data.projects.splice(index, 1);
                this.setState({
                    data: this.state.data
                });

                electron.ipcRenderer.send("deleteProject", index);

                message.success('删除成功');
            }
        });
    }

    onCreate(data) {
        let { projectDir, type, projectPath, gitPath } = data;
        const projects = this.state.data.projects;

        if (type === "new") {
            const splitResult = gitPath.split("/");
            const projectName = splitResult[splitResult.length - 1].split(".")[0];
            projectDir = path.resolve(projectPath, projectName);
        }

        if (!projectDir) {
            return "无效项目";
        }

        for (const project of projects) {
            if (project.dir === projectDir) {
                return "项目已存在";
            }
        }

        electron.ipcRenderer.send("addProject", data);
    }

    render() {
        const projects = this.state.data.projects;
        
        if (projects.length > 0) {
            return (
                <div>
                    <MenuPage onCreate={this.onCreate} />
                    {
                        projects.map((project, index) => {
                            return (
                                <Card
                                    style={ cardStyle }
                                    actions={[
                                        <Icon
                                            style={iconStyle}
                                            index={index}
                                            onClick={this.onOpen.bind(this, index)}
                                            type="folder-open"
                                            theme="twoTone"
                                            twoToneColor="#4abfaf"
                                        />,
                                        <Icon
                                            style={iconStyle}
                                            index={index}
                                            onClick={this.onDelete.bind(this, index)}
                                            type="delete"
                                            theme="twoTone"
                                            twoToneColor="#ff4c4c"
                                        />
                                    ]}
                                >
                                    <Descriptions title={project.name}>
                                        <Descriptions.Item label="简介">{project.description || "无"}</Descriptions.Item>
                                        <Descriptions.Item label="版本">{project.version}</Descriptions.Item>
                                    </Descriptions>
                                </Card>
                            )
                        })
                    }
                </div>
            );
        }
        else {
            return (
                <EmptyPage onCreate={this.onCreate} />
            );
        }
    }
}

HomePage.contextTypes = {
    store: PropTypes.object
};

export default HomePage;
