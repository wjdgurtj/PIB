from fastapi import FastAPI, Request, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from pydantic import BaseModel
from database import SessionLocal, engine
from models import User, Base

app = FastAPI()

# CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 특정 도메인만 허용 가능
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 데이터베이스 초기화
Base.metadata.create_all(bind=engine)

# DB 세션 의존성
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# 로그인 요청 데이터 모델 (JSON 방식)
class LoginRequest(BaseModel):
    username: str
    password: str

# 회원가입 요청 데이터 모델 (JSON 방식)
class SignupRequest(BaseModel):
    username: str
    password: str

# 로그인 처리 (JSON 형식으로 변경)
@app.post("/login")
async def login(request: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == request.username).first()
    if user and user.password == request.password:
        return {"success": True, "message": "로그인 성공", "user": {"username": request.username}}
    return {"success": False, "error": "아이디 또는 비밀번호가 잘못되었습니다."}

# 로그아웃
@app.get("/logout")
async def logout(request: Request):
    request.session.clear()
    return {"success": True, "message": "로그아웃 완료"}

# 회원가입 처리 (JSON 형식으로 변경)
@app.post("/signup")
async def signup(request: SignupRequest, db: Session = Depends(get_db)):
    existing_user = db.query(User).filter(User.username == request.username).first()
    if existing_user:
        return {"success": False, "error": "이미 존재하는 아이디입니다."}

    new_user = User(username=request.username, password=request.password)
    db.add(new_user)
    db.commit()
    return {"success": True, "message": "회원가입 성공", "user": {"username": request.username}}