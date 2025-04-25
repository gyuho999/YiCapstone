from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

class Todo(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    date = db.Column(db.String(10), nullable=False)
    content = db.Column(db.String(200), nullable=False)
    is_checked = db.Column(db.Boolean, default=False)  # 네모박스 상태 (체크 여부)


class Memo(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    date = db.Column(db.String(10))  # 예: "2025-04-22"
    content = db.Column(db.Text)
