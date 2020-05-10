import CallFunctionResult = ICloud.CallFunctionResult;
import IGetDocumentOptions = DB.IGetDocumentOptions;
import IQueryCondition = DB.IQueryCondition;
import IRemoveSingleDocumentOptions = DB.IRemoveSingleDocumentOptions;
import IUpdateSingleDocumentOptions = DB.IUpdateSingleDocumentOptions;
import IAddDocumentOptions = DB.IAddDocumentOptions;
import ICountDocumentOptions = DB.ICountDocumentOptions;

type Optional<T> = { [K in keyof T]+?: T[K] }

type RQ<T extends Optional<Record<'complete' | 'success' | 'fail', (...args: any[]) => any>>> = Pick<T, Exclude<keyof T, 'complete' | 'success' | 'fail'>>

type OQ<T extends Optional<Record<'complete' | 'success' | 'fail', (...args: any[]) => any>>> =
    | (RQ<T> & Required<Pick<T, 'success'>>)
    | (RQ<T> & Required<Pick<T, 'fail'>>)
    | (RQ<T> & Required<Pick<T, 'complete'>>)
    | (RQ<T> & Required<Pick<T, 'success' | 'fail'>>)
    | (RQ<T> & Required<Pick<T, 'success' | 'complete'>>)
    | (RQ<T> & Required<Pick<T, 'fail' | 'complete'>>)
    | (RQ<T> & Required<Pick<T, 'fail' | 'complete' | 'success'>>)

export class Rpc {
    protected $collection: string;
    protected $doc: string;
    protected $data: any;
    protected $where: any;
    protected $limit: number = -1;
    protected $skip: number = -1;
    protected $action: string;

    private constructor() {
    }

    static collection(collectionName: string): Rpc {
        let rpc = new Rpc();
        rpc.$collection = collectionName;
        return rpc;
    }

    public doc(doc): Rpc {
        this.$doc = doc;
        return this;
    }

    public where(condition: IQueryCondition): Rpc {
        this.$where = condition;
        return this;
    }

    public limit(limit): Rpc {
        this.$limit = limit;
        return this;
    }

    public skip(skip): Rpc {
        this.$skip = skip;
        return this;
    }

    public add(options: OQ<IAddDocumentOptions>) {
        this.$action = 'add';
        this.$data = options['data'];
        delete options['data'];
        this.invoke(options);
    }

    public update(options: OQ<IUpdateSingleDocumentOptions>) {
        this.$action = 'update';
        this.$data = options['data'];
        delete options['data'];
        this.invoke(options);
    }

    public remove(options: OQ<IRemoveSingleDocumentOptions>) {
        this.$action = 'remove';
        this.invoke(options);
    }

    public count(options: OQ<ICountDocumentOptions>) {
        this.$action = 'count';
        this.invoke(options);
    }

    public get(options: OQ<IGetDocumentOptions>) {
        this.$action = 'get';
        this.invoke(options);
    }

    private invoke(options) {
        let success = options['success'];
        let fail = options['fail'];
        let data = Object.assign(options, {
            $collection: this.$collection,
            $action: this.$action
        });
        if (this.$doc) data['$doc'] = this.$doc;
        if (this.$data) data['$data'] = this.$data;
        if (this.$where) data['$where'] = this.$where;
        if (this.$limit >= 0) data['$limit'] = this.$limit;
        if (this.$skip >= 0) data['$skip'] = this.$skip;
        wx.cloud.callFunction(Object.assign({
            name: 'model',
            data: data
        }, {
            success: (result: CallFunctionResult) => {
                console.debug('remote.invoke', result.result);
                if (success) success(result.result);
            },
            fail: (err: IAPIError) => {
                if (fail) fail(err);
            }
        }));
    }
}
