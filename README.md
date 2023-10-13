# rqrc

rqrc stands for *r*e*q*ire time *r*e*c*order.
It measures and visualizes how many seconds it takes to require each module of commonjs.

## Usage

```sh
$ npm install -g rqrc
$ rqrc -w 800 -h 960 -o out/file/path.html -t threshold_ms entry/file/path.js
```

## Example

```sh
$ node dist/cli.js ./demo/main.js -o out.html -w 960 -h 500 && open out.html
$ # you'll see the following image
```

![example](https://raw.githubusercontent.com/akadori/rqrc/main/example.png)