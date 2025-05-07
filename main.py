from fastapi import FastAPI, Form, Request
from fastapi.responses import RedirectResponse, HTMLResponse
from fastapi.templating import Jinja2Templates
from starlette.middleware.sessions import SessionMiddleware
from starlette.status import HTTP_302_FOUND
import secrets

app = FastAPI()

# 세션을 위한 미들웨어 추가
app.add_middleware(SessionMiddleware, secret_key=secrets.token_hex(16))

# 템플릿 디렉토리 설정
templates = Jinja2Templates(directory="templates")

# 여러 사용자 저장용 딕셔너리
fake_users = {}

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
async def login(request: Request, username: str = Form(...), password: str = Form(...)):
    user = fake_users.get(username)
    if user and user["password"] == password:
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
async def signup(request: Request, username: str = Form(...), password: str = Form(...)):
    if username in fake_users:
        return templates.TemplateResponse("signup.html", {"request": request, "error": "Username already exists"})
    fake_users[username] = {"username": username, "password": password}
    request.session["user"] = username
    return RedirectResponse("/", status_code=HTTP_302_FOUND)
