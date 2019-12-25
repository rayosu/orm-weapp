import {User} from "./user";

(async function onLoad() {
    // 查询指定用户，闭包方式调用
    User.query({}, (err, users) => {
        console.log(err);
        console.log(users);
    });

    // 查询指定用户，支持Promise链式语法
    User.query({}).then((res) => {
        console.log(res.errMsg);
        console.log(res.data);
    }, (err) => {
        console.error(err);
    }).catch((ex) => {
        console.error(ex);
    });

    let user = new User({name: '亚瑟'});
    // 创建用户，Promise 链式语法
    user.save().then((res) => {
        console.log(res.errMsg);
        console.log(res._id);
    }, (err) => {
        console.error(err);
    }).catch((ex) => {
        console.error(ex);
    });

    // 更新用户信息，Promise await 方式调用
    user.name = '李白';
    let res = await user.update();
    console.log(res.errMsg);
    console.log(res.stats);
})();
