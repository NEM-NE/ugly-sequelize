import ORM from '@/index';

export interface IDB{
  [key: string]: any;
  orm: ORM,
}
  
export interface IORMConfig {
  host: string,
  user: string,
  password: string,
  database: string
}

export interface IColumnsInfo {
  [colName: string]: IColumnInfo
}
  
export interface IModelInfo {
  orm: ORM,
  tableName: string,
  charset?: 'utf8mb4' | 'utf8',
  collate?: 'utf8mb4_unicode_ci' | 'ut8_general_ci',
}
  
export interface IKeyInfo {
  foreignKey: string,
  targetKey: string,
  option?: string
}
  
export interface IColumnInfo {
  type: string,
  option?: string,
  default?: string,
}

export interface IJoinInfo {
  type: '' | 'LEFT' | 'RIGHT' | 'CROSS',
  curModel: {
    tableName: string,
    attribute: string[],
  }
  desModel: {
    tableName: string,
    attribute: string[],
  }
  on: string
}

export interface IFindAllParameters {
  includes?: IJoinInfo,
  option?: string,
  offset?: number,
  limit?: number,
  col?: string[],
}

export interface ICreateParameters {
  [col: string]: any;
}

export interface IFindColInfo {
  option: string
}