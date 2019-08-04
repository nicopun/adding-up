'use strict';
const fs = require('fs'); //fs: FileSystemを扱うモジュール
const readline = require('readline');
const rs = fs.ReadStream('./popu-pref.csv'); //Stream
const rl = readline.createInterface({ 'input': rs, 'output': {} });
const map = new Map(); // key: 都道府県 value: 集計データのオブジェクト

rl.on('line', (lineString) => {
    const columns = lineString.split(','); //lineString: 読み込んだ一行が文字列として入っている splitでカンマで区切って配列に
    const year = parseInt(columns[0]); // parseInt: 文字列を数値に変換する
    const prefecture = columns[2];
    const popu = parseInt(columns[7]);
    if (year === 2010 || year === 2015) {
        let value = map.get(prefecture);
        if (!value) { //undefined: falsyなとき
            value = {
                popu10: 0,
                popu15: 0,
                change: null
            };
        }
        if (year === 2010) {
            value.popu10 += popu;
        }
        if (year === 2015) {
            value.popu15 += popu;
        }
        map.set(prefecture, value);
    }
});
rl.resume(); //Streamに流し始める

rl.on('close', () => {
    for (let pair of map) { // for-of構文 キー(都道府県名)と値(集計オブジェクト、人口)の2要素の配列がpairに毎回代入される
        const value = pair[1];
        value.change = value.popu15 / value.popu10;
    }
    const rankingArray = Array.from(map).sort((pair1, pair2) => {
        /*Array.from(map): 連想配列を普通の配列に変換する
        sort(比較関数):並び替えのルールを指定
        比較関数: 2つの引数pair1,pair2を受けとって
                 pair1をpair2より前にしたいとき負の整数
                 pair2をpair1より前にしたいとき正の整数
                 そのままにしたいときは0を返す */
        return pair1[1].change - pair2[1].change;
    });
    const rankingStrings = rankingArray.map((pair, i) => {
        /*map関数:Array の要素それぞれに与えられた関数を適用 */
        return '第' + (i + 1) + '位: ' + pair[0] + ', 人口 ' + pair[1].popu10 + '人 =>' + pair[1].popu15 + '人, 変化率: ' + pair[1].change;
    });
    console.log(rankingStrings);
});