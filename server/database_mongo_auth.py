"""
server/database_mongo_auth.py

MongoDB Atlas Authentication & Profile Engine for Smith AI
Direct connection to MongoDB Atlas (smith_ai.users) with resilient SQLite ORM replication.
"""

import time
import datetime
import bcrypt
import jwt
import pymongo
from bson.objectid import ObjectId
from config import MONGODB_AUTH_URI, MONGODB_DB_NAME, JWT_SECRET, JWT_ALGORITHM, JWT_EXPIRATION_DAYS

_mongo_client = None
_mongo_db = None
_users_collection = None

def get_mongo_client():
    global _mongo_client, _mongo_db, _users_collection
    if _mongo_client is None:
        try:
            _mongo_client = pymongo.MongoClient(
                MONGODB_AUTH_URI,
                serverSelectionTimeoutMS=8000,
                connectTimeoutMS=8000,
                maxPoolSize=25,
                retryWrites=True
            )
            # Ping connection
            _mongo_client.admin.command('ping')
            _mongo_db = _mongo_client[MONGODB_DB_NAME]
            _users_collection = _mongo_db["users"]
            
            # Ensure proper indexes
            try:
                _users_collection.create_index("email", unique=True)
                _users_collection.create_index("id", unique=True)
            except Exception:
                pass
            print(f"[MongoDB Auth] Successfully connected to MongoDB Atlas ('{MONGODB_DB_NAME}.users').")
        except Exception as e:
            print(f"[MongoDB Auth Warning] Failed to initialize live MongoDB connection: {e}")
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
    clean_email = email.strip().lower()
    
    # 1. Check if user already exists in MongoDB Atlas or SQLite ORM
    coll = get_users_collection()
    if coll is not None:
        existing_mongo = coll.find_one({"email": clean_email})
        if existing_mongo:
            raise ValueError("A user with this email address already exists.")

    from database_sqlalchemy import get_user_by_email_orm, save_user_orm
    existing_orm = get_user_by_email_orm(clean_email)
    if existing_orm:
        raise ValueError("A user with this email address already exists.")

    password_hash = hash_password(password)
    user_id = str(ObjectId())
    
    user_doc = {
        "id": user_id,
        "userId": user_id,
        "name": name.strip() or "Candidate",
        "email": clean_email,
        "password": password_hash,
        "passwordHash": password_hash,
        "role": role,
        "level": level,
        "difficulty": difficulty,
        "bio": "",
        "targetCompanies": "",
        "location": "",
        "createdAt": datetime.datetime.utcnow().isoformat(),
        "lastLoginAt": datetime.datetime.utcnow().isoformat(),
        "resumeContext": None,
        "source": "MongoDB Atlas"
    }

    # 2. Persist directly to MongoDB Atlas
    if coll is not None:
        try:
            coll.insert_one(user_doc)
            print(f"[MongoDB Auth] Registered new user '{clean_email}' in MongoDB Atlas.")
        except Exception as e:
            print(f"[MongoDB Auth Notice] MongoDB write warning: {e}")

    # 3. Synchronize with local SQLite ORM for offline resilience
    try:
        save_user_orm(user_id, name, clean_email, password_hash, role, level, difficulty)
    except Exception as e:
        print(f"[SQLAlchemy User Replica Notice] {e}")

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
            "source": "MongoDB Atlas",
            "createdAt": user_doc["createdAt"]
        }
    }

def authenticate_user_mongo(email: str, password: str):
    clean_email = email.strip().lower()
    user_doc = None
    coll = get_users_collection()

    # 1. Search in MongoDB Atlas
    if coll is not None:
        try:
            user_doc = coll.find_one({"email": clean_email})
        except Exception as e:
            print(f"[MongoDB Auth Notice] Failed to query MongoDB: {e}")

    # 2. Fallback to SQLite ORM if not found in Mongo
    if not user_doc:
        from database_sqlalchemy import get_user_by_email_orm
        orm_user = get_user_by_email_orm(clean_email)
        if orm_user:
            user_doc = {
                "id": orm_user["id"],
                "userId": orm_user["id"],
                "name": orm_user["name"],
                "email": orm_user["email"],
                "password": orm_user.get("passwordHash", ""),
                "passwordHash": orm_user.get("passwordHash", ""),
                "role": orm_user["role"],
                "level": orm_user["level"],
                "difficulty": orm_user["difficulty"]
            }
            # Auto-sync user to MongoDB Atlas
            if coll is not None:
                try:
                    coll.update_one({"email": clean_email}, {"$set": user_doc}, upsert=True)
                except Exception:
                    pass

    if not user_doc:
        raise ValueError("Invalid email or password.")

    stored_hash = user_doc.get("passwordHash") or user_doc.get("password") or ""
    if not verify_password(password, stored_hash):
        raise ValueError("Invalid email or password.")

    user_id = str(user_doc.get("id") or user_doc.get("userId") or user_doc.get("_id") or ObjectId())

    # Update last login timestamp in MongoDB Atlas
    if coll is not None:
        try:
            coll.update_one(
                {"email": clean_email},
                {"$set": {"lastLoginAt": datetime.datetime.utcnow().isoformat()}}
            )
        except Exception:
            pass

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
            "source": "MongoDB Atlas",
            "lastLoginAt": datetime.datetime.utcnow().isoformat()
        }
    }

def get_user_by_id_mongo(user_id: str):
    coll = get_users_collection()
    user_id_str = str(user_id)

    # 1. Search in MongoDB Atlas
    if coll is not None:
        try:
            query = {"$or": [{"id": user_id_str}, {"userId": user_id_str}]}
            if ObjectId.is_valid(user_id_str):
                query["$or"].append({"_id": ObjectId(user_id_str)})
            u = coll.find_one(query)
            if u:
                return {
                    "id": str(u.get("id") or u.get("userId") or u.get("_id")),
                    "name": u.get("name", "Candidate"),
                    "email": u.get("email"),
                    "role": u.get("role", "Full Stack Developer"),
                    "level": u.get("level", "Mid Level"),
                    "difficulty": u.get("difficulty", "Intermediate"),
                    "bio": u.get("bio", ""),
                    "targetCompanies": u.get("targetCompanies", ""),
                    "location": u.get("location", ""),
                    "source": "MongoDB Atlas",
                    "createdAt": u.get("createdAt", "")
                }
        except Exception as e:
            print(f"[MongoDB Get User Notice] {e}")

    # 2. Fallback to SQLite ORM
    from database_sqlalchemy import get_user_by_id_orm
    orm_user = get_user_by_id_orm(user_id_str)
    if orm_user:
        return orm_user

    return None

def update_user_profile_mongo(user_id: str, updates: dict):
    allowed_fields = ["name", "role", "level", "difficulty", "bio", "targetCompanies", "location"]
    set_data = {k: v for k, v in updates.items() if k in allowed_fields}
    user_id_str = str(user_id)

    # 1. Update in MongoDB Atlas
    coll = get_users_collection()
    if coll is not None and set_data:
        try:
            query = {"$or": [{"id": user_id_str}, {"userId": user_id_str}]}
            if ObjectId.is_valid(user_id_str):
                query["$or"].append({"_id": ObjectId(user_id_str)})
            coll.update_one(query, {"$set": set_data})
        except Exception as e:
            print(f"[MongoDB Update Profile Notice] {e}")

    # 2. Update in SQLite ORM
    from database_sqlalchemy import update_user_profile_orm
    updated = update_user_profile_orm(user_id_str, set_data)

    return get_user_by_id_mongo(user_id_str)

def check_mongo_auth_health():
    """Diagnostic health check for MongoDB Atlas cluster"""
    t0 = time.time()
    try:
        client = get_mongo_client()
        if client is None:
            return {"status": "degraded", "connected": False, "error": "Client not initialized"}
        client.admin.command('ping')
        latency = round((time.time() - t0) * 1000, 2)
        coll = get_users_collection()
        user_count = coll.count_documents({}) if coll is not None else 0
        return {
            "status": "ready",
            "connected": True,
            "type": "MongoDB Atlas (Cluster0)",
            "database": f"{MONGODB_DB_NAME}.users",
            "usersInDb": user_count,
            "latencyMs": latency
        }
    except Exception as e:
        return {
            "status": "error",
            "connected": False,
            "error": str(e)
        }
