import * as actionType from "./actionType";

export function replyAdd(reply) {
    return {
        type: actionType.REPLY_ADD,
        reply
    };
}

export function replyUpdate(reply) {
    return {
        type: actionType.REPLY_UPDATE,
        reply
    };
}

export function replyDelete(reply) {
    return {
        type: actionType.REPLY_DELETE,
        reply
    };
}