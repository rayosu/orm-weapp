var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { User } from "./user";
(function onLoad() {
    return __awaiter(this, void 0, void 0, function* () {
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
        let user = new User({ name: '亚瑟' });
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
        let res = yield user.update();
        console.log(res.errMsg);
        console.log(res.stats);
    });
})();
