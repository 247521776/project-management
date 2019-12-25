import { Empty, Card, Icon, Descriptions } from 'antd';
import React, { Component, PropTypes } from "react";
import "antd/dist/antd.css";

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

const emptyStyle = {
    "padding-top": "50%"
};

class HomePage extends Component {
    constructor() {
        super(...arguments);

        this.state = this.getOwnState();
        this.state.data = {
            dir: "",
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
        this.state.data.projects.splice(index, 1);
        this.setState({
            data: this.state.data
        });

        electron.ipcRenderer.send("deleteProject", index);
    }

    render() {
        const projects = this.state.data.projects;
        
        if (projects.length > 0) {
            return (
                <div>
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
                <div>
                    <Empty style={emptyStyle} description={
                        <span>
                            暂无数据
                        </span>
                    } />
                </div>
            );
        }
    }
}

HomePage.contextTypes = {
    store: PropTypes.object
};

export default HomePage;