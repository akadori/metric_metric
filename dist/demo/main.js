"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const bye_1 = require("./bye");
console.log("hello ;");
console.log(bye_1.bye);
const start = new Date();
while (new Date().getTime() - start.getTime() < 20) {
    // do nothing
}
console.log("end");
