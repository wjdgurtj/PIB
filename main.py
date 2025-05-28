from fastapi import FastAPI, Depends, HTTPException, status, Request, Form, Response
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from fastapi.responses import HTMLResponse, RedirectResponse
from fastapi.templating import Jinja2Templates
from fastapi.staticfiles import StaticFiles
from sqlalchemy import create_engine, Column, Integer, String, Text, DateTime, ForeignKey, Boolean
from sqlalchemy.orm import declarative_base, sessionmaker, Session, relationship
from datetime import datetime, timedelta, timezone
from typing import List, Optional
from pydantic import BaseModel
from jose import JWTError, jwt
from passlib.context import CryptContext
import uvicorn
import os

app = FastAPI()

# 템플릿 및 정적 파일 설정
templates = Jinja2Templates(directory="templates")

# static 디렉토리가 존재하는 경우에만 마운트
if os.path.exists("static"):
    app.mount("/static", StaticFiles(directory="static"), name="static")

# 데이터베이스 설정
SQLALCHEMY_DATABASE_URL = "sqlite:///./community.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# 의존성 주입 - DB 세션
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# 비밀번호 해싱 설정
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# JWT 토큰 설정
SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-change-this-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# 쿠키 설정
COOKIE_NAME = "access_token"
COOKIE_MAX_AGE = ACCESS_TOKEN_EXPIRE_MINUTES * 60  # 초 단위

# 데이터베이스 모델
class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    
    posts = relationship("Post", back_populates="author")
    comments = relationship("Comment", back_populates="author")

class Post(Base):
    __tablename__ = "posts"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    content = Column(Text)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), index=True)
    author_id = Column(Integer, ForeignKey("users.id"), index=True)
    
    author = relationship("User", back_populates="posts")
    comments = relationship("Comment", back_populates="post", cascade="all, delete-orphan")  

class Comment(Base):
    __tablename__ = "comments"
    
    id = Column(Integer, primary_key=True, index=True)
    content = Column(Text)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), index=True)
    post_id = Column(Integer, ForeignKey("posts.id"), index=True)
    author_id = Column(Integer, ForeignKey("users.id"), index=True)
    
    post = relationship("Post", back_populates="comments")
    author = relationship("User", back_populates="comments")

# Pydantic 모델
class UserCreate(BaseModel):
    username: str
    email: str
    password: str

class UserResponse(BaseModel):
    id: int
    username: str
    is_active: bool
    
    class Config:
        from_attributes = True

class PostCreate(BaseModel):
    title: str
    content: str

class PostResponse(BaseModel):
    id: int
    title: str
    content: str
    created_at: datetime
    author_id: int
    
    class Config:
        from_attributes = True

class CommentCreate(BaseModel):
    content: str

class CommentResponse(BaseModel):
    id: int
    content: str
    created_at: datetime
    post_id: int
    author_id: int
    
    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

# 데이터베이스 테이블 생성
Base.metadata.create_all(bind=engine)

# 사용자 관련 유틸리티 함수
def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def get_user(db: Session, username: str):
    return db.query(User).filter(User.username == username).first()

def get_user_by_email(db: Session, email: str):
    return db.query(User).filter(User.email == email).first()

def authenticate_user(db: Session, username: str, password: str):
    user = get_user(db, username)
    if not user:
        return False
    if not verify_password(password, user.hashed_password):
        return False
    return user

# 쿠키에서 토큰을 가져오는 함수
def get_token_from_cookie(request: Request) -> Optional[str]:
    token = request.cookies.get(COOKIE_NAME)
    return token

# 현재 사용자 가져오기 (쿠키 기반)
async def get_current_user(request: Request, db: Session = Depends(get_db)) -> Optional[User]:
    token = get_token_from_cookie(request)
    if not token:
        return None
    
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            return None
    except JWTError:
        return None
    
    user = get_user(db, username=username)
    return user

# 로그인이 필요한 현재 사용자 가져오기
async def get_current_user_required(request: Request, db: Session = Depends(get_db)) -> User:
    user = await get_current_user(request, db)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated"
        )
    return user

# 회원가입
@app.post("/register", response_model=UserResponse)
def register_user(user: UserCreate, db: Session = Depends(get_db)):
    # 사용자명 중복 체크
    db_user = get_user(db, username=user.username)
    if db_user:
        raise HTTPException(status_code=400, detail="Username already registered")
    
    # 이메일 중복 체크
    db_user_email = get_user_by_email(db, email=user.email)
    if db_user_email:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed_password = get_password_hash(user.password)
    db_user = User(username=user.username, email=user.email, hashed_password=hashed_password)
    
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

# 폼 기반 회원가입
@app.post("/register/form")
async def register_form(
    username: str = Form(...),
    email: str = Form(...),
    password: str = Form(...),
    db: Session = Depends(get_db)
):
    try:
        # 사용자명 중복 체크
        db_user = get_user(db, username=username)
        if db_user:
            raise HTTPException(status_code=400, detail="Username already registered")
        
        # 이메일 중복 체크
        db_user_email = get_user_by_email(db, email=email)
        if db_user_email:
            raise HTTPException(status_code=400, detail="Email already registered")
        
        hashed_password = get_password_hash(password)
        db_user = User(username=username, email=email, hashed_password=hashed_password)
        
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
        
        return RedirectResponse(url="/login?registered=true", status_code=303)
    except HTTPException as e:
        return RedirectResponse(url=f"/register?error={e.detail}", status_code=303)

# 로그인 및 토큰 발급 (API)
@app.post("/token", response_model=Token)
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password"
        )
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

# 폼 기반 로그인 (쿠키 설정)
@app.post("/login/form")
async def login_form(
    username: str = Form(...),
    password: str = Form(...),
    db: Session = Depends(get_db)
):
    user = authenticate_user(db, username, password)
    if not user:
        return RedirectResponse(url="/login?error=Invalid credentials", status_code=303)
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    
    response = RedirectResponse(url="/", status_code=303)
    response.set_cookie(
        key=COOKIE_NAME,
        value=access_token,
        max_age=COOKIE_MAX_AGE,
        httponly=True,
        secure=False,  # HTTPS에서는 True로 설정
        samesite="lax"
    )
    return response

# 로그아웃
@app.get("/logout")
async def logout_get():
    response = RedirectResponse(url="/", status_code=303)
    response.delete_cookie(key=COOKIE_NAME)
    return response




# 폼 기반 게시글 생성
@app.post("/posts/form")
async def create_post_form(
    title: str = Form(...),
    content: str = Form(...),
    request: Request = None,
    db: Session = Depends(get_db)
):
    current_user = await get_current_user_required(request, db)
    post = Post(title=title, content=content, author_id=current_user.id)
    db.add(post)
    db.commit()
    db.refresh(post)
    return RedirectResponse(url=f"/post/{post.id}", status_code=303)

# 모든 게시글 조회
@app.get("/posts/", response_model=List[PostResponse])
async def read_posts(skip: int = 0, limit: int = 20, db: Session = Depends(get_db)):
    posts = db.query(Post).order_by(Post.created_at.desc()).offset(skip).limit(limit).all()
    return posts

# 특정 게시글 조회
@app.get("/posts/{post_id}", response_model=PostResponse)
async def read_post(post_id: int, db: Session = Depends(get_db)):
    post = db.query(Post).filter(Post.id == post_id).first()
    if post is None:
        raise HTTPException(status_code=404, detail="Post not found")
    return post

# 게시글 수정
@app.put("/posts/{post_id}", response_model=PostResponse)
async def update_post(
    post_id: int,
    post: PostCreate,
    request: Request,
    db: Session = Depends(get_db)
):
    current_user = await get_current_user_required(request, db)
    db_post = db.query(Post).filter(Post.id == post_id).first()
    if db_post is None:
        raise HTTPException(status_code=404, detail="Post not found")
    if db_post.author_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to update this post")
    
    db_post.title = post.title
    db_post.content = post.content
    db.commit()
    db.refresh(db_post)
    return db_post

# 게시글 삭제
@app.delete("/posts/{post_id}")
async def delete_post(
    post_id: int,
    request: Request,
    db: Session = Depends(get_db)
):
    current_user = await get_current_user_required(request, db)
    db_post = db.query(Post).filter(Post.id == post_id).first()
    if db_post is None:
        raise HTTPException(status_code=404, detail="Post not found")
    if db_post.author_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this post")
    
    db.delete(db_post)
    db.commit()
    return {"detail": "Post deleted successfully"}



# 폼 기반  댓글 생성
@app.post("/posts/{post_id}/comments/form")
async def create_comment_form(
    post_id: int,
    content: str = Form(...),
    request: Request = None,
    db: Session = Depends(get_db)
):
    current_user = await get_current_user_required(request, db)
    post = db.query(Post).filter(Post.id == post_id).first()
    if post is None:
        raise HTTPException(status_code=404, detail="Post not found")
    
    db_comment = Comment(
        content=content,
        post_id=post_id,
        author_id=current_user.id
    )
    db.add(db_comment)
    db.commit()
    return RedirectResponse(url=f"/post/{post_id}", status_code=303)


# 게시글의 모든 댓글 조회
@app.get("/posts/{post_id}/comments/", response_model=List[CommentResponse])
async def read_comments(post_id: int, db: Session = Depends(get_db)):
    post = db.query(Post).filter(Post.id == post_id).first()
    if post is None:
        raise HTTPException(status_code=404, detail="Post not found")
    return db.query(Comment).filter(Comment.post_id == post_id).order_by(Comment.created_at.asc()).all()

# 홈페이지
@app.get("/", response_class=HTMLResponse)
async def home(request: Request, db: Session = Depends(get_db)):
    posts = db.query(Post).order_by(Post.created_at.desc()).limit(10).all()
    current_user = await get_current_user(request, db)
    return templates.TemplateResponse(
        "index.html", 
        {"request": request, "posts": posts, "current_user": current_user}
    )

# 로그인 페이지
@app.get("/login", response_class=HTMLResponse)
async def login_page(request: Request):
    error = request.query_params.get("error")
    registered = request.query_params.get("registered")
    return templates.TemplateResponse(
        "login.html", 
        {"request": request, "error": error, "registered": registered}
    )

# 회원가입 페이지
@app.get("/register", response_class=HTMLResponse)
async def register_page(request: Request):
    error = request.query_params.get("error")
    return templates.TemplateResponse(
        "register.html", 
        {"request": request, "error": error}
    )

# 게시글 작성 페이지
@app.get("/create-post", response_class=HTMLResponse)
async def create_post_page(request: Request, db: Session = Depends(get_db)):
    current_user = await get_current_user(request, db)
    if not current_user:
        return RedirectResponse(url="/login", status_code=303)
    return templates.TemplateResponse(
        "create_post.html", 
        {"request": request, "current_user": current_user}
    )

# 게시글 상세 페이지
@app.get("/post/{post_id}", response_class=HTMLResponse)
async def post_detail(request: Request, post_id: int, db: Session = Depends(get_db)):
    post = db.query(Post).filter(Post.id == post_id).first()
    if post is None:
        raise HTTPException(status_code=404, detail="Post not found")
    
    comments = db.query(Comment).filter(Comment.post_id == post_id).order_by(Comment.created_at.asc()).all()
    current_user = await get_current_user(request, db)
    
    return templates.TemplateResponse(
        "post_detail.html",
        {
            "request": request,
            "post": post,
            "comments": comments,
            "current_user": current_user
        }
    )

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)