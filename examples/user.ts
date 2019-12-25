import {Model} from "../index";

export class User extends Model {
    protected $model = 'users'; // 对应云开发数据库集合名称
    // 数据字段-用户名称
    public name: string;

    constructor(data) {
        super(data);
        this.name = data.name;
    }
}
