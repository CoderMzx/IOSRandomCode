function RandomString(length, option) {
    if(!length) length = 8;
    let numbers = '0123456789'
    let letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'
    let specials = '!$%^&*()_+|~-=`{}[]:;<>?,./';
    let opts = {
        numeric: option && option.numeric,
        letters: option && option.letters || true,
        special: option && option.special,
        exclude: option == null ? [] : option.exclude == null ? [] : option.exclude
    }

    var chars = '';
    if (opts.numeric) { chars += numbers; }
    if (opts.letters) { chars += letters; }
    if (opts.special) { chars += specials; }
    for (var i = 0; i <= opts.exclude.length; i++) {
        chars = chars.replace(opts.exclude[i], "");
    }

    let rn
    let rnd = ''
    let randomChars = chars
    for (let i = 1; i <= length; i++) {
        rnd += randomChars.substring(rn = Math.floor(Math.random() * randomChars.length), rn + 1);
    }
    return rnd;
}

const fs = require("fs")
let clazzDic = []
// 已经生成的类,防止重复生成
let nameCreated = []
// 最小方法数
var minFuncNum = 1;
// 最大方法数
var maxFuncNum = 50;

let lastClazz = null;
let lastFuncIdx = 0;

/**
 * 生成指定方法
 * @param clazz 
 * @param i 
 */
function makeFunc(clazz, i) {
    // 如果是第一个类的话,那么不进行基础调用
    let ret = RandomString((Math.random()*32+10)>>0);
    let funcName = RandomString((Math.random()*8+8)>>0)
    clazz.funcs.push(funcName)
    let lastClazz = clazzDic[clazzDic.length - 1]
    let funcStr = ""
    let lastFunc = lastClazz ? lastClazz.funcs[i] : null
    if (lastClazz == null) {
        clazz.lastClazzName = null;
        funcStr = `
+ (NSString *) ${funcName}{
    ${clazz.staticVar} = @"${RandomString((Math.random()*50+10)>>0)}";
    return @"${ret}";
}
        `
    } else {
        clazz.lastClazzName = lastClazz.className;
        funcStr = `
+ (NSString *) ${funcName} {
    ${lastFunc == null ? `${clazz.staticVar} = @"${RandomString((Math.random()*50+10)>>0)}";` : `${clazz.staticVar} = [${lastClazz.className} ${lastFunc}];`}
    return @"${ret}";
}
        `
    }
    clazz.funcStr.push(funcStr)
}

function makeClazz(clazz) {
    let funcCount = Math.floor(Math.random() * (maxFuncNum - minFuncNum + 1)) + minFuncNum;
    for (let i = 0; i < funcCount; i++) {
        makeFunc(clazz, i)
    }
    lastClazz = clazz
    clazzDic.push(clazz)
}

function createClazz(count, mainClazzName) {
    for (let i = 0; i < count; i++) {
        let clazzName = RandomString((Math.random()*16+10)>>0)
        if (i == count - 1) {
            clazzName = mainClazzName
        }
        if (nameCreated.indexOf(clazzName) > -1) {
            i--;
            continue;
        }
        nameCreated.push(clazzName)
        makeClazz({
            className: clazzName,
            staticVar: RandomString((Math.random()*16+2)>>0),
            funcs: [],
            lastClazzName: "",
            funcStr: []
        })
    }
}

function writeHeadFile(outPath) {
    for (let i = 0; i < clazzDic.length; i++) {
        let clazz = clazzDic[i]
        let head = `
#import <Foundation/Foundation.h>
@interface ${clazz.className} : NSObject`
        for (let t = 0; t < clazz.funcs.length; t++) {
            head += `
+ (NSString *) ${clazz.funcs[t]};`
        }

        head +=
            `
@end`
        fs.writeFileSync(outPath + `${clazz.className}.h`, head)
    }

}

function writeSourceFile(outPath) {
    for (let i = 0; i < clazzDic.length; i++) {
        let clazz = clazzDic[i]
        let source = `
#import <Foundation/Foundation.h>
#import "${clazz.className}.h"
${clazz.lastClazzName == null ? "" : `#import "${clazz.lastClazzName}.h"`}
@implementation ${clazz.className};
static NSString * ${clazz.staticVar};
`
        for (let t = 0; t < clazz.funcs.length; t++) {
            source += clazz.funcStr[t]
        }

        source +=
            `
@end`
        fs.writeFileSync(outPath + `${clazz.className}.mm`, source)
    }
}

maxFuncNum = 30
minFuncNum = 10

createClazz(200, "TZLCode")
writeHeadFile("./out/")
writeSourceFile("./out/")