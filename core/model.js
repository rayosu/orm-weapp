var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const db = wx.cloud.database();
export class Model {
    constructor(data) {
        this.$model = 'NotSet';
    }
    static errToast(err) {
        if (getApp().globalData.platform == 'devtools') {
            wx.showToast({
                icon: 'none',
                title: err.errMsg
            });
        }
    }
    /**
     * 获取数据
     * @param _id
     * @param callback
     */
    static get(_id, callback) {
        return __awaiter(this, void 0, void 0, function* () {
            let that = new this();
            console.log(`${that.$model}.get: ${_id}`);
            return yield db.collection(that.$model).doc(_id).get({
                success: (res) => {
                    let entity = new this(res.data);
                    if (callback)
                        callback(null, entity);
                },
                fail: (err) => {
                    this.errToast(err);
                    if (callback)
                        callback(err, null);
                }
            });
        });
    }
    /**
     * 数据库查询所有
     * @param params
     * @param callback
     */
    static all(callback) {
        return __awaiter(this, void 0, void 0, function* () {
            let that = new this();
            console.log(`${that.$model}.all`);
            // 查询当前用户所有的 DeviceName
            return yield db.collection(that.$model).where({}).get({
                success: (res) => {
                    let datas = res.data.map((o) => new this(o));
                    if (callback)
                        callback(null, datas);
                },
                fail: (err) => {
                    this.errToast(err);
                    console.error('[数据库] [查询记录] 失败：', err);
                    if (callback)
                        callback(err, []);
                }
            });
        });
    }
    /**
     * 条件查询数据库
     * @param condition
     * @param callback
     */
    static query(condition, callback) {
        return __awaiter(this, void 0, void 0, function* () {
            let that = new this();
            console.log(`${that.$model}.query`);
            return yield this.pageQuery(condition, -1, -1, callback);
        });
    }
    /**
     * 分页获取数据
     * @param condition 查询条件
     * @param page_size 每页数据条数
     * @param page_index 查询第几页，从0开始
     * @param callback
     */
    static pageQuery(condition, page_size, page_index, callback) {
        return __awaiter(this, void 0, void 0, function* () {
            let that = new this();
            let query = db.collection(that.$model).where(condition);
            if (page_index >= 0 && page_size >= 0) {
                console.log(`${that.$model}.pageQuery`);
                query = query.limit(page_size).skip(page_size * page_size);
            }
            return yield query.get({
                success: (res) => {
                    let datas = res.data.map((o) => new this(o));
                    if (callback)
                        callback(null, datas);
                },
                fail: (err) => {
                    this.errToast(err);
                    if (callback)
                        callback(err, []);
                }
            });
        });
    }
    /**
     * 计算符合查询条件的结果数
     * @param condition
     * @param callback
     */
    static count(condition, callback) {
        return __awaiter(this, void 0, void 0, function* () {
            let that = new this();
            console.log(`${that.$model}.count`);
            return yield db.collection(that.$model).where(condition).count({
                success: (res) => {
                    if (callback)
                        callback(null, res.total);
                },
                fail: (err) => {
                    this.errToast(err);
                    if (callback)
                        callback(err, -1);
                }
            });
        });
    }
    /**
     * 插入设备到数据库
     * @param callback
     */
    save(callback) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log(`${this.$model}.save`);
            return yield db.collection(this.$model).add({
                data: this.toJson(),
                success: (res) => {
                    if (callback)
                        callback(null, res._id);
                },
                fail: (err) => {
                    if (callback)
                        callback(err, null);
                }
            });
        });
    }
    /**
     *更新数据
     * @param callback
     */
    update(callback) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log(`${this.$model}.update: ${this._id}`);
            return yield db.collection(this.$model).doc(this._id).update({
                data: this.toJson(),
                success: (res) => {
                    if (callback)
                        callback(null, res.stats.updated);
                },
                fail: (err) => {
                    if (callback)
                        callback(err, 0);
                }, complete: (res) => {
                    console.log(res);
                }
            });
        });
    }
    toJson() {
        let fieldNames = Object.getOwnPropertyNames(this);
        let data = {};
        fieldNames.forEach((fieldName) => {
            let val = Reflect.get(this, fieldName);
            if (typeof val == "string" || typeof val == "number" || typeof val == "boolean" || typeof val == "object") {
                if (fieldName != '_id' && fieldName != '_openid' && fieldName != '$model')
                    data[fieldName] = val;
            }
            else if (val && val instanceof Object && Reflect.has(val, 'toJson')) {
                val = val.toJson();
                data[fieldName] = val;
            }
        });
        return data;
    }
}
