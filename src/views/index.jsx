import { Card, Icon, Descriptions, Modal, message, Tooltip } from 'antd';
import React, { Component, PropTypes } from "react";
import "antd/dist/antd.css";
import { MenuPage } from "../component/menu";
import { EmptyPage } from "../component/empty";
import { StepPage } from "../component/step";
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
        this.onRef = this.onRef.bind(this);

        this.state.data = {
            projects: [],
        };

        electron.ipcRenderer.on('data', (event, message) => {
            this.setState({
                data: message
            });
        });

        electron.ipcRenderer.on('loaded', (event, result) => {
            message.success('添加成功', 1.5);

            this.setState({
                data: result
            });

            this.menuPage.setState({
                visible: false,
                newVisible: false,
                loading: false,
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

                message.success('删除成功', 1.5);
            }
        });
    }

    onRef(ref) {
        this.menuPage = ref;
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

    onDownloadDepend(dir) {
        electron.ipcRenderer.send("downloadDepend", dir);
    }

    render() {
        const projects = this.state.data.projects;

        if (projects.length > 0) {
            return (
                <div>
                    <MenuPage onRef={this.onRef} onCreate={this.onCreate} />
                    <StepPage />
                    {
                        projects.map((project, index) => {
                            return (
                                <Card
                                    style={cardStyle}
                                    actions={[
                                        <Tooltip title="使用vscode打开项目" arrowPointAtCenter>
                                            <Icon
                                                style={iconStyle}
                                                index={index}
                                                onClick={this.onOpen.bind(this, index)}
                                                type="folder-open"
                                                theme="twoTone"
                                                twoToneColor="#4abfaf"
                                            />
                                        </Tooltip>,
                                        <Tooltip title="下载项目依赖" arrowPointAtCenter>
                                            <Icon
                                                style={iconStyle}
                                                index={index}
                                                onClick={this.onDownloadDepend.bind(this, project.dir)}
                                                type="download"
                                            />
                                        </Tooltip>,
                                        <Tooltip title="从本地删除该项目" arrowPointAtCenter>
                                            <Icon
                                                style={iconStyle}
                                                index={index}
                                                onClick={this.onDelete.bind(this, index)}
                                                type="delete"
                                                theme="twoTone"
                                                twoToneColor="#ff4c4c"
                                            />
                                        </Tooltip>
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
                <div>
                    <MenuPage onRef={this.onRef} onCreate={this.onCreate} />
                    <EmptyPage onRef={this.onRef} onCreate={this.onCreate} />
                </div>
            );
        }
    }
}

HomePage.contextTypes = {
    store: PropTypes.object
};

export default HomePage;
