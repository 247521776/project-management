import * as type from "../action/actionType";

export default (state= [], action) => {
    switch(action.type) {
        case type.REPLY_ADD:
            //TODO 添加
            return state;
        case type.REPLY_UPDATE:
            //TODO 修改
            return state;
        case type.REPLY_DELETE:
            //TODO 删除
            return state;
        default:
            return state;
    }
}