# ugly-sequelize

[Sequelize](https://sequelize.org/)의 기본적인 기능을 모방한 라이브러리입니다.

## 설치

```shell

배포 준비중

```

## 사용법

```js
// app.ts

...

import ORM from 'ugly-sequelize/index';
import Lectures from '@models/lectures';

const orm = new ORM({
    host : process.env.DB_HOST as string,
    user : process.env.DB_USER as string,
    password : process.env.DB_PW as string,
    database: process.env.DB_NAME as string,
  });

const db = { orm };

await db.orm.sync();
db.Lectures = Lectures;

await Lectures.initModel(db.orm);
...
// lectures.ts
import Model from 'ugly-sequelize/model';
import ORM from 'ugly-sequelize/index';

export default class Lecutures extends Model {
  static async initModel(orm: ORM) {
    await super.init({
      lecture_id: {
        type:'INT',
        option: 'PRIMARY KEY AUTO_INCREMENT',
      },
      lecture_category: {
        type: 'VARCHAR(50)',
        option: 'NOT NULL',
      },
      teacher_name: {
        type: 'VARCHAR(100)',
        option: 'NOT NULL',
      },
      lecture_name: {
        type: 'VARCHAR(100)',
        option: 'NOT NULL',
      },
      price: {
        type: 'INT',
        option: 'NOT NULL',
      },
      date_created: {
        type: 'TIMESTAMP',
        option: 'NOT NULL',
        default: 'current_timestamp',
      },
      date_updated: {
        type: 'TIMESTAMP',
        option: 'NOT NULL on update current_timestamp',
        default: 'current_timestamp',
      },
      lecture_description: {
        type: 'TEXT',
      },
      lecture_state: {
        type: 'INT',
        default: '0',
      },
    }, {
      orm: orm,
      tableName: 'lecture',
      charset: 'utf8mb4',
      collate: 'utf8mb4_unicode_ci',
    });
  }
}

//LecturesService.ts
...

import Lectures from '@models/lectures';
await Lectures.update({ ...body }, { option: `WHERE lecture_id = ${id}` });

...

```

## 설명

ugly-sequelize의 동작원리는 Model 객체에서 sql 쿼리문을 만들고 Model 객체에 속한 orm 객체가 mysql2 라이브러리를 통해 처리해주는 방식입니다.

create 메서드 예시 

```js

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
  
    const [ { insertId } ] = await this.sequelize.execute(sql); // 가공한 sql문 실행시켜 결과 값을 받아온다!

    return insertId;

```

### 모델 만들기

```js
import Model from 'ugly-sequelize/model';
import ORM from 'ugly-sequelize/index';
```

에서 불러온 Model과 ORM을 이용하여 모델 타입을 지정합니다.

실제 Sequelize와 유사하게 super.init을 호출시켜 컬럼 정보가 담긴 객체와 Model 관련 정보를 넣어줍니다.

컬럼 정보는 type(컬럼 타입), option(컬럼 추가 옵션), default(컬럼 기본 값)로 나뉩니다.
Model 정보는 orm(app.ts에서 생성한 orm 객체), tableName(테이블 이름), charset, collate을 추가해줍니다.

추가로 외래키 설정은 hasMany를 사용하여 설정할 수 있습니다.

```js

db.CreatedLectures.hasMany(db.Lectures, { foreignKey : 'create_lecture_id', targetKey : 'lecture_id', option: 'ON DELETE CASCADE' });

```

### 모델 이용하기

만들어진 모델을 바탕으로 다음과 같은 메서드를 사용할 수 있습니다.

```js

await Lectures.create(body);

await Lectures.findAll({ option: `WHERE lecture_id = ${id}` });

await Lectures.findAll({
      includes: {
        type: 'LEFT',   // JOIN type 설정
        curModel: { // 
          tableName: 'lecture',
          attribute: [
            'lecture_id', 'lecture_category', 'teacher_name', 'lecture_name', 'price', 
            'date_created', 'date_updated', 'lecture_description', 'lecture_state',
          ],
        },
        desModel: {
          tableName: 'added_lectures',
          attribute: [],
        },
        on: 'lecture.lecture_id = added_lectures.lecture_id',
      },
      col: ['*'],
      option: `WHERE (user_id LIKE '%${src}%' OR lecture_name LIKE '%${src}%' OR teacher_name LIKE '%${src}%') AND lecture_state=1 LIMIT 20 OFFSET ${(page - 1) * 20}`,
    });

await Lectures.update({ ...body }, { option: `WHERE lecture_id = ${id}` }); //body는 { 컬럼이름: 컬럼값 }으로 하는 객체

await Lectures.destroy({ option: `WHERE lecture_id = ${id}` });

```

### 각 메서드 사용방법

WIP
    