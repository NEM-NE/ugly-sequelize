import mysql from 'mysql2/promise';

import { IORMConfig } from '@type/modelType';

export default class ORM {

  private config: IORMConfig;

  private connectionPool: any;

  constructor(config: IORMConfig) {
    this.config = config;
    this.connectionPool = null;
  }

  init(sql: String){
    return new Promise((reslove, reject) => {
      this.connectionPool.execute(sql)
        .then((result: any) => {
          reslove(result);
        })
        .catch((err: any) => reject(err));
    });
  }

  async sync() {
    this.connectionPool = await mysql.createPool(this.config);
  }

  async execute(sql: string) {
    try {
      console.log(sql);
      const result = await this.connectionPool.execute(sql);   
      return result;
    } catch (error: any) {
      console.log(error);
    }
  }

}