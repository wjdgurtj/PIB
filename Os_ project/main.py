from fastapi import FastAPI, Form, Request, Depends, HTTPException, status
from fastapi.responses import RedirectResponse, HTMLResponse, JSONResponse
from fastapi.templating import Jinja2Templates
from starlette.middleware.sessions import SessionMiddleware
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from pydantic import BaseModel
from fastapi.encoders import jsonable_encoder
import secrets

from database import SessionLocal, engine
from models import User, Base

app = FastAPI()

# ▶ 세션 및 CORS 설정
app.add_middleware(SessionMiddleware, secret_key=secrets.token_hex(16))

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # React와 연동할 때 포트 맞춰줘야 함
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ▶ Jinja2 템플릿 디렉토리 (필요 시 사용)
templates = Jinja2Templates(directory="templates")

# ▶ DB 테이블 생성
Base.metadata.create_all(bind=engine)

# ▶ DB 세션 연결 함수
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# ▶ 회원가입 요청 데이터 모델
class SignupRequest(BaseModel):
    username: str
    password: str
    nickname: str
    phone: str

# ▶ 로그인 요청 데이터 모델
class LoginRequest(BaseModel):
    username: str
    password: str

# ▶ 회원가입 API
@app.post("/api/signup")
async def api_signup(data: SignupRequest, db: Session = Depends(get_db)):
    existing_user = db.query(User).filter(User.username == data.username).first()
    if existing_user:
        return JSONResponse(status_code=400, content={"detail": "이미 존재하는 사용자입니다"})

    new_user = User(
        username=data.username,
        password=data.password,
        nickname=data.nickname,
        phone=data.phone
    )
    db.add(new_user)
    db.commit()
    return {"message": "회원가입 성공!"}

# ▶ 로그인 API
@app.post("/api/login")
def login(data: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == data.username).first()
    if not user or user.password != data.password:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="아이디 또는 비밀번호가 틀렸습니다.")
    return {"message": "로그인 성공", "nickname": user.nickname}

# ▶ 사용자 전체 목록 조회 API
@app.get("/api/users")
def get_users(db: Session = Depends(get_db)):
    users = db.query(User).all()
    if not users:
        raise HTTPException(status_code=404, detail="등록된 사용자가 없습니다")
    return jsonable_encoder(users)
