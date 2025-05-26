from fastapi import FastAPI, Form, Request, Depends
from fastapi.responses import RedirectResponse, HTMLResponse
from fastapi.templating import Jinja2Templates
from starlette.middleware.sessions import SessionMiddleware
from starlette.status import HTTP_302_FOUND
import secrets
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from database import SessionLocal, engine
from models import User, Base

app = FastAPI()

# 세션을 위한 미들웨어 추가
app.add_middleware(SessionMiddleware, secret_key=secrets.token_hex(16))

# 템플릿 디렉토리 설정
templates = Jinja2Templates(directory="templates")

# 데이터베이스 초기화
Base.metadata.create_all(bind=engine)

# DB 세션 의존성
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# 홈 페이지
@app.get("/", response_class=HTMLResponse)
async def home(request: Request):
    user = request.session.get("user")
    return templates.TemplateResponse("home.html", {"request": request, "user": user})

# 로그인 폼 페이지
@app.get("/login", response_class=HTMLResponse)
async def login_form(request: Request):
    return templates.TemplateResponse("login.html", {"request": request})

# 로그인 처리
@app.post("/login")
async def login(request: Request, username: str = Form(...), password: str = Form(...), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == username).first()
    if user and user.password == password:
        request.session["user"] = username
        return RedirectResponse("/", status_code=HTTP_302_FOUND)
    return templates.TemplateResponse("login.html", {"request": request, "error": "Invalid credentials"})

# 로그아웃
@app.get("/logout")
async def logout(request: Request):
    request.session.clear()
    return RedirectResponse("/", status_code=HTTP_302_FOUND)

# 회원가입 폼 페이지
@app.get("/signup", response_class=HTMLResponse)
async def signup_form(request: Request):
    return templates.TemplateResponse("signup.html", {"request": request})

# 회원가입 처리
@app.post("/signup")
async def signup(request: Request, username: str = Form(...), password: str = Form(...), db: Session = Depends(get_db)):
    existing_user = db.query(User).filter(User.username == username).first()
    if existing_user:
        return templates.TemplateResponse("signup.html", {"request": request, "error": "Username already exists"})
    
    new_user = User(username=username, password=password)
    db.add(new_user)
    db.commit()
    request.session["user"] = username
    return RedirectResponse("/", status_code=HTTP_302_FOUND)

#프론트엔드와 도메인이 다르면 이거 실행
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # 프론트엔드 실행 주소
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)