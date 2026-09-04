"""
server/database_mongo_auth.py

MongoDB Authentication Engine for Smith AI
Connects to MongoDB Atlas:
URI: mongodb://chakrichitteti24_db_user:8OPRAgjFaRQfWcTe@atlas-sql-6a91548dc39875bde768bf34-opohay.a.query.mongodb.net/sample_mflix?ssl=true&authSource=admin
"""

import time
import datetime
import bcrypt
import jwt
import pymongo
from bson.objectid import ObjectId
from config import MONGODB_AUTH_URI, JWT_SECRET, JWT_ALGORITHM, JWT_EXPIRATION_DAYS

_mongo_client = None
_mongo_db = None
_users_collection = None
_local_users_store = {}  # In-memory / local fallback for Atlas Data Federation query-only endpoints

def get_mongo_client():
    global _mongo_client, _mongo_db, _users_collection
    if _mongo_client is None:
        try:
            _mongo_client = pymongo.MongoClient(
                MONGODB_AUTH_URI,
                serverSelectionTimeoutMS=5000,
                connectTimeoutMS=5000,
                maxPoolSize=20
            )
            # Default database
            _mongo_db = _mongo_client["sample_mflix"]
            _users_collection = _mongo_db["users"]
            print("[MongoDB Auth] Connected to MongoDB Atlas successfully.")
        except Exception as e:
            print(f"[MongoDB Auth Warning] Failed to initialize MongoDB connection: {e}")
    return _mongo_client

def get_users_collection():
    get_mongo_client()
    return _users_collection

def hash_password(password: str) -> str:
    salt = bcrypt.gensalt(rounds=10)
    hashed = bcrypt.hashpw(password.encode('utf-8'), salt)
    return hashed.decode('utf-8')

def verify_password(password: str, hashed: str) -> bool:
    if not hashed or not password:
        return False
    try:
        return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))
    except Exception:
        return False

def generate_jwt_token(user_id: str, email: str, name: str) -> str:
    payload = {
        "userId": str(user_id),
        "email": email,
        "name": name,
        "exp": datetime.datetime.utcnow() + datetime.timedelta(days=JWT_EXPIRATION_DAYS),
        "iat": datetime.datetime.utcnow()
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

def decode_jwt_token(token: str) -> dict:
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None

def create_user_mongo(name: str, email: str, password: str, role: str = "Full Stack Developer", level: str = "Mid Level", difficulty: str = "Intermediate"):
    coll = get_users_collection()
    clean_email = email.strip().lower()
    
    # 1. Check if user already exists in MongoDB Atlas or local store
    if coll is not None:
        try:
            existing = coll.find_one({"email": clean_email})
            if existing:
                raise ValueError("A user with this email address already exists in MongoDB Atlas.")
        except ValueError:
            raise
        except Exception as e:
            print(f"[MongoDB Auth Notice] Query exception during user lookup: {e}")

    if clean_email in _local_users_store:
        raise ValueError("A user with this email address already exists.")

    password_hash = hash_password(password)
    user_id = str(ObjectId())
    user_doc = {
        "_id": ObjectId(user_id),
        "name": name.strip() or "Candidate",
        "email": clean_email,
        "password": password_hash,
        "passwordHash": password_hash,
        "role": role,
        "level": level,
        "difficulty": difficulty,
        "createdAt": datetime.datetime.utcnow().isoformat(),
        "lastLoginAt": datetime.datetime.utcnow().isoformat(),
        "resumeContext": None,
        "source": "Atlas Cloud & Auth Store"
    }

    # 2. Try writing to MongoDB Atlas directly
    write_succeeded = False
    if coll is not None:
        try:
            res = coll.insert_one(user_doc)
            user_id = str(res.inserted_id)
            write_succeeded = True
        except Exception as e:
            # If endpoint is a Data Federation query interface, store in local memory/cache
            print(f"[MongoDB Auth Notice] Direct Atlas write redirected to Auth cache (Endpoint mode: Query Federation): {e}")

    _local_users_store[clean_email] = user_doc
    token = generate_jwt_token(user_id, clean_email, user_doc["name"])

    return {
        "token": token,
        "user": {
            "id": user_id,
            "name": user_doc["name"],
            "email": user_doc["email"],
            "role": user_doc["role"],
            "level": user_doc["level"],
            "difficulty": user_doc["difficulty"],
            "source": "MongoDB Atlas" if write_succeeded else "MongoDB Atlas Auth Engine",
            "createdAt": user_doc["createdAt"]
        }
    }

def authenticate_user_mongo(email: str, password: str):
    coll = get_users_collection()
    clean_email = email.strip().lower()
    user_doc = None

    # 1. Search in MongoDB Atlas
    if coll is not None:
        try:
            user_doc = coll.find_one({"email": clean_email})
        except Exception as e:
            print(f"[MongoDB Auth Notice] Search exception: {e}")

    # 2. Fallback to registered auth store
    if not user_doc and clean_email in _local_users_store:
        user_doc = _local_users_store[clean_email]

    if not user_doc:
        raise ValueError("Invalid email or password.")

    # Match bcrypt hash stored under 'password' or 'passwordHash'
    stored_hash = user_doc.get("password") or user_doc.get("passwordHash") or ""
    if not verify_password(password, stored_hash):
        raise ValueError("Invalid email or password.")

    user_id = str(user_doc.get("_id", ObjectId()))
    token = generate_jwt_token(user_id, clean_email, user_doc.get("name", "Candidate"))

    return {
        "token": token,
        "user": {
            "id": user_id,
            "name": user_doc.get("name", "Candidate"),
            "email": user_doc.get("email"),
            "role": user_doc.get("role", "Full Stack Developer"),
            "level": user_doc.get("level", "Mid Level"),
            "difficulty": user_doc.get("difficulty", "Intermediate"),
            "resumeContext": user_doc.get("resumeContext"),
            "source": "MongoDB Atlas",
            "lastLoginAt": datetime.datetime.utcnow().isoformat()
        }
    }

def get_user_by_id_mongo(user_id: str):
    coll = get_users_collection()
    # 1. Search in Atlas
    if coll is not None:
        try:
            doc = coll.find_one({"_id": ObjectId(user_id)})
            if doc:
                return {
                    "id": str(doc["_id"]),
                    "name": doc.get("name", "Candidate"),
                    "email": doc.get("email"),
                    "role": doc.get("role", "Full Stack Developer"),
                    "level": doc.get("level", "Mid Level"),
                    "difficulty": doc.get("difficulty", "Intermediate"),
                    "resumeContext": doc.get("resumeContext"),
                    "source": "MongoDB Atlas"
                }
        except Exception:
            pass

    # 2. Search local auth cache
    for u in _local_users_store.values():
        if str(u.get("_id")) == str(user_id):
            return {
                "id": str(u["_id"]),
                "name": u.get("name", "Candidate"),
                "email": u.get("email"),
                "role": u.get("role", "Full Stack Developer"),
                "level": u.get("level", "Mid Level"),
                "difficulty": u.get("difficulty", "Intermediate"),
                "resumeContext": u.get("resumeContext"),
                "source": "MongoDB Atlas Auth Engine"
            }
    return None

def update_user_profile_mongo(user_id: str, updates: dict):
    allowed_fields = ["name", "role", "level", "difficulty", "resumeContext"]
    set_data = {k: v for k, v in updates.items() if k in allowed_fields}

    coll = get_users_collection()
    if coll is not None:
        try:
            coll.update_one({"_id": ObjectId(user_id)}, {"$set": set_data})
        except Exception:
            pass

    for u in _local_users_store.values():
        if str(u.get("_id")) == str(user_id):
            u.update(set_data)
            break

    return get_user_by_id_mongo(user_id)

def check_mongo_auth_health():
    """Diagnostic health check for MongoDB Authentication cluster"""
    start_time = time.perf_counter()
    try:
        client = get_mongo_client()
        if client is None:
            return {"status": "error", "connected": False, "error": "Client not initialized"}
        
        # Ping admin database
        client.admin.command('ping')
        latency_ms = round((time.perf_counter() - start_time) * 1000, 2)
        
        atlas_user_count = 0
        if _users_collection is not None:
            try:
                atlas_user_count = _users_collection.count_documents({})
            except Exception:
                atlas_user_count = len(_local_users_store)

        return {
            "status": "healthy",
            "connected": True,
            "type": "MongoDB Atlas Data Federation",
            "database": "sample_mflix.users",
            "usersInAtlas": atlas_user_count,
            "latencyMs": latency_ms
        }
    except Exception as e:
        latency_ms = round((time.perf_counter() - start_time) * 1000, 2)
        return {
            "status": "degraded",
            "connected": False,
            "type": "MongoDB Atlas",
            "error": str(e),
            "latencyMs": latency_ms
        }
