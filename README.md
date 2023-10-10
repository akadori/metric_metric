# rqrc

rqrc は *r*e*q*ire time *r*e*c*order の略です。
commonjs の 各モジュールの require に何秒要するかを計測し、ビジュアライズします。

## 使い方

```sh
$ npm install -g rqrc
$ rqrc -w 800 -h 960 -o out/file.html -t thresholdms entry/file/path.js
```

## 免責事項
動くことは確かめていますが、実験的なものです。
ご使用は自己責任でお願いします。