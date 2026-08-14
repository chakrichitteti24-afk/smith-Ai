"""
server/database.py

Supabase Database Adapter with SQLite Local Fallback for Smith AI Backend
"""

import os
import json
import sqlite3
import logging
import httpx
from pathlib import Path
from config import SUPABASE_URL, SUPABASE_KEY

logger = logging.getLogger("smith_ai.database")

DB_DIR = Path(__file__).resolve().parent / "data"
DB_FILE = DB_DIR / "smith_ai.db"

class AsyncCursor:
    def __init__(self, data_fetcher):
        self._fetcher = data_fetcher
        self._skip_val = 0
        self._limit_val = 100
        self._sort_key = None
        self._sort_dir = 1

    def skip(self, skip_val):
        self._skip_val = skip_val
        return self

    def limit(self, limit_val):
        self._limit_val = limit_val
        return self

    def sort(self, key, direction=1):
        self._sort_key = key
        self._sort_dir = direction
        return self

    async def to_list(self, length=100):
        data = await self._fetcher()
        if self._sort_key:
            reverse = (self._sort_dir == -1)
            data = sorted(data, key=lambda x: x.get(self._sort_key, 0), reverse=reverse)
        
        start = self._skip_val
        end = start + min(self._limit_val, length)
        return data[start:end]

class SupabaseTable:
    def __init__(self, table_name, db_manager):
        self.table_name = table_name
        self.db = db_manager

    def _get_headers(self):
        return {
            "apikey": SUPABASE_KEY,
            "Authorization": f"Bearer {SUPABASE_KEY}",
            "Content-Type": "application/json",
            "Prefer": "return=representation"
        }

    async def find_one(self, filter_dict, projection=None):
        if not self.db.is_supabase:
            return self.db.sqlite_find_one(self.table_name, filter_dict, projection)
        
        url = f"{SUPABASE_URL}/rest/v1/{self.table_name}"
        params = {}
        for k, v in filter_dict.items():
            params[f"{k}"] = f"eq.{v}"
        params["limit"] = "1"
        
        async with httpx.AsyncClient() as client:
            try:
                res = await client.get(url, headers=self._get_headers(), params=params, timeout=1.0)
                if res.status_code == 200:
                    items = res.json()
                    if isinstance(items, list):
                        return items[0] if items else None
            except Exception as e:
                logger.error(f"[Supabase] find_one error: {e}")
        return self.db.sqlite_find_one(self.table_name, filter_dict, projection)

    def find(self, filter_dict=None, projection=None):
        filter_dict = filter_dict or {}
        
        async def fetcher():
            if not self.db.is_supabase:
                return self.db.sqlite_find(self.table_name, filter_dict, projection)
            
            url = f"{SUPABASE_URL}/rest/v1/{self.table_name}"
            params = {}
            for k, v in filter_dict.items():
                if isinstance(v, dict):
                    continue
                params[f"{k}"] = f"eq.{v}"
            
            async with httpx.AsyncClient() as client:
                try:
                    res = await client.get(url, headers=self._get_headers(), params=params, timeout=1.0)
                    if res.status_code == 200:
                        data = res.json()
                        if isinstance(data, list):
                            return data
                except Exception as e:
                    logger.error(f"[Supabase] find error: {e}")
            return self.db.sqlite_find(self.table_name, filter_dict, projection)

        return AsyncCursor(fetcher)

    async def count_documents(self, filter_dict=None):
        filter_dict = filter_dict or {}
        if not self.db.is_supabase:
            return self.db.sqlite_count(self.table_name, filter_dict)
        
        url = f"{SUPABASE_URL}/rest/v1/{self.table_name}"
        headers = self._get_headers()
        headers["Prefer"] = "count=exact"
        params = {"select": "questionId" if self.table_name == "practice_questions" else "id"}
        for k, v in filter_dict.items():
            if isinstance(v, dict):
                continue
            params[f"{k}"] = f"eq.{v}"

        async with httpx.AsyncClient() as client:
            try:
                res = await client.get(url, headers=headers, params=params, timeout=1.0)
                if res.status_code == 200:
                    content_range = res.headers.get("content-range")
                    if content_range and "/" in content_range:
                        return int(content_range.split("/")[1])
                    data = res.json()
                    if isinstance(data, list):
                        return len(data)
            except Exception as e:
                logger.error(f"[Supabase] count error: {e}")
        return self.db.sqlite_count(self.table_name, filter_dict)

    async def distinct(self, field, filter_dict=None):
        filter_dict = filter_dict or {}
        items = await self.find(filter_dict).to_list(length=1000)
        vals = set()
        for item in items:
            val = item.get(field)
            if val is not None:
                vals.add(val)
        return sorted(list(vals))

    async def update_one(self, filter_dict, update_dict, upsert=True):
        doc = update_dict.get("$set", update_dict)
        data = {**filter_dict, **doc}
        
        if not self.db.is_supabase:
            return self.db.sqlite_upsert(self.table_name, filter_dict, data)

        headers = self._get_headers()
        headers["Prefer"] = "resolution=merge-duplicates"
        url = f"{SUPABASE_URL}/rest/v1/{self.table_name}"

        async with httpx.AsyncClient() as client:
            try:
                res = await client.post(url, headers=headers, json=[data], timeout=1.0)
                if res.status_code in [200, 201]:
                    return True
            except Exception as e:
                logger.error(f"[Supabase] update_one error: {e}")
        return self.db.sqlite_upsert(self.table_name, filter_dict, data)

    async def delete_many(self, filter_dict=None):
        filter_dict = filter_dict or {}
        if not self.db.is_supabase:
            return self.db.sqlite_delete(self.table_name, filter_dict)

        url = f"{SUPABASE_URL}/rest/v1/{self.table_name}"
        params = {}
        for k, v in filter_dict.items():
            params[f"{k}"] = f"eq.{v}"

        async with httpx.AsyncClient() as client:
            try:
                res = await client.delete(url, headers=self._get_headers(), params=params, timeout=1.0)
                return res.status_code in [200, 204]
            except Exception as e:
                logger.error(f"[Supabase] delete_many error: {e}")
        return self.db.sqlite_delete(self.table_name, filter_dict)

    async def insert_many(self, documents):
        if not self.db.is_supabase:
            return self.db.sqlite_insert_many(self.table_name, documents)

        url = f"{SUPABASE_URL}/rest/v1/{self.table_name}"
        headers = self._get_headers()

        async with httpx.AsyncClient() as client:
            try:
                res = await client.post(url, headers=headers, json=documents, timeout=10.0)
                if res.status_code in [200, 201]:
                    return len(documents)
            except Exception as e:
                logger.error(f"[Supabase] insert_many error: {e}")
        return self.db.sqlite_insert_many(self.table_name, documents)


class DatabaseManager:
    def __init__(self):
        self.is_supabase = bool(SUPABASE_URL and SUPABASE_KEY and "<" not in SUPABASE_URL)
        self._init_sqlite()

    def __getitem__(self, name):
        return SupabaseTable(name, self)

    def __getattr__(self, name):
        return SupabaseTable(name, self)

    def _init_sqlite(self):
        DB_DIR.mkdir(parents=True, exist_ok=True)
        conn = sqlite3.connect(DB_FILE)
        cursor = conn.cursor()
        
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS practice_questions (
            questionId INTEGER PRIMARY KEY,
            module TEXT,
            title TEXT,
            category TEXT,
            difficulty TEXT,
            description TEXT,
            examples TEXT,
            constraints TEXT,
            supportedLanguages TEXT,
            starterCode TEXT,
            testCases TEXT,
            hiddenTestCases TEXT,
            evaluation TEXT,
            isActive INTEGER
        );
        """)
        
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS practice_progress (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            sessionId TEXT,
            questionId INTEGER,
            difficulty TEXT,
            status TEXT,
            language TEXT,
            submittedAt TEXT,
            verdict TEXT,
            UNIQUE(sessionId, questionId)
        );
        """)
        
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS sessions (
            sessionId TEXT PRIMARY KEY,
            createdAt TEXT,
            data TEXT
        );
        """)
        
        conn.commit()
        conn.close()

    def _get_conn(self):
        conn = sqlite3.connect(DB_FILE)
        conn.row_factory = sqlite3.Row
        return conn

    def sqlite_find(self, table_name, filter_dict, projection=None):
        conn = self._get_conn()
        cursor = conn.cursor()
        
        query_parts = []
        params = []
        for k, v in (filter_dict or {}).items():
            if not isinstance(v, dict):
                query_parts.append(f"{k} = ?")
                params.append(v)
        
        sql = f"SELECT * FROM {table_name}"
        if query_parts:
            sql += " WHERE " + " AND ".join(query_parts)
            
        cursor.execute(sql, params)
        rows = cursor.fetchall()
        conn.close()
        
        results = []
        for r in rows:
            d = dict(r)
            for json_field in ["examples", "constraints", "supportedLanguages", "starterCode", "testCases", "hiddenTestCases", "evaluation", "data"]:
                if json_field in d and isinstance(d[json_field], str):
                    try:
                        d[json_field] = json.loads(d[json_field])
                    except Exception:
                        pass
            if projection:
                # filter fields according to projection if requested
                d = {k: v for k, v in d.items() if projection.get(k, 1) != 0}
            results.append(d)
        return results

    def sqlite_find_one(self, table_name, filter_dict, projection=None):
        res = self.sqlite_find(table_name, filter_dict, projection)
        return res[0] if res else None

    def sqlite_count(self, table_name, filter_dict):
        items = self.sqlite_find(table_name, filter_dict)
        return len(items)

    def sqlite_upsert(self, table_name, filter_dict, data):
        conn = self._get_conn()
        cursor = conn.cursor()
        
        # Ensure table exists columns
        cursor.execute(f"PRAGMA table_info({table_name})")
        existing_cols = {row[1] for row in cursor.fetchall()}
        
        # Prepare copy of data with JSON converted to string
        row_data = {}
        for k, v in data.items():
            if existing_cols and k not in existing_cols:
                try:
                    cursor.execute(f"ALTER TABLE {table_name} ADD COLUMN {k} TEXT")
                except Exception:
                    pass
            if isinstance(v, (dict, list)):
                row_data[k] = json.dumps(v)
            else:
                row_data[k] = v
                
        columns = list(row_data.keys())
        placeholders = ", ".join(["?"] * len(columns))
        col_str = ", ".join(columns)
        update_str = ", ".join([f"{c}=EXCLUDED.{c}" for c in columns])
        
        sql = f"INSERT INTO {table_name} ({col_str}) VALUES ({placeholders}) ON CONFLICT DO UPDATE SET {update_str}"
        cursor.execute(sql, list(row_data.values()))
        conn.commit()
        conn.close()
        return True

    def sqlite_delete(self, table_name, filter_dict):
        conn = self._get_conn()
        cursor = conn.cursor()
        query_parts = []
        params = []
        for k, v in filter_dict.items():
            query_parts.append(f"{k} = ?")
            params.append(v)
        sql = f"DELETE FROM {table_name}"
        if query_parts:
            sql += " WHERE " + " AND ".join(query_parts)
        cursor.execute(sql, params)
        conn.commit()
        conn.close()
        return True

    def sqlite_insert_many(self, table_name, documents):
        for doc in documents:
            self.sqlite_upsert(table_name, {"questionId": doc.get("questionId")}, doc)
        return len(documents)

db = DatabaseManager()

async def connect_db():
    global db
    if db.is_supabase:
        logger.info(f"[Supabase] Connected to Supabase project at {SUPABASE_URL}")
        print(f"\033[32m[Supabase]\033[0m Connected to Supabase Cloud ({SUPABASE_URL})")
    else:
        logger.info("[Database] Using SQLite Local Fallback Database")
        print("\033[32m[Database]\033[0m Using Supabase-Compatible Local Database Engine (SQLite)")
    return db

async def close_db():
    logger.info("[Database] Connection closed.")
