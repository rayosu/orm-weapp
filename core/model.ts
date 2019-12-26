import IUpdateResult = DB.IUpdateResult;
import IQueryResult = DB.IQueryResult;
import IAddResult = DB.IAddResult;
import IQuerySingleResult = DB.IQuerySingleResult;
import IQueryCondition = DB.IQueryCondition;
import ICountResult = DB.ICountResult;
import DocumentId = DB.DocumentId;

const db = wx.cloud.database();

export abstract class Model {
    protected $model = 'NotSet';
    public _id: DocumentId;

    protected constructor(data: any) {
    }

    private static errToast(err: IAPIError) {
        if(getApp().globalData.platform == 'devtools')
        {
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
    static async get<T>(_id: string, callback?: (err: IAPIError | null, entity: T | null) => void): Promise<IQuerySingleResult> {
        let that = new (this as any)();
        console.log(`${that.$model}.get: ${_id}`);
        return await db.collection(that.$model).doc(_id).get({
            success: (res: IQuerySingleResult) => {
                let entity = new (this as any)(res.data);
                if (callback) callback(null, entity);
            },
            fail: (err: IAPIError) => {
                this.errToast(err);
                if (callback) callback(err, null);
            }
        });
    }

    /**
     * 数据库查询所有
     * @param params
     * @param callback
     */
    static async all<T>(callback?: (err: IAPIError | null, datas: Array<T>) => void): Promise<IQueryResult> {
        let that = new (this as any)();
        console.log(`${that.$model}.all`);
        // 查询当前用户所有的 DeviceName
        return await db.collection(that.$model).where({}).get({
            success: (res: IQueryResult) => {
                let datas = res.data.map((o) => new (this as any)(o));
                if (callback) callback(null, datas);
            },
            fail: (err: IAPIError) => {
                this.errToast(err);
                console.error('[数据库] [查询记录] 失败：', err);
                if (callback) callback(err, []);
            }
        })
    }

    /**
     * 条件查询数据库
     * @param condition
     * @param callback
     */
    static async query<T>(condition: IQueryCondition, callback?: (err: IAPIError | null, datas: Array<T>) => void): Promise<IQueryResult> {
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
    static async pageQuery<T>(condition: IQueryCondition, page_size: number, page_index: number, callback?: (err: IAPIError | null, datas: Array<T>) => void): Promise<IQueryResult> {
        let that = new (this as any)();
        let query = db.collection(that.$model).where(condition);
        if (page_index >= 0 && page_size > 0) {
            console.log(`${that.$model}.pageQuery`);
            query = query.limit(page_size).skip(page_index * page_size);
        }
        return await query.get({
            success: (res: IQueryResult) => {
                let datas = res.data.map((o) => new (this as any)(o));
                if (callback) callback(null, datas);
            },
            fail: (err: IAPIError) => {
                this.errToast(err);
                if (callback) callback(err, []);
            }
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
        return await db.collection(that.$model).where(condition).count({
            success: (res: ICountResult) => {
                if (callback) callback(null, res.total);
            },
            fail: (err: IAPIError) => {
                this.errToast(err);
                if (callback) callback(err, -1);
            }
        });
    }

    /**
     * 插入设备到数据库
     * @param callback
     */
    async save(callback?: (err: IAPIError | null, _id: DocumentId | null) => void): Promise<IAddResult> {
        console.log(`${this.$model}.save`);
        return await db.collection(this.$model).add({
            data: this.toJson(),
            success: (res: IAddResult) => {
                if (callback) callback(null, res._id)
            },
            fail: (err: IAPIError) => {
                if (callback) callback(err, null)
            }
        });
    }

    /**
     *更新数据
     * @param callback
     */
    async update(callback?: (err: IAPIError | null, updated: number) => void): Promise<IUpdateResult> {
        console.log(`${this.$model}.update: ${this._id}`);
        return await db.collection(this.$model).doc(this._id).update({
            data: this.toJson(),
            success: (res: IUpdateResult) => {
                if (callback) callback(null, res.stats.updated)
            },
            fail: (err: IAPIError) => {
                if (callback) callback(err, 0)
            }, complete: (res) => {
                console.log(res)
            }
        });
    }

    toJson() {
        let fieldNames = Object.getOwnPropertyNames(this);
        let data = {};
        fieldNames.forEach((fieldName: string) => {

            let val = Reflect.get(this, fieldName);
            if (typeof val == "string" || typeof val == "number" || typeof val == "boolean" || typeof val == "object") {
                if (fieldName != '_id' && fieldName != '_openid' && fieldName != '$model') data[fieldName] = val;

            } else if (val && val instanceof Object && Reflect.has(val, 'toJson')) {
                val = val.toJson();
                data[fieldName] = val;
            }
        });
        return data;
    }
}
