from flask import Flask, request, jsonify
from flask_cors import CORS
from models import db, Todo, Memo
import os

app = Flask(__name__)
CORS(app)

# ✅ 절대경로로 DB 파일 위치 고정
basedir = os.path.abspath(os.path.dirname(__file__))
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///' + os.path.join(basedir, 'db.sqlite3')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db.init_app(app)

# 데이터베이스 테이블이 없다면 생성
with app.app_context():
    db.create_all()  # 테이블 생성

# --- 할 일 API ---
@app.route('/todos', methods=['POST'])
def add_todo():
    data = request.json
    print("받은 데이터:", data)  # 요청 데이터 확인 로그

    try:
        new_todo = Todo(
            date=data['date'],
            content=data['content'],
            is_checked=data.get('is_checked', False)  # 네모박스 상태 포함
        )
        db.session.add(new_todo)
        db.session.commit()
        return jsonify({'message': '할 일 저장 완료'})

    except Exception as e:
        db.session.rollback()  # 트랜잭션 취소해서 DB 잠금 방지
        print("에러 발생:", str(e))
        return jsonify({'error': '할 일 저장 실패', 'details': str(e)}), 500



@app.route('/todos', methods=['GET'])
def get_todos():
    date = request.args.get('date')
    todos = Todo.query.filter_by(date=date).all()
    return jsonify([{'id': t.id, 'content': t.content, 'is_checked': t.is_checked, 'date' : t.date} for t in todos])


@app.route('/todos/<int:id>', methods=['PUT'])
def update_todo(id):
    todo = Todo.query.get(id)
    
    if todo:
        # 요청에서 is_checked 값을 가져와서 할 일의 상태를 변경
        todo.is_checked = request.json.get('is_checked', todo.is_checked)
        
        db.session.commit()  # 변경사항을 DB에 저장
        
        return jsonify({"message": "Todo updated successfully", "todo": {"id": todo.id, "is_checked": todo.is_checked}}), 200
    return jsonify({"message": "Todo not found"}), 404


@app.route('/todos/<int:id>', methods=['DELETE'])
def delete_todo(id):
    todo = Todo.query.get(id)  # URL에서 id를 가져옴
    if todo:
        db.session.delete(todo)
        db.session.commit()
        return jsonify({'message': 'Todo deleted successfully'}), 200
    return jsonify({'error': 'Todo not found'}), 404


# --- 메모 API ---
@app.route('/memos', methods=['POST'])
def add_or_update_memo():
    data = request.json
    try:
        existing = Memo.query.filter_by(date=data['date']).first()

        if existing:
            existing.content = data['content']
            message = '메모 수정 완료'
        else:
            new_memo = Memo(date=data['date'], content=data['content'])
            db.session.add(new_memo)
            message = '메모 저장 완료'

        db.session.commit()
        return jsonify({'message': message})
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500



@app.route('/memos', methods=['GET'])
def get_memo():
    date = request.args.get('date')
    memo = Memo.query.filter_by(date=date).first()
    return jsonify({'content': memo.content if memo else ''})

if __name__ == '__main__':
    app.run(debug=True)
