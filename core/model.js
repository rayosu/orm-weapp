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
        // 数据表字段信息 留空则保存全部
        this.$field = [];
        // 数据排除字段
        this.$except = [];
        // 只读字段
        this.$readonly = [];
        data = data || {};
        let e = Reflect.enumerate(data);
        for (let name of e) {
            if (!name.startsWith('$') && this.hasOwnProperty(name)) {
                try {
                    this[name] = data[name];
                }
                catch (e) {
                    console.warn(e.message);
                }
            }
        }
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
     * 获取单条数据
     * @param _id
     * @param callback
     */
    static get(_id, callback) {
        return __awaiter(this, void 0, void 0, function* () {
            let that = new this();
            console.log(`${that.$model}.get: ${_id}`);
            return yield new Promise((resolve) => {
                db.collection(that.$model).doc(_id).get({
                    success: (res) => {
                        let entity = new this(res.data);
                        if (callback)
                            callback(null, entity);
                        resolve({ data: entity });
                    },
                    fail: (err) => {
                        this.errToast(err);
                        if (callback)
                            callback(err, null);
                        resolve({ errMsg: err.errMsg });
                    }
                });
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
            return yield new Promise((resolve) => {
                db.collection(that.$model).where({}).get({
                    success: (res) => {
                        console.log(res);
                        let datas = res.data.map((o) => new this(o));
                        if (callback)
                            callback(null, datas);
                        resolve({ data: datas });
                    },
                    fail: (err) => {
                        this.errToast(err);
                        console.error('[数据库] [查询记录] 失败：', err);
                        if (callback)
                            callback(err, []);
                        resolve({ errMsg: err.errMsg });
                    }
                });
            });
        });
    }
    /**
     * 条件查询
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
     * 获取一条记录
     * @param callback
     */
    static one(callback) {
        return __awaiter(this, void 0, void 0, function* () {
            let that = new this();
            console.log(`${that.$model}.query`);
            return yield this.pageQuery({}, 1, 0, (err, datas) => {
                let data = (datas && datas.length) ? datas[0] : undefined;
                if (callback)
                    callback(err, data);
            });
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
            if (page_index >= 0 && page_size > 0) {
                console.log(`${that.$model}.pageQuery`);
                query = query.limit(page_size).skip(page_index * page_size);
            }
            return yield new Promise((resolve) => {
                query.get({
                    success: (res) => {
                        let datas = res.data.map((o) => new this(o));
                        if (callback)
                            callback(null, datas);
                        resolve({ data: datas });
                    },
                    fail: (err) => {
                        this.errToast(err);
                        if (callback)
                            callback(err, []);
                        resolve({ errMsg: err.errMsg });
                    }
                });
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
            if (callback) {
                return yield new Promise((resolve) => {
                    db.collection(that.$model).where(condition).count({
                        success: (res) => {
                            if (callback)
                                callback(null, res.total);
                            resolve(res);
                        },
                        fail: (err) => {
                            this.errToast(err);
                            if (callback)
                                callback(err, -1);
                            resolve({ errMsg: err.errMsg });
                        }
                    });
                });
            }
            return yield db.collection(that.$model).where(condition).count();
        });
    }
    /**
     * 保存或更新
     * @param callback
     */
    saveOrUpdate(callback) {
        return __awaiter(this, void 0, void 0, function* () {
            let res;
            if (this._id) {
                // @ts-ignore
                res = yield this.get(this._id);
                if (res.data) {
                    res = yield this.update((err, updated) => {
                        if (callback)
                            callback({ errMsg: err ? err.errMsg : undefined, _id: this._id, stats: { updated } });
                    });
                    return Promise.resolve(res);
                }
            }
            delete this._id;
            res = yield this.save((err, _id) => {
                if (callback)
                    callback({ errMsg: err ? err.errMsg : undefined, _id: _id, stats: { created: err ? 0 : 1 } });
            });
            let r = res;
            r.stats.created = 1;
            return Promise.resolve(r);
        });
    }
    /**
     * 保存
     * @param callback
     */
    save(callback) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log(`${this.$model}.save`);
            if (callback) {
                return yield new Promise((resolve) => {
                    db.collection(this.$model).add({
                        data: this.toJson('save'),
                        success: (res) => {
                            if (callback)
                                callback(null, res._id);
                            resolve(res);
                        },
                        fail: (err) => {
                            if (callback)
                                callback(err, null);
                            resolve({ errMsg: err.errMsg });
                        }
                    });
                });
            }
            return yield db.collection(this.$model).add({
                data: this.toJson('save')
            });
        });
    }
    /**
     * 更新数据
     * @param callback
     */
    update(callback) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log(`${this.$model}.update: ${this._id}`);
            console.assert(!this._id, `${this.$model}.update: _id 不能为空`);
            if (callback) {
                return yield new Promise((resolve) => {
                    db.collection(this.$model).doc(this._id).update({
                        data: this.toJson('update'),
                        success: (res) => {
                            if (res.stats.updated == 0)
                                res.errMsg = 'nothing updated';
                            if (callback)
                                callback(res, res.stats.updated);
                            resolve(res);
                        },
                        fail: (err) => {
                            if (callback)
                                callback(err, 0);
                            resolve({ errMsg: err.errMsg, stats: { updated: 0 } });
                        }
                    });
                });
            }
            else {
                return yield db.collection(this.$model).doc(this._id).update({
                    data: this.toJson('update')
                });
            }
        });
    }
    /**
     * 删除数据
     * @param callback
     */
    delete(callback) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log(`${this.$model}.update: ${this._id}`);
            console.assert(!this._id, '_id 不能为空');
            if (callback) {
                return yield new Promise((resolve) => {
                    db.collection(this.$model).doc(this._id).remove({
                        success: (res) => {
                            if (callback)
                                callback(null, res.stats.removed);
                            resolve(res);
                        },
                        fail: (err) => {
                            if (callback)
                                callback(err, 0);
                            resolve({ errMsg: err.errMsg, stats: { removed: 0 } });
                        }, complete: (res) => {
                            console.log(res);
                        }
                    });
                });
            }
            else {
                return yield db.collection(this.$model).doc(this._id).remove();
            }
        });
    }
    toJson(op) {
        let fieldNames = Object.getOwnPropertyNames(this);
        let data = {};
        fieldNames.forEach((fieldName) => {
            if (this.$field && this.$field.length && !this.$field.find(t => t == fieldName))
                return;
            if (this.$except && this.$except.length && this.$except.find(t => t == fieldName))
                return;
            if (op == 'update') {
                if (this.$readonly.find(t => t == fieldName)) {
                    return;
                }
            }
            let val = Reflect.get(this, fieldName);
            if (val && val instanceof Object && Reflect.has(val, 'toJson')) {
                data[fieldName] = val.toJson();
            }
            else if (typeof val == "string" || typeof val == "number" || typeof val == "boolean" || typeof val == "object") {
                if (!fieldName.startsWith('$') && !fieldName.startsWith('_'))
                    data[fieldName] = val;
            }
        });
        return data;
    }
}
