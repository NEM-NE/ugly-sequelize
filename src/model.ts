import { IColumnsInfo, IModelInfo, IKeyInfo, IFindAllParameters, IJoinInfo, ICreateParameters, IFindColInfo } from '@type/modelType';
import ORM from '@/index';

export default class Model {
  public static colInfo: IColumnsInfo;

  public static sequelize: ORM;

  public static tableName: string | undefined;

  static async init(colInfo: IColumnsInfo, modelInfo: IModelInfo) {
    this.colInfo = colInfo;
    this.tableName = modelInfo.tableName;
    this.sequelize = modelInfo.orm;

    await this.createTable(colInfo, modelInfo);
  }

  static hasMany(tableInfo: any, keyInfo: IKeyInfo) {
    const sql = `ALTER TABLE ${this.tableName} ADD CONSTRAINT ${keyInfo.foreignKey} FOREIGN KEY (${keyInfo.foreignKey}) REFERENCES ${tableInfo.tableName}(${keyInfo.targetKey}) ${keyInfo.option};`;
    this.sequelize.execute(`DESC ${this.tableName}`)
      .then(async (result: any) => {
        const { Key } = result[0].find((cur: any) => cur.Field === `${keyInfo.foreignKey}`);
        if (Key === '') await this.sequelize.execute(sql);
      });
  }

  static async createTable(colInfo: IColumnsInfo, modelInfo: IModelInfo) {
    let sql = `CREATE TABLE IF NOT EXISTS ${this.tableName} (`;

    sql += Object.entries(colInfo).reduce((acc, cur, index, ary) => {
      let colOpt = `${cur[0]} ${cur[1].type} ${cur[1].option !== undefined ? cur[1].option : ''} ${cur[1].default !== undefined ? 'default ' + cur[1].default : ''}`;
      colOpt += (index !== ary.length - 1) ? ', ' : ')';

      return acc + colOpt;
    }, '');

    sql += Object.entries(modelInfo).reduce((acc, cur) => {
      return acc + ((cur[0] === 'tableName' || cur[0] === 'orm') ? '' : ` ${cur[0]}=${cur[1]}`);
    }, '');

    sql += ';';

    await this.sequelize.init(sql);
  }

  static async create( option: ICreateParameters ) {
    let sql = `INSERT INTO ${this.tableName} `;

    sql += Object.entries(option)
      .reduce((acc, cur, idx, ary) => {
        return acc +  cur[0] + ((idx === ary.length - 1) ? ')' : ', ');
      }, '(');
  
    sql += ' VALUES ';

    sql += Object.entries(option)
      .reduce((acc, cur, idx, ary) => {
        const str = 
        (this.colInfo[cur[0]].type.includes('VARCHAR') 
        || this.colInfo[cur[0]].type.includes('TEXT') 
        || this.colInfo[cur[0]].type.includes('DATE')) 
          ? `"${cur[1]}"` : cur[1];   
        return acc + str + ((idx === ary.length - 1) ? ')' : ', ');
      }, '(');
  
    sql += ';';
  
    const [ { insertId } ] = await this.sequelize.execute(sql);

    return insertId;
  }

  static join(include: IJoinInfo) {
    let sql = 'SELECT DISTINCT ';
        
    let curModelAttr = include.curModel.attribute
      .reduce((str, attr) => str + `${include.curModel.tableName}.${attr}, `, '');

    curModelAttr = (include.desModel.attribute.length === 0) ? curModelAttr.substring(0, curModelAttr.length - 2) + ' ' : curModelAttr;

    const desModelAttr = include.desModel.attribute
      .reduce((str, attr, idx, src) => 
        (idx === src.length - 1) 
          ? str + `${include.desModel.tableName}.${attr} ` 
          : str + `${include.desModel.tableName}.${attr}, `
      , '');
    
    sql += curModelAttr + desModelAttr + `FROM ${include.curModel.tableName} ${include.type} JOIN ${include.desModel.tableName} ON ${include.on} `;

    return sql;

  }

  static async findAll(opt: IFindAllParameters) {
    let sql = `SELECT ${opt.col?.toString() || '*'} FROM ${this.tableName} `;

    sql = (opt.includes) ? this.join(opt.includes) : sql;
    sql += (opt.option) ? opt.option : '';
    sql += ';';
    
    const [ result ] = await this.sequelize.execute(sql);
    return result;
  }

  static async update(updateColInfo: ICreateParameters, findColInfo: IFindColInfo) {
    let sql = `UPDATE ${this.tableName} SET `;

    sql += Object.entries(updateColInfo).reduce((acc, cur, idx, ary) => {
      return acc + `${cur[0]}=${cur[1]}` + ((idx === ary.length - 1) ? ' ' : ', ');
    }, '');

    sql += findColInfo.option;

    sql += ';';
    
    await this.sequelize.execute(sql);

    return true;
  }

  static async destroy(findColInfo: IFindColInfo) {
    let sql = `DELETE FROM ${this.tableName} `;

    sql += findColInfo.option;
    sql += ';';

    await this.sequelize.execute(sql);

    return true;
  }


}