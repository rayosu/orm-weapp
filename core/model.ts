import IUpdateResult = DB.IUpdateResult;
import IQueryResult = DB.IQueryResult;
import IAddResult = DB.IAddResult;
import IQuerySingleResult = DB.IQuerySingleResult;
import IQueryCondition = DB.IQueryCondition;
import ICountResult = DB.ICountResult;
import DocumentId = DB.DocumentId;
import IRemoveResult = DB.IRemoveResult;

const db = wx.cloud.database();

interface TQueryResult<T> extends IAPISuccessParam {
    data: T[]
}

interface TQuerySingleResult<T> extends IAPISuccessParam {
    data: T
}

export abstract class Model {
    protected $model = 'NotSet';
    // 数据表字段信息 留空则保存全部
    protected $field = [];
    // 数据排除字段
    protected $except = [];
    // 只读字段
    protected $readonly = [];

    public _id: DocumentId;

    protected constructor(data: any) {
    }

    private static errToast(err: IAPIError) {
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
    static async get<T>(_id: string, callback?: (err: IAPIError | null, entity: T | null) => void): Promise<TQuerySingleResult<T>> {
        let that = new (this as any)();
        console.log(`${that.$model}.get: ${_id}`);
        return await new Promise<TQuerySingleResult<T>>((resolve) => {
            db.collection(that.$model).doc(_id).get({
                success: (res: IQuerySingleResult) => {
                    let entity = new (this as any)(res.data);
                    if (callback) callback(null, entity);
                    resolve({data: entity} as TQuerySingleResult<T>);
                },
                fail: (err: IAPIError) => {
                    this.errToast(err);
                    if (callback) callback(err, null);
                    resolve({errMsg: err.errMsg} as TQuerySingleResult<T>);
                }
            });
        })
    }

    /**
     * 数据库查询所有
     * @param params
     * @param callback
     */
    static async all<T>(callback?: (err: IAPIError | null, datas: Array<T>) => void): Promise<TQueryResult<T>> {
        let that = new (this as any)();
        console.log(`${that.$model}.all`);
        // 查询当前用户所有的 DeviceName
        return await new Promise<TQueryResult<T>>((resolve) => {
            db.collection(that.$model).where({}).get({
                success: (res: IQueryResult) => {
                    console.log(res);
                    let datas = res.data.map((o) => new (this as any)(o));
                    if (callback) callback(null, datas);
                    resolve({data: datas} as TQueryResult<T>);
                },
                fail: (err: IAPIError) => {
                    this.errToast(err);
                    console.error('[数据库] [查询记录] 失败：', err);
                    if (callback) callback(err, []);
                    resolve({errMsg: err.errMsg} as TQueryResult<T>);
                }
            })
        })
    }

    /**
     * 条件查询数据库
     * @param condition
     * @param callback
     */
    static async query<T>(condition: IQueryCondition, callback?: (err?: IAPIError | null, datas?: Array<T>) => void): Promise<TQueryResult<T>> {
        let that = new (this as any)();
        console.log(`${that.$model}.query`);
        return await this.pageQuery<T>(condition, -1, -1, callback);
    }

    /**
     * 分页获取数据
     * @param condition 查询条件
     * @param page_size 每页数据条数
     * @param page_index 查询第几页，从0开始
     * @param callback
     */
    static async pageQuery<T>(condition: IQueryCondition, page_size: number, page_index: number, callback?: (err?: IAPIError | null, datas?: Array<T>) => void): Promise<TQueryResult<T>> {
        let that = new (this as any)();
        let query = db.collection(that.$model).where(condition);
        if (page_index >= 0 && page_size > 0) {
            console.log(`${that.$model}.pageQuery`);
            query = query.limit(page_size).skip(page_index * page_size);
        }
        return await new Promise<TQueryResult<T>>((resolve) => {
            query.get({
                success: (res: IQueryResult) => {
                    let datas = res.data.map((o) => new (this as any)(o));
                    if (callback) callback(null, datas);
                    resolve({data: datas} as TQueryResult<T>);
                },
                fail: (err: IAPIError) => {
                    this.errToast(err);
                    if (callback) callback(err, []);
                    resolve({errMsg: err.errMsg} as TQueryResult<T>);
                }
            })
        })
    }

    /**
     * 计算符合查询条件的结果数
     * @param condition
     * @param callback
     */
    static async count<T>(condition: IQueryCondition, callback?: (err: IAPIError | null, total: number) => void): Promise<ICountResult> {
        let that = new (this as any)();
        console.log(`${that.$model}.count`);
        if (callback) {
            return await new Promise<ICountResult>((resolve) => {
                db.collection(that.$model).where(condition).count({
                    success: (res: ICountResult) => {
                        if (callback) callback(null, res.total);
                        resolve(res);
                    },
                    fail: (err: IAPIError) => {
                        this.errToast(err);
                        if (callback) callback(err, -1);
                        resolve({errMsg: err.errMsg} as ICountResult);
                    }
                });
            })
        }
        return await db.collection(that.$model).where(condition).count();
    }

    /**
     * 保存
     * @param callback
     */
    async save(callback?: (err: IAPIError | null, _id: DocumentId | null) => void): Promise<IAddResult> {
        console.log(`${this.$model}.save`);
        if (callback) {
            return await new Promise<IAddResult>((resolve) => {
                db.collection(this.$model).add({
                    data: this.toJson('save'),
                    success: (res: IAddResult) => {
                        if (callback) callback(null, res._id)
                        resolve(res);
                    },
                    fail: (err: IAPIError) => {
                        if (callback) callback(err, null)
                        resolve({errMsg: err.errMsg} as IAddResult);
                    }
                });
            })
        }
        return await db.collection(this.$model).add({
            data: this.toJson('save')
        });
    }

    /**
     * 更新数据
     * @param callback
     */
    async update(callback?: (err: IAPIError | null, updated: number) => void): Promise<IUpdateResult> {
        console.log(`${this.$model}.update: ${this._id}`);
        if (callback) {
            return await new Promise<IUpdateResult>((resolve) => {
                db.collection(this.$model).doc(this._id).update({
                    data: this.toJson('update'),
                    success: (res: IUpdateResult) => {
                        if (callback) callback(null, res.stats.updated)
                        resolve(res);
                    },
                    fail: (err: IAPIError) => {
                        if (callback) callback(err, 0)
                        resolve({errMsg: err.errMsg, stats: {updated: 0}} as IUpdateResult);
                    }
                });
            })
        } else {
            return await db.collection(this.$model).doc(this._id).update({
                data: this.toJson('update')
            });
        }
    }

    /**
     * 删除数据
     * @param callback
     */
    async delete(callback?: (err: IAPIError | null, updated: number) => void): Promise<IRemoveResult> {
        console.log(`${this.$model}.update: ${this._id}`);
        if (callback) {
            return await new Promise<IRemoveResult>((resolve) => {
                db.collection(this.$model).doc(this._id).remove({
                    success: (res: IRemoveResult) => {
                        if (callback) callback(null, res.stats.removed)
                        resolve(res);
                    },
                    fail: (err: IAPIError) => {
                        if (callback) callback(err, 0)
                        resolve({errMsg: err.errMsg, stats: {removed: 0}} as IRemoveResult);
                    }, complete: (res) => {
                        console.log(res)
                    }
                });
            })
        } else {
            return await db.collection(this.$model).doc(this._id).remove();
        }
    }

    toJson(op?: string) {
        let fieldNames = Object.getOwnPropertyNames(this);
        let data = {};
        fieldNames.forEach((fieldName: string) => {
            if (this.$field && this.$field.length && !this.$field.find(t => t == fieldName)) return;
            if (this.$except && this.$except.length && this.$except.find(t => t == fieldName)) return;
            if (op == 'update') {
                if (this.$readonly.find(t => t == fieldName)) {
                    return;
                }
            }
            let val = Reflect.get(this, fieldName);
            if (val && val instanceof Object && Reflect.has(val, 'toJson')) {
                data[fieldName] = val.toJson();
            } else if (typeof val == "string" || typeof val == "number" || typeof val == "boolean" || typeof val == "object") {
                if (!fieldName.startsWith('$') && !fieldName.startsWith('_')) data[fieldName] = val;
            }
        });
        return data;
    }
}
