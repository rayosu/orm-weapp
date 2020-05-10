export class Rpc {
    constructor() {
        this.$limit = -1;
        this.$skip = -1;
    }
    static collection(collectionName) {
        let rpc = new Rpc();
        rpc.$collection = collectionName;
        return rpc;
    }
    doc(doc) {
        this.$doc = doc;
        return this;
    }
    where(condition) {
        this.$where = condition;
        return this;
    }
    limit(limit) {
        this.$limit = limit;
        return this;
    }
    skip(skip) {
        this.$skip = skip;
        return this;
    }
    add(options) {
        this.$action = 'add';
        this.$data = options['data'];
        delete options['data'];
        this.invoke(options);
    }
    update(options) {
        this.$action = 'update';
        this.$data = options['data'];
        delete options['data'];
        this.invoke(options);
    }
    remove(options) {
        this.$action = 'remove';
        this.invoke(options);
    }
    count(options) {
        this.$action = 'count';
        this.invoke(options);
    }
    get(options) {
        this.$action = 'get';
        this.invoke(options);
    }
    invoke(options) {
        let success = options['success'];
        let fail = options['fail'];
        let data = Object.assign(options, {
            $collection: this.$collection,
            $action: this.$action
        });
        if (this.$doc)
            data['$doc'] = this.$doc;
        if (this.$data)
            data['$data'] = this.$data;
        if (this.$where)
            data['$where'] = this.$where;
        if (this.$limit >= 0)
            data['$limit'] = this.$limit;
        if (this.$skip >= 0)
            data['$skip'] = this.$skip;
        wx.cloud.callFunction(Object.assign({
            name: 'model',
            data: data
        }, {
            success: (result) => {
                console.debug('remote.invoke', result.result);
                if (success)
                    success(result.result);
            },
            fail: (err) => {
                if (fail)
                    fail(err);
            }
        }));
    }
}
