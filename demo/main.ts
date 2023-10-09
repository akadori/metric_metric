import { bye } from "./bye";
console.log("hello ;");
console.log(bye);
const start = new Date();
while (new Date().getTime() - start.getTime() < 1000) {
    // do nothing
}
console.log("end");