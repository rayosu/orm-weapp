import { Model } from "../index";
export class User extends Model {
    constructor(data) {
        super(data);
        this.$model = 'users'; // 对应云开发数据库集合名称
        this.name = data.name;
    }
}
