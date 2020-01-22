import { Card, Icon, Descriptions, Modal, message, Tooltip, Form, Select } from 'antd';
import React, { Component, PropTypes } from "react";
import "antd/dist/antd.css";
import { MenuPage } from "../component/menu";
import { EmptyPage } from "../component/empty";
import { StepPage } from "../component/step";
import * as path from "path";

const { confirm } = Modal;
const { Option } = Select;

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

const formItemLayout = {
    labelCol: { span: 4 },
    wrapperCol: { span: 14 }
};

const EditProject = Form.create()(
    (props) => {
        const { visible, editProject, hideModal, form, sourceId, sources } = props;
        const { getFieldDecorator } = form;
        return (
            <Modal
                visible={visible}
                onOk={editProject}
                onCancel={hideModal}
                okText="确认"
                cancelText="取消"
            >
                <Form>
                    <Form.Item label="依赖源" {...formItemLayout}>
                        {getFieldDecorator('sourceId', {
                            initialValue: sourceId,
                            rules: [
                                {
                                    required: true,
                                    message: '请选择依赖源',
                                },
                            ]
                        })(
                            <Select
                                style={{ width: 120 }}
                            >
                                {
                                    sources.map((source) => {
                                        return (<Option title={source.source} value={source.id}>
                                            {source.sourceName}
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

class HomePage extends Component {
    constructor() {
        super(...arguments);

        this.state = this.getOwnState();
        this.onCreate = this.onCreate.bind(this);
        this.onRef = this.onRef.bind(this);
        this.onEditProject = this.onEditProject.bind(this);

        this.state.data = {
            projects: [],
        };

        this.state.project = {};

        this.state.editSourceVisible = false;

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

        const sources = electron.ipcRenderer.sendSync("getSource");
        this.state.sources = sources;

        electron.ipcRenderer.on('source', (event, sources) => {
            this.setState({
                sources
            });
        });
    }

    getOwnState() {
        return this.context.store.getState();
    }

    onOpen(index) {
        electron.ipcRenderer.send("openProject", index);
    }

    hideModal = () => {
        this.setState({
            editSourceVisible: false,
        });
    };

    onShowEdit(project) {
        this.setState({
            editSourceVisible: true,
            project
        });
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

    onEditProject() {
        const self = this;
        this.editProjectForm.validateFields((errors, values) => {
            if (errors !== null) {
                return;
            }

            const sourceId = values.sourceId;

            const project = self.state.project;

            if (project.sourceId === sourceId) {
                return;
            }

            project.sourceId = sourceId;

            electron.ipcRenderer.send("editProject", project);

            message.success('修改成功', 1.5);

            self.setState({
                editSourceVisible: false,
            });
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
                    <MenuPage onRef={this.onRef} sources={this.state.sources} onCreate={this.onCreate} />
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
                                        <Tooltip title="编辑" arrowPointAtCenter>
                                            <Icon type="edit"
                                                theme="twoTone"
                                                style={iconStyle}
                                                index={index}
                                                onClick={this.onShowEdit.bind(this, project)}
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
                    <EditProject
                        ref={(form) => { this.editProjectForm = form; }}
                        visible={this.state.editSourceVisible}
                        editProject={this.onEditProject}
                        hideModal={this.hideModal}
                        sourceId={this.state.project.sourceId}
                        sources={this.state.sources}
                    />
                </div>
            );
        }
        else {
            return (
                <div>
                    <MenuPage onRef={this.onRef} sources={this.state.sources} onCreate={this.onCreate} />
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
