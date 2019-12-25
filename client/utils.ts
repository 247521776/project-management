import * as fs from "fs";

export function fileExistAndNotExistCreate(path, defaultData) {
    const isExist = fs.existsSync(path);

    if (!isExist) {
        fs.writeFileSync(path, defaultData);
    }
}