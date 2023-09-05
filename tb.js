// app.js

const express = require('express');
const mysql = require('mysql2');
const passport = require('passport');
const session = require('express-session');
const bcrypt = require('bcrypt');
const LocalStrategy = require('passport-local').Strategy;

const app = express();

// 데이터베이스 연결
const db = mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    password: '123456',
    database: 'local instance MySQL80',
  });
  
  // MySQL 데이터베이스 연결
  db.connect((err) => {
    if (err) {
      console.error('MySQL 연결 실패:', err);
    } else {
      console.log('MySQL 연결 성공');
    }
  });

// 모델 정의
// 데이터 모델 정의
const User = {
    create: (username, password, callback) => {
      // 사용자 생성 SQL 쿼리 작성
      const createUserQuery = `INSERT INTO users (username, password) VALUES (?, ?)`;
      const values = [username, password];
  
      // 쿼리 실행
      connection.query(createUserQuery, values, (err, results) => {
        if (err) {
          callback(err, null);
          return;
        }
        callback(null, results);
      });
    },
    findByUsername: (username, callback) => {
      // 사용자 조회 SQL 쿼리 작성
      const findUserQuery = `SELECT * FROM users WHERE username = ?`;
      const values = [username];
  
      // 쿼리 실행
      connection.query(findUserQuery, values, (err, results) => {
        if (err) {
          callback(err, null);
          return;
        }
        if (results.length === 0) {
          callback(null, null);
        } else {
          const user = results[0];
          callback(null, user);
        }
      });
    }
  };
  
  module.exports = User;

// 패스포트 설정
passport.use(new LocalStrategy(
  (username, password, done) => {
    User.findOne({ username: username }, (err, user) => {
      if (err) { return done(err); }
      if (!user) { return done(null, false); }
      if (!bcrypt.compareSync(password, user.password)) { return done(null, false); }
      return done(null, user);
    });
  }
));

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  User.findById(id, (err, user) => {
    done(err, user);
  });
});

// 미들웨어 설정
app.use(express.urlencoded({ extended: true }));
app.use(session({ secret: 'secret', resave: false, saveUninitialized: false }));
app.use(passport.initialize());
app.use(passport.session());

// 라우팅 설정
app.get('/', (req, res) => {
  res.send('홈 페이지');
});

app.get('/login', (req, res) => {
  res.send('로그인 페이지');
});

app.post('/login',
  passport.authenticate('local', {
    successRedirect: '/dashboard',
    failureRedirect: '/login',
  })
);

app.get('/dashboard', isAuthenticated, (req, res) => {
  res.send('대시보드 페이지');
});

app.get('/logout', (req, res) => {
  req.logout();
  res.redirect('/');
});

// 인증 미들웨어
function isAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/login');
}

// 서버 시작
const PORT = process.env.PORT || 80;
app.listen(PORT, () => {
  console.log(`서버가 포트 ${PORT}에서 실행 중입니다.`);
});
