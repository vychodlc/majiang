const express = require('express');
const app = express();

const cors = require('cors');
app.use(cors());

const bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

const formidable = require('express-formidable');
app.use(formidable());

const mysql = require('mysql');
const conn = mysql.createConnection({
    host:'localhost',
    user:'root',
    password:'root',
    database:'majiang',
})
conn.connect()

app.listen(3307, () => {
  console.log('——————————服务已启动——————————');
})

app.get('/', (req, res) => {
  res.send('<p style="color:red">服务已启动</p>');
})
// USER
app.post('/user/register', (req, res) => {
  let formdata = req.fields;
  let sqlStr = `SELECT * FROM user where name='${formdata.name}'`;
  conn.query(sqlStr, (error, results) => {
    if(results.length==0) {
      sqlStr = `INSERT INTO user (name,password) VALUES ('${formdata.name}','${formdata.password}')`;
      conn.query(sql, (error, results) => {
        res.json({ code: 200, message: '注册成功'});
      })
    } else {
      res.json({ code: 201, message: '用户已存在'});
    }
  })
})
app.post('/user/login', (req, res) => {
  let formdata = req.fields;
  let sqlStr = `SELECT * FROM user where name='${formdata.name}'`;
  conn.query(sqlStr, (error, results) => {
    if(results.length==0) {
      res.json({ code: 201, message: '用户不存在'});
    } else {
      let result = results[0];
      if(result.password==formdata.password) {
        res.json({ code: 200, message: '登陆成功'});
      } else {      
        res.json({ code: 202, message: '密码错误'});
      }
    }
  })
})
app.get('/user/getList', (req, res) => {
  const sqlStr = 'SELECT * FROM user'
  conn.query(sqlStr, (error, results) => {
    if (error) return res.json({ code: 201, message: error})
    res.json({ code: 200, message: results});
  })
})
// ROOM
app.get('/room/getList', (req,res) => {
  const sqlStr = `SELECT * FROM room`;
  conn.query(sqlStr, (error, results) => {
    if (error) return res.json({ code: 201, message: error})
    res.json({ code: 200, message: results});
  })
})
app.get('/room/changeState', (req,res) => {
  let id = parseInt(req.query.id);
  let state = parseInt(req.query.state);
  let sqlStr = `SELECT * FROM room where id='${id}';`
  conn.query(sqlStr, (error, results) => {
    if(results.length!=0) {
      let room = results[0];
      if(state==room.state) {
        res.json({ code: 202, message: '状态修改失败'});
      } else if(state==room.members.split(',').length!=4) {
          res.json({ code: 203, message: '未满员，无法开启游戏'});
      } else {    
        sqlStr = `UPDATE room SET state=${state} WHERE id=${id};`
        conn.query(sqlStr, (error, results) => {
          res.json({ code: 200, message: '状态修改成功', state: state==1?1:0});
        })
      }
    } else {
      res.json({ code: 201, message: '当前房间不存在'});
    }
  })
})
app.post('/room/addPlayer', (req,res) => {
  let formdata = req.fields;
  let roomId = formdata.roomId;
  let userId = formdata.userId;
  let sqlStr = `SELECT * FROM room where id='${roomId}'`;
  conn.query(sqlStr, (error, results) => {
    if(results.length==0) {
      res.json({ code: 201, message: '房间不存在'});
    } else {
      let result = results[0];
      let users = result.members==''?[]:result.members.split(',');
      if(users.indexOf(userId)==-1) {
        if(users.length==4) {
          res.json({ code: 201, message: '当前房间已满员'});
        } else {
          users.push(userId);
          users = users.join(',');
          sqlStr = `UPDATE room SET members='${users}' WHERE id=${roomId};`
          conn.query(sqlStr, (error, results) => {
            res.json({ code: 200, message: '玩家添加成功'});
          })
        }
      } else {      
        res.json({ code: 201, message: '玩家已在当前房间'});
      }
    }
  })
})
app.post('/room/delPlayer', (req,res) => {
  let formdata = req.fields;
  let roomId = formdata.roomId;
  let userId = formdata.userId;
  let sqlStr = `SELECT * FROM room where id='${roomId}'`;
  conn.query(sqlStr, (error, results) => {
    if(results.length==0) {
      res.json({ code: 202, message: '房间不存在'});
    } else {
      let result = results[0];
      let users = result.members==''?[]:result.members.split(',');
      if(users.indexOf(userId)!=-1) {
        if(users.length==0) {
          res.json({ code: 203, message: '当前房间无玩家'});
        } else {
          if(userId==roomId) {
            sqlStr = `UPDATE room SET state=0, members='' WHERE id=${roomId};`
            conn.query(sqlStr, (error, results) => {
              res.json({ code: 200, message: '房主退出，房间关闭'});
            })
          } else {
            users.splice(users.indexOf(userId),1);
            users = users.join(',');
            sqlStr = `UPDATE room SET members='${users}' WHERE id=${roomId};`
            conn.query(sqlStr, (error, results) => {
              res.json({ code: 200, message: '玩家退出成功'});
            })
          }
        }
      } else {      
        res.json({ code: 201, message: '玩家不在当前房间'});
      }
    }
  })
})
app.post('/room/closeRoom', (req,res) => {
  let formdata = req.fields;
  console.log();
  let id = parseInt(formdata.roomId);
  let sqlStr = `SELECT * FROM room where id='${id}';`
  conn.query(sqlStr, (error, results) => {
    if(results.length!=0) {
      let room = results[0];
      if(room.state==0) {
        res.json({ code: 202, message: '当前房间未启用'});
      } else {    
        sqlStr = `UPDATE room SET state=0, members='' WHERE id=${id};`
        conn.query(sqlStr, (error, results) => {
          res.json({ code: 200, message: '房间关闭成功'});
        })
      }
    } else {
      res.json({ code: 201, message: '当前房间不存在'});
    }
  })
})