import { bye } from "./bye";
console.log("hello ;");
console.log(bye);
const start = new Date();
while (new Date().getTime() - start.getTime() < 20) {
    // do nothing
}
console.log("end");